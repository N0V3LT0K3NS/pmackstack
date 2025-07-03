import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { body, validationResult } from 'express-validator';

export const authController = {
  // Validation middleware
  validateLogin: [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
  ],
  
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }
      
      const { email, password } = req.body;
      
      const authResponse = await authService.login(email, password);
      
      // Add CORS headers directly (temporary fix)
      const origin = req.headers.origin;
      if (origin === 'https://pmackstack.vercel.app' || origin?.includes('localhost')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      res.json({
        success: true,
        data: authResponse
      });
    } catch (error: any) {
      if (error.message === 'Invalid email or password' || 
          error.message === 'Account is disabled') {
        return res.status(401).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  },
  
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      // This endpoint requires authentication
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }
      
      const user = await authService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      // Get stores for managers
      let stores: string[] = [];
      if (user.role === 'manager') {
        stores = await authService.getUserStores(userId);
      }
      
      res.json({
        success: true,
        data: {
          user,
          stores: stores.length > 0 ? stores : undefined
        }
      });
    } catch (error) {
      next(error);
    }
  }
}; 