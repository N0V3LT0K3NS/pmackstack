import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const storesController: {
    getStores(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getStoreMetrics(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    compareStores(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=storesController.d.ts.map