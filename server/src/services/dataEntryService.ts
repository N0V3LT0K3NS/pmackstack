import { pool } from '../config/database';

interface WeeklyEntryData {
  storeCode: string;
  fiscalYear: number;
  weekNumber: number;
  totalSales: number;
  variableHours: number;
  numTransactions: number;
  averageWage: number;
  notes?: string | null;
}

interface CSVImportResult {
  successful: number;
  failed: number;
  errors: string[];
}

export const dataEntryService = {
  async submitWeeklyEntry(entryData: WeeklyEntryData, userId: number) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if entry already exists
      const existingCheck = await client.query(
        'SELECT id FROM pos_weekly_data WHERE store_code = $1 AND fiscal_year = $2 AND week_number = $3',
        [entryData.storeCode, entryData.fiscalYear, entryData.weekNumber]
      );

      if (existingCheck.rows.length > 0) {
        throw new Error('Entry for this store and week already exists');
      }

      // Calculate derived fields
      const laborCost = entryData.variableHours * entryData.averageWage;
      const laborPercent = entryData.totalSales > 0 ? (laborCost / entryData.totalSales) * 100 : 0;
      const avgTransaction = entryData.numTransactions > 0 ? entryData.totalSales / entryData.numTransactions : 0;
      const salesPerLaborHour = entryData.variableHours > 0 ? entryData.totalSales / entryData.variableHours : 0;
      const transactionsPerLaborHour = entryData.variableHours > 0 ? entryData.numTransactions / entryData.variableHours : 0;

      // Insert new entry
      const insertResult = await client.query(`
        INSERT INTO pos_weekly_data (
          store_code, fiscal_year, week_number, total_sales, variable_hours,
          num_transactions, average_wage, labor_cost, labor_percent, avg_transaction,
          sales_per_labor_hour, transactions_per_labor_hour, notes, created_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
        RETURNING id, created_at
      `, [
        entryData.storeCode,
        entryData.fiscalYear,
        entryData.weekNumber,
        entryData.totalSales,
        entryData.variableHours,
        entryData.numTransactions,
        entryData.averageWage,
        laborCost,
        laborPercent,
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
        laborCost,
        laborPercent,
        avgTransaction,
        salesPerLaborHour,
        transactionsPerLaborHour
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async importCSVData(data: any[], userId: number): Promise<CSVImportResult> {
    const client = await pool.connect();
    const result: CSVImportResult = {
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
          const entryData: WeeklyEntryData = {
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
        } catch (error: any) {
          result.failed++;
          result.errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return result;
  },

  getCSVTemplate(): string {
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

  async getRecentEntries(limit: number = 10, storeFilter?: string[]) {
    let query = `
      SELECT 
        pwd.*,
        ps.store_name,
        u.email as created_by_email
      FROM pos_weekly_data pwd
      JOIN pos_stores ps ON pwd.store_code = ps.store_code
      LEFT JOIN users u ON pwd.created_by = u.id
    `;
    
    const params: any[] = [];
    
    if (storeFilter && storeFilter.length > 0) {
      query += ` WHERE pwd.store_code = ANY($1)`;
      params.push(storeFilter);
    }
    
    query += ` ORDER BY pwd.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;
  }
}; 