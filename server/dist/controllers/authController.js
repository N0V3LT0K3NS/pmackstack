"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const authService_1 = require("../services/authService");
const express_validator_1 = require("express-validator");
exports.authController = {
    // Validation middleware
    validateLogin: [
        (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
        (0, express_validator_1.body)('password').isLength({ min: 6 })
    ],
    async login(req, res, next) {
        try {
            // Check validation errors
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }
            const { email, password } = req.body;
            const authResponse = await authService_1.authService.login(email, password);
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
        }
        catch (error) {
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
    async me(req, res, next) {
        try {
            // This endpoint requires authentication
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized'
                });
            }
            const user = await authService_1.authService.getUserById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }
            // Get stores for managers
            let stores = [];
            if (user.role === 'manager') {
                stores = await authService_1.authService.getUserStores(userId);
            }
            res.json({
                success: true,
                data: {
                    user,
                    stores: stores.length > 0 ? stores : undefined
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
};
