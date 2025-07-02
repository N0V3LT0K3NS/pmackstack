import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const dataEntryController: {
    validateWeeklyEntry: import("express-validator").ValidationChain[];
    submitWeeklyEntry(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    importCSV(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    getCSVTemplate(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getRecentEntries(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getLastWeekData(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    updateWeeklyEntry(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    deleteWeeklyEntry(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=dataEntryController.d.ts.map