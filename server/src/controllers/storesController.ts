import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { pool } from '../config/database';

export const storesController = {
  async getStores(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      
      let query = 'SELECT * FROM pos_stores';
      let params: any[] = [];
      
      // For managers, only show their assigned stores
      if (user.role === 'manager' && user.stores) {
        query += ' WHERE store_code = ANY($1)';
        params.push(user.stores);
      }
      
      query += ' ORDER BY store_name';
      
      const result = await pool.query(query, params);
      
      const stores = result.rows.map(row => ({
        storeCode: row.store_code,
        storeName: row.store_name
      }));

      res.json({
        success: true,
        data: { stores }
      });
    } catch (error) {
      next(error);
    }
  },

  async getStoreMetrics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { storeCode } = req.params;
      
      // Check if manager has access to this store
      if (user.role === 'manager' && user.stores && !user.stores.includes(storeCode)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this store'
        });
      }
      
      const startDate = req.query.startDate as string || '2024-01-01';
      const endDate = req.query.endDate as string || '2024-12-31';

      // Implementation for getting store-specific metrics
      // This is a placeholder - implement based on your needs
      
      res.json({
        success: true,
        data: {
          storeCode,
          metrics: []
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async compareStores(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      let storeCodes = req.query.stores ? (req.query.stores as string).split(',') : [];
      
      // For managers, filter to only their assigned stores
      if (user.role === 'manager' && user.stores) {
        storeCodes = storeCodes.filter(code => user.stores!.includes(code));
        
        // If no stores specified or all filtered out, use all assigned stores
        if (storeCodes.length === 0) {
          storeCodes = user.stores;
        }
      }
      
      // Implementation for comparing stores
      // This is a placeholder - implement based on your needs
      
      res.json({
        success: true,
        data: {
          stores: storeCodes,
          comparison: {}
        }
      });
    } catch (error) {
      next(error);
    }
  }
}; 