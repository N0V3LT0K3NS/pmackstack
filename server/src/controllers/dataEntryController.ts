import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { dataEntryService } from '../services/dataEntryService';

export const dataEntryController = {
  // Validation middleware for manual entry
  validateWeeklyEntry: [
    body('storeCode').notEmpty().withMessage('Store code is required'),
    body('fiscalYear').optional().isInt({ min: 2020, max: 2030 }).withMessage('Valid fiscal year required'),
    body('weekNumber').optional().isInt({ min: 1, max: 53 }).withMessage('Week number must be 1-53'),
    body('weekEnding').optional().isDate().withMessage('Valid week ending date required'),
    body('totalSales').isFloat({ min: 0 }).withMessage('Total sales must be positive'),
    body('variableHours').isFloat({ min: 0 }).withMessage('Variable hours must be positive'),
    body('numTransactions').isInt({ min: 0 }).withMessage('Transactions must be positive'),
    body('averageWage').isFloat({ min: 0 }).withMessage('Average wage must be positive'),
    body('totalFixedCost').optional().isFloat({ min: 0 }).withMessage('Fixed cost must be positive'),
  ],

  async submitWeeklyEntry(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      // Check if user has write access to this store
      const { storeCode } = req.body;
      if (user.role === 'manager' && user.stores && !user.stores.includes(storeCode)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this store'
        });
      }

      // Handle week ending date if provided
      let fiscalYear: number;
      let weekNumber: number;
      let weekEnding: string;

      if (req.body.weekEnding) {
        weekEnding = req.body.weekEnding;
        const weekEndDate = new Date(weekEnding);
        fiscalYear = weekEndDate.getFullYear();
        
        // Calculate week number (simple approximation)
        const startOfYear = new Date(fiscalYear, 0, 1);
        const daysSinceStart = Math.floor((weekEndDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
        weekNumber = Math.ceil((daysSinceStart + 1) / 7);
      } else {
        fiscalYear = parseInt(req.body.fiscalYear);
        weekNumber = parseInt(req.body.weekNumber);
        
        // Calculate week ending date from fiscal year and week number
        const startOfYear = new Date(fiscalYear, 0, 1);
        const daysToAdd = (weekNumber - 1) * 7 + 6; // End of week
        const weekEndDate = new Date(startOfYear);
        weekEndDate.setDate(startOfYear.getDate() + daysToAdd);
        weekEnding = weekEndDate.toISOString().split('T')[0];
      }

      const entryData = {
        storeCode: req.body.storeCode,
        fiscalYear,
        weekNumber,
        weekEnding,
        totalSales: parseFloat(req.body.totalSales),
        variableHours: parseFloat(req.body.variableHours),
        numTransactions: parseInt(req.body.numTransactions),
        averageWage: parseFloat(req.body.averageWage),
        totalFixedCost: req.body.totalFixedCost ? parseFloat(req.body.totalFixedCost) : undefined,
        notes: req.body.notes || null
      };

      const result = await dataEntryService.submitWeeklyEntry(entryData, user.id);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: 'Entry for this store and week already exists'
        });
      }
      next(error);
    }
  },

  async importCSV(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { data } = req.body; // Array of CSV rows

      if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No data provided'
        });
      }

      // Filter data to only stores the user has access to
      let filteredData = data;
      if (user.role === 'manager' && user.stores) {
        filteredData = data.filter(row => user.stores!.includes(row.storeCode));
      }

      const result = await dataEntryService.importCSVData(filteredData, user.id);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async getCSVTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const template = dataEntryService.getCSVTemplate();
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="weekly_data_template.csv"');
      res.send(template);
    } catch (error) {
      next(error);
    }
  },

  async getRecentEntries(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const limit = parseInt(req.query.limit as string) || 10;
      
      let storeFilter: string[] | undefined;
      if (user.role === 'manager' && user.stores) {
        storeFilter = user.stores;
      }

      const result = await dataEntryService.getRecentEntries(limit, storeFilter);
      
      res.json({
        success: true,
        data: result.entries,
        meta: {
          totalCount: result.totalCount,
          showing: result.showing,
          limit: limit
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getLastWeekData(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { storeCode } = req.params;

      // Check if user has access to this store
      if (user.role === 'manager' && user.stores && !user.stores.includes(storeCode)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this store'
        });
      }

      const lastWeekData = await dataEntryService.getLastWeekData(storeCode);
      
      res.json({
        success: true,
        data: lastWeekData
      });
    } catch (error) {
      next(error);
    }
  },

  async updateWeeklyEntry(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params;

      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      // Check if user has write access to this store
      const { storeCode } = req.body;
      if (user.role === 'manager' && user.stores && !user.stores.includes(storeCode)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this store'
        });
      }

      const entryData = {
        id: parseInt(id),
        storeCode: req.body.storeCode,
        totalSales: parseFloat(req.body.totalSales),
        variableHours: parseFloat(req.body.variableHours),
        numTransactions: parseInt(req.body.numTransactions),
        averageWage: parseFloat(req.body.averageWage),
        totalFixedCost: req.body.totalFixedCost ? parseFloat(req.body.totalFixedCost) : undefined,
        notes: req.body.notes || null
      };

      const result = await dataEntryService.updateWeeklyEntry(entryData, user.id);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Entry not found'
        });
      }
      next(error);
    }
  },

  async deleteWeeklyEntry(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params;

      // Get the entry first to check permissions
      const entry = await dataEntryService.getWeeklyEntryById(parseInt(id));
      if (!entry) {
        return res.status(404).json({
          success: false,
          error: 'Entry not found'
        });
      }

      // Check if user has write access to this store
      if (user.role === 'manager' && user.stores && !user.stores.includes(entry.store_code)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this store'
        });
      }

      await dataEntryService.deleteWeeklyEntry(parseInt(id));
      
      res.json({
        success: true,
        message: 'Entry deleted successfully'
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Entry not found'
        });
      }
      next(error);
    }
  }
}; 