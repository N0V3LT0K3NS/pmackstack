import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const renojaController: {
    validateRenojaEntry: import("express-validator").ValidationChain[];
    getDashboardOverview(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    submitWeeklyEntry(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    getRecentEntries(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getLastWeekData(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=renojaController.d.ts.map