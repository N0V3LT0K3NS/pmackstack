import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const dashboardController: {
    getOverview(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getStoresTimeSeries(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    exportCSV(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=dashboardController.d.ts.map