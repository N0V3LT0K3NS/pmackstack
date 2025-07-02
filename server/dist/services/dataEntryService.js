"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataEntryService = void 0;
const database_1 = require("../config/database");
exports.dataEntryService = {
    async submitWeeklyEntry(entryData, userId) {
        const client = await database_1.pool.connect();
        try {
            await client.query('BEGIN');
            // Check if entry already exists
            const existingCheck = await client.query('SELECT id FROM pos_weekly_data WHERE store_code = $1 AND fiscal_year = $2 AND week_number = $3', [entryData.storeCode, entryData.fiscalYear, entryData.weekNumber]);
            if (existingCheck.rows.length > 0) {
                throw new Error('Entry for this store and week already exists');
            }
            // Get the last fixed cost if not provided
            let totalFixedCost = entryData.totalFixedCost;
            if (totalFixedCost === undefined) {
                const lastFixedCostResult = await client.query('SELECT total_fixed_cost FROM pos_weekly_data WHERE store_code = $1 ORDER BY fiscal_year DESC, week_number DESC LIMIT 1', [entryData.storeCode]);
                totalFixedCost = lastFixedCostResult.rows.length > 0 ? lastFixedCostResult.rows[0].total_fixed_cost : 0;
            }
            // Calculate derived fields with overflow protection
            const variableLaborCost = entryData.variableHours * entryData.averageWage;
            const totalLaborCost = variableLaborCost + (totalFixedCost || 0);
            // Safely calculate percentages with caps to prevent overflow
            const laborPercent = entryData.totalSales > 0 ?
                Math.min((totalLaborCost / entryData.totalSales) * 100, 9999.9999) : 0;
            const variableLaborPercent = entryData.totalSales > 0 ?
                Math.min((variableLaborCost / entryData.totalSales) * 100, 9999.9999) : 0;
            const fixedLaborPercent = entryData.totalSales > 0 ?
                Math.min(((totalFixedCost || 0) / entryData.totalSales) * 100, 9999.9999) : 0;
            // Calculate ratios with safety checks for division by zero/near-zero
            const avgTransaction = entryData.numTransactions > 0 ?
                entryData.totalSales / entryData.numTransactions : 0;
            // Prevent extreme ratios from very small variable hours (minimum 0.01 hours)
            const safeVariableHours = Math.max(entryData.variableHours, 0.01);
            const salesPerLaborHour = entryData.variableHours > 0 ?
                Math.min(entryData.totalSales / safeVariableHours, 9999999999999.99) : 0;
            const transactionsPerLaborHour = entryData.variableHours > 0 ?
                Math.min(entryData.numTransactions / safeVariableHours, 9999999999.99) : 0;
            // Generate week_iso format
            const weekIso = `${entryData.fiscalYear}-${String(entryData.weekNumber).padStart(2, '0')}`;
            // Insert new entry
            const insertResult = await client.query(`
        INSERT INTO pos_weekly_data (
          store_code, fiscal_year, week_number, week_iso, total_sales, variable_hours,
          num_transactions, average_wage, total_fixed_cost, variable_labor_cost, total_labor_cost, 
          total_labor_percent, variable_labor_percent, fixed_labor_percent, avg_transaction_value,
          sales_per_labor_hour, transactions_per_labor_hour, notes, created_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW())
        RETURNING id, created_at
      `, [
                entryData.storeCode,
                entryData.fiscalYear,
                entryData.weekNumber,
                weekIso,
                entryData.totalSales,
                entryData.variableHours,
                entryData.numTransactions,
                entryData.averageWage,
                totalFixedCost,
                variableLaborCost,
                totalLaborCost,
                laborPercent,
                variableLaborPercent,
                fixedLaborPercent,
                avgTransaction,
                salesPerLaborHour,
                transactionsPerLaborHour,
                entryData.notes,
                userId
            ]);
            await client.query('COMMIT');
            return {
                id: insertResult.rows[0].id,
                createdAt: insertResult.rows[0].created_at,
                ...entryData,
                totalFixedCost,
                laborCost: totalLaborCost,
                laborPercent,
                avgTransaction,
                salesPerLaborHour,
                transactionsPerLaborHour
            };
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    },
    async importCSVData(data, userId) {
        const client = await database_1.pool.connect();
        const result = {
            successful: 0,
            failed: 0,
            errors: []
        };
        try {
            await client.query('BEGIN');
            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                try {
                    // Validate required fields
                    const requiredFields = ['storeCode', 'fiscalYear', 'weekNumber', 'totalSales', 'variableHours', 'numTransactions', 'averageWage'];
                    const missingFields = requiredFields.filter(field => !row[field] && row[field] !== 0);
                    if (missingFields.length > 0) {
                        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
                    }
                    // Parse and validate data types
                    const entryData = {
                        storeCode: String(row.storeCode).trim(),
                        fiscalYear: parseInt(row.fiscalYear),
                        weekNumber: parseInt(row.weekNumber),
                        totalSales: parseFloat(row.totalSales),
                        variableHours: parseFloat(row.variableHours),
                        numTransactions: parseInt(row.numTransactions),
                        averageWage: parseFloat(row.averageWage),
                        notes: row.notes || null
                    };
                    // Validate ranges
                    if (entryData.fiscalYear < 2020 || entryData.fiscalYear > 2030) {
                        throw new Error('Fiscal year must be between 2020 and 2030');
                    }
                    if (entryData.weekNumber < 1 || entryData.weekNumber > 53) {
                        throw new Error('Week number must be between 1 and 53');
                    }
                    if (entryData.totalSales < 0 || entryData.variableHours < 0 || entryData.numTransactions < 0 || entryData.averageWage < 0) {
                        throw new Error('Numeric values must be positive');
                    }
                    await this.submitWeeklyEntry(entryData, userId);
                    result.successful++;
                }
                catch (error) {
                    result.failed++;
                    result.errors.push(`Row ${i + 1}: ${error.message}`);
                }
            }
            await client.query('COMMIT');
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
        return result;
    },
    getCSVTemplate() {
        const headers = [
            'storeCode',
            'fiscalYear',
            'weekNumber',
            'totalSales',
            'variableHours',
            'numTransactions',
            'averageWage',
            'notes'
        ];
        const sampleRow = [
            'anna',
            '2025',
            '1',
            '15000.00',
            '120.5',
            '350',
            '15.50',
            'Sample entry'
        ];
        return [headers.join(','), sampleRow.join(',')].join('\n');
    },
    async getRecentEntries(limit = 10, storeFilter) {
        // First get the total count
        let countQuery = `
      SELECT COUNT(*) as total
      FROM pos_weekly_data pwd
      JOIN pos_stores ps ON pwd.store_code = ps.store_code
    `;
        const countParams = [];
        if (storeFilter && storeFilter.length > 0) {
            countQuery += ` WHERE pwd.store_code = ANY($1)`;
            countParams.push(storeFilter);
        }
        const countResult = await database_1.pool.query(countQuery, countParams);
        const totalCount = parseInt(countResult.rows[0].total);
        // Then get the actual data
        let query = `
      SELECT 
        pwd.*,
        ps.store_name,
        u.email as created_by_email
      FROM pos_weekly_data pwd
      JOIN pos_stores ps ON pwd.store_code = ps.store_code
      LEFT JOIN users u ON pwd.created_by = u.id
    `;
        const params = [];
        if (storeFilter && storeFilter.length > 0) {
            query += ` WHERE pwd.store_code = ANY($1)`;
            params.push(storeFilter);
        }
        query += ` ORDER BY pwd.created_at DESC LIMIT $${params.length + 1}`;
        params.push(limit);
        const result = await database_1.pool.query(query, params);
        // Convert string numbers to actual numbers for frontend compatibility
        const entries = result.rows.map(row => ({
            ...row,
            total_sales: parseFloat(row.total_sales) || 0,
            variable_hours: parseFloat(row.variable_hours) || 0,
            average_wage: parseFloat(row.average_wage) || 0,
            total_fixed_cost: parseFloat(row.total_fixed_cost) || 0,
            variable_labor_cost: parseFloat(row.variable_labor_cost) || 0,
            total_labor_cost: parseFloat(row.total_labor_cost) || 0,
            total_labor_percent: parseFloat(row.total_labor_percent) || 0,
            variable_labor_percent: parseFloat(row.variable_labor_percent) || 0,
            fixed_labor_percent: parseFloat(row.fixed_labor_percent) || 0,
            avg_transaction_value: parseFloat(row.avg_transaction_value) || 0,
            sales_per_labor_hour: parseFloat(row.sales_per_labor_hour) || 0,
            transactions_per_labor_hour: parseFloat(row.transactions_per_labor_hour) || 0,
            total_sales_py: parseFloat(row.total_sales_py) || 0,
            variable_hours_py: parseFloat(row.variable_hours_py) || 0,
            delta_sales_percent: parseFloat(row.delta_sales_percent) || 0,
            delta_hours_percent: parseFloat(row.delta_hours_percent) || 0,
            delta_total_labor_percent: parseFloat(row.delta_total_labor_percent) || 0
        }));
        return {
            entries,
            totalCount,
            showing: entries.length
        };
    },
    async getLastWeekData(storeCode) {
        const query = `
      SELECT 
        pwd.*,
        ps.store_name
      FROM pos_weekly_data pwd
      JOIN pos_stores ps ON pwd.store_code = ps.store_code
      WHERE pwd.store_code = $1
      ORDER BY pwd.fiscal_year DESC, pwd.week_number DESC
      LIMIT 1
    `;
        const result = await database_1.pool.query(query, [storeCode]);
        if (result.rows.length === 0) {
            return null;
        }
        const lastWeek = result.rows[0];
        // Calculate the next week ending date based on fiscal year and week number
        const baseDate = new Date(lastWeek.fiscal_year, 0, 1);
        const daysToAdd = (lastWeek.week_number * 7) + 6; // End of current week
        const currentWeekEnding = new Date(baseDate);
        currentWeekEnding.setDate(baseDate.getDate() + daysToAdd);
        // Next week is 7 days later
        const nextWeekEnding = new Date(currentWeekEnding);
        nextWeekEnding.setDate(currentWeekEnding.getDate() + 7);
        return {
            lastWeekData: {
                weekEnding: currentWeekEnding.toISOString().split('T')[0],
                averageWage: lastWeek.average_wage || 0,
                totalFixedCost: lastWeek.total_fixed_cost || 0,
                totalSales: lastWeek.total_sales,
                numTransactions: lastWeek.num_transactions,
                variableHours: lastWeek.variable_hours
            },
            nextWeekEnding: nextWeekEnding.toISOString().split('T')[0],
            storeName: lastWeek.store_name
        };
    },
    async getWeeklyEntryById(id) {
        const query = `
      SELECT 
        pwd.*,
        ps.store_name
      FROM pos_weekly_data pwd
      JOIN pos_stores ps ON pwd.store_code = ps.store_code
      WHERE pwd.id = $1
    `;
        const result = await database_1.pool.query(query, [id]);
        if (result.rows.length === 0)
            return null;
        const row = result.rows[0];
        return {
            ...row,
            total_sales: parseFloat(row.total_sales) || 0,
            variable_hours: parseFloat(row.variable_hours) || 0,
            average_wage: parseFloat(row.average_wage) || 0,
            total_fixed_cost: parseFloat(row.total_fixed_cost) || 0
        };
    },
    async updateWeeklyEntry(entryData, userId) {
        const client = await database_1.pool.connect();
        try {
            await client.query('BEGIN');
            // Get current entry to verify it exists
            const existing = await client.query('SELECT * FROM pos_weekly_data WHERE id = $1', [entryData.id]);
            if (existing.rows.length === 0) {
                throw new Error('Entry not found');
            }
            // Get the last fixed cost if not provided
            let totalFixedCost = entryData.totalFixedCost;
            if (totalFixedCost === undefined) {
                const lastFixedCostResult = await client.query('SELECT total_fixed_cost FROM pos_weekly_data WHERE store_code = $1 ORDER BY fiscal_year DESC, week_number DESC LIMIT 1', [entryData.storeCode]);
                totalFixedCost = lastFixedCostResult.rows.length > 0 ? lastFixedCostResult.rows[0].total_fixed_cost : 0;
            }
            // Calculate derived fields with overflow protection
            const variableLaborCost = entryData.variableHours * entryData.averageWage;
            const totalLaborCost = variableLaborCost + (totalFixedCost || 0);
            // Safely calculate percentages with caps to prevent overflow
            const laborPercent = entryData.totalSales > 0 ?
                Math.min((totalLaborCost / entryData.totalSales) * 100, 9999.9999) : 0;
            const variableLaborPercent = entryData.totalSales > 0 ?
                Math.min((variableLaborCost / entryData.totalSales) * 100, 9999.9999) : 0;
            const fixedLaborPercent = entryData.totalSales > 0 ?
                Math.min(((totalFixedCost || 0) / entryData.totalSales) * 100, 9999.9999) : 0;
            // Calculate ratios with safety checks for division by zero/near-zero
            const avgTransaction = entryData.numTransactions > 0 ?
                entryData.totalSales / entryData.numTransactions : 0;
            // Prevent extreme ratios from very small variable hours (minimum 0.01 hours)
            const safeVariableHours = Math.max(entryData.variableHours, 0.01);
            const salesPerLaborHour = entryData.variableHours > 0 ?
                Math.min(entryData.totalSales / safeVariableHours, 9999999999999.99) : 0;
            const transactionsPerLaborHour = entryData.variableHours > 0 ?
                Math.min(entryData.numTransactions / safeVariableHours, 9999999999.99) : 0;
            // Update entry
            const updateResult = await client.query(`
        UPDATE pos_weekly_data SET
          total_sales = $1,
          variable_hours = $2,
          num_transactions = $3,
          average_wage = $4,
          total_fixed_cost = $5,
          variable_labor_cost = $6,
          total_labor_cost = $7,
          total_labor_percent = $8,
          variable_labor_percent = $9,
          fixed_labor_percent = $10,
          avg_transaction_value = $11,
          sales_per_labor_hour = $12,
          transactions_per_labor_hour = $13,
          notes = $14,
          updated_at = NOW()
        WHERE id = $15
        RETURNING *
      `, [
                entryData.totalSales,
                entryData.variableHours,
                entryData.numTransactions,
                entryData.averageWage,
                totalFixedCost,
                variableLaborCost,
                totalLaborCost,
                laborPercent,
                variableLaborPercent,
                fixedLaborPercent,
                avgTransaction,
                salesPerLaborHour,
                transactionsPerLaborHour,
                entryData.notes,
                entryData.id
            ]);
            await client.query('COMMIT');
            return updateResult.rows[0];
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    },
    async deleteWeeklyEntry(id) {
        const client = await database_1.pool.connect();
        try {
            await client.query('BEGIN');
            // Check if entry exists
            const existing = await client.query('SELECT id FROM pos_weekly_data WHERE id = $1', [id]);
            if (existing.rows.length === 0) {
                throw new Error('Entry not found');
            }
            // Delete the entry
            await client.query('DELETE FROM pos_weekly_data WHERE id = $1', [id]);
            await client.query('COMMIT');
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
};
//# sourceMappingURL=dataEntryService.js.map