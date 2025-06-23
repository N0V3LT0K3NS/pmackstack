import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboardService';
import { DashboardFilters } from '../../../shared/types/models';

export const dashboardController = {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: DashboardFilters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        stores: req.query.stores ? (req.query.stores as string).split(',') : undefined,
        metrics: req.query.metrics ? (req.query.metrics as string).split(',') : undefined,
        groupBy: req.query.groupBy as 'week' | 'month' | 'quarter',
        comparison: req.query.comparison as 'yoy' | 'period' | 'none'
      };

      const data = await dashboardService.getDashboardOverview(filters);
      res.json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  },

  async getStoresTimeSeries(req: Request, res: Response, next: NextFunction) {
    try {
      const startDate = req.query.startDate as string || '2024-01-01';
      const endDate = req.query.endDate as string || '2024-12-31';
      const stores = req.query.stores ? (req.query.stores as string).split(',') : undefined;

      const data = await dashboardService.getTimeSeriesByStore(startDate, endDate, stores);
      res.json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }
}; 