import { Request, Response, NextFunction } from 'express';
export declare const authController: {
    validateLogin: import("express-validator").ValidationChain[];
    login(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    me(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=authController.d.ts.map