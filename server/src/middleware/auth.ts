import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'executive' | 'bookkeeper' | 'manager';
    stores?: string[];
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // List of public paths that should bypass authentication
    const publicPaths = ['/auth/login'];
    
    // For debugging in production
    console.log(`Auth check for path: ${req.originalUrl} (req.path: ${req.path})`);
    
    // More robust path checking that works regardless of how the router is mounted
    // Checks if the path ends with any of our public paths
    if (
      publicPaths.some(publicPath => req.path === publicPath || req.path.endsWith(publicPath)) ||
      publicPaths.some(publicPath => req.originalUrl === publicPath || req.originalUrl.endsWith(publicPath))
    ) {
      console.log(`Bypassing auth for public path: ${req.originalUrl}`);
      return next();
    }
    
    // For all other paths, require authentication
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No authorization header'
      });
    }
    
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    const decoded = await authService.verifyToken(token);
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
}

export function authorize(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    
    next();
  };
} 