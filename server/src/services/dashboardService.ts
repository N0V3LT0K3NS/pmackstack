import { pool } from '../config/database';
import { 
  DashboardFilters, 
  DashboardSummary,
  StorePerformance,
  TimeSeriesDataPoint
} from '../../../shared/types/models';
import { DashboardOverviewResponse } from '../../../shared/types/api';
import { format } from 'date-fns';

// Helper function to get week number from date
function getWeekNumber(dateString: string): number {
  const date = new Date(dateString);
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
}

export const dashboardService = {
  async getDashboardOverview(filters: DashboardFilters): Promise<DashboardOverviewResponse> {
    // Default to 2024 data since that's the most recent complete year
    // User said they only have data through April 2025, so 2024 should be the default
    const currentYear = 2024; // Changed from new Date().getFullYear()
    
    // If no date filters, default to full year
    const startDate = filters.startDate || `${currentYear}-01-01`;
    const endDate = filters.endDate || `${currentYear}-12-31`;

    // Get summary data
    const summary = await this.getDashboardSummary(startDate, endDate, filters.stores);
    
    // Get time series data
    const timeSeries = await this.getTimeSeries(startDate, endDate, filters.stores);
    
    // Get store performance
    const storePerformance = await this.getStorePerformance(startDate, endDate);

    return {
      summary,
      timeSeries,
      storePerformance,
      dateRange: {
        start: startDate,
        end: endDate
      }
    };
  },

  async getDashboardSummary(
    startDate: string, 
    endDate: string, 
    stores?: string[]
  ): Promise<DashboardSummary> {
    // Convert dates to week_iso format for direct filtering
    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();
    const startMonth = new Date(startDate).getMonth() + 1;
    const endMonth = new Date(endDate).getMonth() + 1;
    
    // Create week_iso range for filtering
    const startWeekIso = `${startYear}-${String(Math.max(1, Math.ceil(startMonth * 4.33) - 2)).padStart(2, '0')}`;
    const endWeekIso = `${endYear}-${String(Math.min(52, Math.ceil(endMonth * 4.33) + 2)).padStart(2, '0')}`;
    
    let whereClause = `WHERE week_iso >= $1 AND week_iso <= $2`;
    const params: any[] = [startWeekIso, endWeekIso];
    
    if (stores?.length) {
      whereClause += ` AND store_code = ANY($3)`;
      params.push(stores);
    }

    const query = `
      WITH current_period AS (
        SELECT 
          SUM(total_sales::numeric) as total_sales,
          SUM(num_transactions) as total_transactions,
          SUM(total_labor_cost::numeric) as total_labor_cost,
          COUNT(DISTINCT store_code) as store_count
        FROM pos_weekly_data
        ${whereClause}
      ),
      previous_year AS (
        SELECT 
          SUM(total_sales_py::numeric) as total_sales,
          SUM(num_transactions_py) as total_transactions
        FROM pos_weekly_data
        ${whereClause}
        AND total_sales_py IS NOT NULL
      )
      SELECT 
        COALESCE(c.total_sales, 0) as total_sales,
        COALESCE(c.total_transactions, 0) as total_transactions,
        CASE 
          WHEN c.total_transactions > 0 
          THEN c.total_sales / c.total_transactions 
          ELSE 0 
        END as avg_transaction_value,
        COALESCE(c.total_labor_cost, 0) as total_labor_cost,
        CASE 
          WHEN c.total_sales > 0 
          THEN (c.total_labor_cost / c.total_sales) * 100 
          ELSE 0 
        END as labor_cost_percent,
        COALESCE(c.store_count, 0) as store_count,
        -- Year over year calculations
        CASE 
          WHEN p.total_sales > 0 
          THEN ((c.total_sales - p.total_sales) / p.total_sales) * 100 
          ELSE 0 
        END as yoy_sales,
        CASE 
          WHEN p.total_transactions > 0 
          THEN ((c.total_transactions - p.total_transactions) / p.total_transactions) * 100 
          ELSE 0 
        END as yoy_transactions,
        CASE 
          WHEN p.total_transactions > 0 AND c.total_transactions > 0
          THEN (((c.total_sales / c.total_transactions) - (p.total_sales / p.total_transactions)) / (p.total_sales / p.total_transactions)) * 100
          ELSE 0 
        END as yoy_avg_transaction,
        0 as yoy_labor  -- Simplified for now
      FROM current_period c
      CROSS JOIN previous_year p
    `;

    const result = await pool.query(query, params);
    const row = result.rows[0];

    if (!row) {
      throw new Error('No data found for the specified criteria');
    }

    return {
      totalSales: parseFloat(row.total_sales) || 0,
      totalTransactions: parseInt(row.total_transactions) || 0,
      avgTransactionValue: parseFloat(row.avg_transaction_value) || 0,
      totalLaborCost: parseFloat(row.total_labor_cost) || 0,
      laborCostPercent: parseFloat(row.labor_cost_percent) || 0,
      storeCount: parseInt(row.store_count) || 0,
      yoyGrowth: {
        sales: parseFloat(row.yoy_sales) || 0,
        transactions: parseFloat(row.yoy_transactions) || 0,
        avgTransaction: parseFloat(row.yoy_avg_transaction) || 0,
        labor: parseFloat(row.yoy_labor) || 0
      }
    };
  },

  async getTimeSeries(
    startDate: string,
    endDate: string,
    stores?: string[]
  ): Promise<TimeSeriesDataPoint[]> {
    // Convert dates to week_iso format for direct filtering
    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();
    const startMonth = new Date(startDate).getMonth() + 1;
    const endMonth = new Date(endDate).getMonth() + 1;
    
    // Create week_iso range for filtering
    const startWeekIso = `${startYear}-${String(Math.max(1, Math.ceil(startMonth * 4.33) - 2)).padStart(2, '0')}`;
    const endWeekIso = `${endYear}-${String(Math.min(52, Math.ceil(endMonth * 4.33) + 2)).padStart(2, '0')}`;
    
    let whereClause = `WHERE week_iso >= $1 AND week_iso <= $2`;
    const params: any[] = [startWeekIso, endWeekIso];
    
    if (stores?.length) {
      whereClause += ` AND store_code = ANY($3)`;
      params.push(stores);
    }

    const query = `
      SELECT 
        week_iso as period,
        week_iso as week_ending,
        SUM(total_sales::numeric) as sales,
        SUM(num_transactions) as transactions,
        CASE 
          WHEN SUM(num_transactions) > 0 
          THEN SUM(total_sales::numeric) / SUM(num_transactions) 
          ELSE 0 
        END as avg_transaction,
        CASE 
          WHEN SUM(total_sales::numeric) > 0 
          THEN (SUM(total_labor_cost::numeric) / SUM(total_sales::numeric)) * 100 
          ELSE 0 
        END as labor_percent,
        SUM(total_sales_py::numeric) as prev_sales,
        SUM(num_transactions_py) as prev_transactions,
        AVG(total_labor_percent_py::numeric * 100) as prev_labor_percent
      FROM pos_weekly_data
      ${whereClause}
      GROUP BY week_iso, fiscal_year, week_number
      ORDER BY fiscal_year, week_number
    `;

    const result = await pool.query(query, params);

    return result.rows.map(row => {
      // Convert week_iso format (e.g., "2023-01") to readable format
      const weekLabel = row.period.replace('-', ' W');
      
      return {
        period: row.period,
        weekEnding: weekLabel, // Use readable week format instead of invalid date
        sales: parseFloat(row.sales) || 0,
        transactions: parseInt(row.transactions) || 0,
        avgTransaction: parseFloat(row.avg_transaction) || 0,
        laborPercent: parseFloat(row.labor_percent) || 0,
        previousYear: (row.prev_sales && parseFloat(row.prev_sales) > 0) ? {
          sales: parseFloat(row.prev_sales),
          transactions: parseInt(row.prev_transactions) || 0,
          avgTransaction: parseInt(row.prev_transactions) > 0 ? parseFloat(row.prev_sales) / parseInt(row.prev_transactions) : 0,
          laborPercent: parseFloat(row.prev_labor_percent) || 0
        } : undefined
      };
    });
  },

  async getTimeSeriesByStore(
    startDate: string,
    endDate: string,
    stores?: string[]
  ): Promise<{ [storeCode: string]: TimeSeriesDataPoint[] }> {
    // Convert dates to week_iso format for direct filtering
    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();
    const startMonth = new Date(startDate).getMonth() + 1;
    const endMonth = new Date(endDate).getMonth() + 1;
    
    // Create week_iso range for filtering
    const startWeekIso = `${startYear}-${String(Math.max(1, Math.ceil(startMonth * 4.33) - 2)).padStart(2, '0')}`;
    const endWeekIso = `${endYear}-${String(Math.min(52, Math.ceil(endMonth * 4.33) + 2)).padStart(2, '0')}`;
    
    let whereClause = `WHERE week_iso >= $1 AND week_iso <= $2`;
    const params: any[] = [startWeekIso, endWeekIso];
    
    if (stores?.length) {
      whereClause += ` AND store_code = ANY($3)`;
      params.push(stores);
    }

    const query = `
      SELECT 
        store_code,
        week_iso as period,
        week_iso as week_ending,
        total_sales::numeric as sales,
        num_transactions as transactions,
        CASE 
          WHEN num_transactions > 0 
          THEN total_sales::numeric / num_transactions 
          ELSE 0 
        END as avg_transaction,
        CASE 
          WHEN total_sales::numeric > 0 
          THEN (total_labor_cost::numeric / total_sales::numeric) * 100 
          ELSE 0 
        END as labor_percent,
        total_labor_cost::numeric as labor_cost,
        variable_hours::numeric as labor_hours,
        total_sales_py::numeric as prev_sales,
        num_transactions_py as prev_transactions,
        total_labor_percent_py::numeric as prev_labor_percent
      FROM pos_weekly_data
      ${whereClause}
      ORDER BY store_code, fiscal_year, week_number
    `;

    const result = await pool.query(query, params);
    
    // Group by store
    const storeData: { [storeCode: string]: TimeSeriesDataPoint[] } = {};
    
    result.rows.forEach(row => {
      const storeCode = row.store_code;
      
      if (!storeData[storeCode]) {
        storeData[storeCode] = [];
      }
      
      // Convert week_iso format (e.g., "2023-01") to readable format
      const weekLabel = row.period ? `${row.period.substring(0, 4)} W${row.period.substring(5)}` : 'Unknown';
      
      const dataPoint: TimeSeriesDataPoint = {
        period: weekLabel,
        weekEnding: weekLabel,
        sales: parseFloat(row.sales) || 0,
        transactions: parseInt(row.transactions) || 0,
        avgTransaction: parseFloat(row.avg_transaction) || 0,
        laborPercent: parseFloat(row.labor_percent) || 0,
        laborCost: parseFloat(row.labor_cost) || 0,
        laborHours: parseFloat(row.labor_hours) || 0
      };
      
      // Add previous year data if available
      if (row.prev_sales || row.prev_transactions) {
        dataPoint.previousYear = {
          sales: parseFloat(row.prev_sales) || 0,
          transactions: parseInt(row.prev_transactions) || 0,
          avgTransaction: row.prev_transactions > 0 ? (parseFloat(row.prev_sales) || 0) / parseInt(row.prev_transactions) : 0,
          laborPercent: (parseFloat(row.prev_labor_percent) || 0) * 100 // Convert decimal to percentage
        };
      }
      
      storeData[storeCode].push(dataPoint);
    });
    
    return storeData;
  },

  async getStorePerformance(
    startDate: string,
    endDate: string
  ): Promise<StorePerformance[]> {
    // Convert dates to year range for filtering
    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();
    
    const query = `
      WITH store_metrics AS (
        SELECT 
          w.store_code,
          COALESCE(s.store_name, UPPER(w.store_code)) as store_name,
          SUM(w.total_sales::numeric) as total_sales,
          SUM(w.num_transactions) as total_transactions,
          SUM(w.total_labor_cost::numeric) as total_labor_cost,
          SUM(w.total_sales_py::numeric) as total_sales_py
        FROM pos_weekly_data w
        LEFT JOIN pos_stores s ON w.store_code = s.store_code
        WHERE w.fiscal_year >= $1 AND w.fiscal_year <= $2
        GROUP BY w.store_code, s.store_name
      ),
      ranked_stores AS (
        SELECT 
          *,
          RANK() OVER (ORDER BY total_sales DESC) as sales_rank,
          CASE 
            WHEN total_sales_py > 0 
            THEN ((total_sales - total_sales_py) / total_sales_py) * 100 
            ELSE 0 
          END as yoy_growth
        FROM store_metrics
      )
      SELECT 
        store_code,
        store_name,
        total_sales,
        total_transactions,
        CASE 
          WHEN total_transactions > 0 
          THEN total_sales / total_transactions 
          ELSE 0 
        END as avg_transaction_value,
        CASE 
          WHEN total_sales > 0 
          THEN (total_labor_cost / total_sales) * 100 
          ELSE 0 
        END as labor_cost_percent,
        sales_rank,
        yoy_growth,
        -- Calculate performance score (weighted average)
        (
          (CASE WHEN yoy_growth > 0 THEN 40 ELSE 20 END) +
          (CASE WHEN total_sales > 100000 THEN 30 ELSE 15 END) +
          (CASE 
            WHEN total_sales > 0 AND (total_labor_cost / total_sales) < 0.22 
            THEN 30 
            ELSE 10 
          END)
        ) as performance_score
      FROM ranked_stores
      ORDER BY sales_rank
    `;

    const result = await pool.query(query, [startYear, endYear]);

    return result.rows.map(row => ({
      storeCode: row.store_code,
      storeName: row.store_name || row.store_code.toUpperCase(),
      totalSales: parseFloat(row.total_sales) || 0,
      totalTransactions: parseInt(row.total_transactions) || 0,
      avgTransactionValue: parseFloat(row.avg_transaction_value) || 0,
      laborCostPercent: parseFloat(row.labor_cost_percent) || 0,
      salesRank: parseInt(row.sales_rank) || 0,
      performanceScore: parseFloat(row.performance_score) || 0,
      yoyGrowth: parseFloat(row.yoy_growth) || 0
    }));
  }
}; 