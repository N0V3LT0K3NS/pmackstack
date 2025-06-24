import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { dataEntryService } from '../services/dataEntryService';

export const dataEntryController = {
  // Validation middleware for manual entry
  validateWeeklyEntry: [
    body('storeCode').notEmpty().withMessage('Store code is required'),
    body('fiscalYear').isInt({ min: 2020, max: 2030 }).withMessage('Valid fiscal year required'),
    body('weekNumber').isInt({ min: 1, max: 53 }).withMessage('Week number must be 1-53'),
    body('totalSales').isFloat({ min: 0 }).withMessage('Total sales must be positive'),
    body('variableHours').isFloat({ min: 0 }).withMessage('Variable hours must be positive'),
    body('numTransactions').isInt({ min: 0 }).withMessage('Transactions must be positive'),
    body('averageWage').isFloat({ min: 0 }).withMessage('Average wage must be positive'),
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

      const entryData = {
        storeCode: req.body.storeCode,
        fiscalYear: parseInt(req.body.fiscalYear),
        weekNumber: parseInt(req.body.weekNumber),
        totalSales: parseFloat(req.body.totalSales),
        variableHours: parseFloat(req.body.variableHours),
        numTransactions: parseInt(req.body.numTransactions),
        averageWage: parseFloat(req.body.averageWage),
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

      const entries = await dataEntryService.getRecentEntries(limit, storeFilter);
      
      res.json({
        success: true,
        data: entries
      });
    } catch (error) {
      next(error);
    }
  }
}; 