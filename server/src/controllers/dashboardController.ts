import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { dashboardService } from '../services/dashboardService';
import { DashboardFilters } from '@shared/types/models';

export const dashboardController = {
  async getOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Get user from authenticated request
      const user = req.user!;
      
      const filters: DashboardFilters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        stores: req.query.stores ? (req.query.stores as string).split(',') : undefined,
        metrics: req.query.metrics ? (req.query.metrics as string).split(',') : undefined,
        groupBy: req.query.groupBy as 'week' | 'month' | 'quarter',
        comparison: req.query.comparison as 'yoy' | 'period' | 'none'
      };

      // For managers, filter to only their assigned stores
      if (user.role === 'manager' && user.stores) {
        if (filters.stores) {
          // Only include stores that are both requested AND assigned
          filters.stores = filters.stores.filter(store => user.stores!.includes(store));
        } else {
          // If no stores specified, use all assigned stores
          filters.stores = user.stores;
        }
      }

      const data = await dashboardService.getDashboardOverview(filters);
      res.json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  },

  async getStoresTimeSeries(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      
      const startDate = req.query.startDate as string || '2024-01-01';
      const endDate = req.query.endDate as string || '2024-12-31';
      let stores = req.query.stores ? (req.query.stores as string).split(',') : undefined;

      // For managers, filter to only their assigned stores
      if (user.role === 'manager' && user.stores) {
        if (stores) {
          stores = stores.filter(store => user.stores!.includes(store));
        } else {
          stores = user.stores;
        }
      }

      const data = await dashboardService.getTimeSeriesByStore(startDate, endDate, stores);
      res.json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  },

  async exportCSV(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { startDate, endDate, stores, format = 'summary' } = req.query;

      // Apply role-based filtering
      let storeFilter: string[] | undefined;
      if (user.role === 'manager' && user.stores) {
        storeFilter = user.stores;
      } else if (stores) {
        storeFilter = (stores as string).split(',');
      }

      let csvData: string;
      let filename: string;

      if (format === 'detailed') {
        // Export detailed weekly data
        const weeklyData = await dashboardService.getDetailedWeeklyData(
          startDate as string,
          endDate as string,
          storeFilter
        );
        
        const headers = [
          'Store Code',
          'Store Name', 
          'Fiscal Year',
          'Week Number',
          'Week Ending',
          'Total Sales',
          'Transactions',
          'Avg Transaction',
          'Variable Hours',
          'Average Wage',
          'Labor Cost',
          'Labor %',
          'Sales per Labor Hour',
          'Transactions per Labor Hour'
        ];

        const rows = weeklyData.map((row: any) => [
          row.store_code,
          row.store_name,
          row.fiscal_year,
          row.week_number,
          row.week_ending,
          row.total_sales,
          row.num_transactions,
          row.avg_transaction,
          row.variable_hours,
          row.average_wage,
          row.labor_cost,
          row.labor_percent,
          row.sales_per_labor_hour,
          row.transactions_per_labor_hour
        ]);

        csvData = [headers.join(','), ...rows.map((row: any) => row.join(','))].join('\n');
        filename = `kilwins_detailed_data_${startDate}_${endDate}.csv`;
      } else {
        // Export summary data
        const summary = await dashboardService.getDashboardSummary(
          startDate as string,
          endDate as string,
          storeFilter
        );

        const headers = [
          'Metric',
          'Value',
          'Previous Period',
          'Change %',
          'YoY Change %'
        ];

        const rows = [
          ['Total Sales', summary.totalSales, summary.previousPeriod?.totalSales || 0, '', summary.yoyGrowth.sales],
          ['Total Transactions', summary.totalTransactions, summary.previousPeriod?.totalTransactions || 0, '', summary.yoyGrowth.transactions],
          ['Avg Transaction', summary.avgTransactionValue, summary.previousPeriod?.avgTransactionValue || 0, '', summary.yoyGrowth.avgTransaction],
          ['Labor Cost %', summary.laborCostPercent, summary.previousPeriod?.laborCostPercent || 0, '', summary.yoyGrowth.labor],
          ['Total Labor Hours', summary.totalLaborHours, '', '', ''],
          ['Sales per Labor Hour', summary.salesPerLaborHour, summary.previousPeriod?.salesPerLaborHour || 0, '', ''],
          ['Transactions per Labor Hour', summary.transactionsPerLaborHour, summary.previousPeriod?.transactionsPerLaborHour || 0, '', ''],
          ['Effective Hourly Wage', summary.effectiveHourlyWage, summary.previousPeriod?.effectiveHourlyWage || 0, '', '']
        ];

        csvData = [headers.join(','), ...rows.map((row: any) => row.join(','))].join('\n');
        filename = `kilwins_summary_${startDate}_${endDate}.csv`;
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvData);
    } catch (error) {
      next(error);
    }
  }
}; 