"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renojaController = void 0;
const express_validator_1 = require("express-validator");
const renojaService_1 = require("../services/renojaService");
exports.renojaController = {
    // Validation middleware for Renoja entry
    validateRenojaEntry: [
        (0, express_validator_1.body)('storeCode').notEmpty().withMessage('Store code is required'),
        (0, express_validator_1.body)('fiscalYear').optional().isInt({ min: 2020, max: 2030 }).withMessage('Valid fiscal year required'),
        (0, express_validator_1.body)('weekNumber').optional().isInt({ min: 1, max: 53 }).withMessage('Week number must be 1-53'),
        (0, express_validator_1.body)('weekEnding').optional().isDate().withMessage('Valid week ending date required'),
        (0, express_validator_1.body)('digitalPosts').isInt({ min: 0 }).withMessage('Digital posts must be non-negative'),
        (0, express_validator_1.body)('newGoogleReviews').isInt({ min: 0 }).withMessage('New reviews must be non-negative'),
        (0, express_validator_1.body)('totalGoogleReviews').isInt({ min: 0 }).withMessage('Total reviews must be non-negative'),
        (0, express_validator_1.body)('newPartnerships').isInt({ min: 0 }).withMessage('New partnerships must be non-negative'),
        (0, express_validator_1.body)('eventsInStudio').isInt({ min: 0 }).withMessage('In-studio events must be non-negative'),
        (0, express_validator_1.body)('eventsOutsideStudio').isInt({ min: 0 }).withMessage('Outside events must be non-negative'),
        (0, express_validator_1.body)('newMembersSigned').isInt({ min: 0 }).withMessage('New members must be non-negative'),
        (0, express_validator_1.body)('totalPayingMembers').isInt({ min: 0 }).withMessage('Total members must be non-negative'),
        (0, express_validator_1.body)('membersLost').isInt({ min: 0 }).withMessage('Members lost must be non-negative'),
        (0, express_validator_1.body)('avgMemberRate').isFloat({ min: 0 }).withMessage('Average rate must be positive'),
    ],
    async getDashboardOverview(req, res, next) {
        try {
            const user = req.user;
            const { startDate, endDate } = req.query;
            let { stores } = req.query;
            // Parse stores from query string
            let storeFilter;
            if (stores) {
                storeFilter = Array.isArray(stores) ? stores : [stores];
            }
            // Filter stores based on user role
            if (user.role === 'manager' && user.stores) {
                // Only show Renoja stores the manager has access to
                const renojaStores = user.stores.filter(s => s.startsWith('ren'));
                storeFilter = storeFilter
                    ? storeFilter.filter(s => renojaStores.includes(s))
                    : renojaStores;
            }
            const summary = await renojaService_1.renojaService.getDashboardSummary(storeFilter, startDate, endDate);
            const timeSeries = await renojaService_1.renojaService.getTimeSeries(storeFilter, startDate, endDate);
            res.json({
                success: true,
                data: {
                    summary,
                    timeSeries,
                    filters: {
                        stores: storeFilter,
                        startDate: startDate || 'default',
                        endDate: endDate || 'default'
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
    },
    async submitWeeklyEntry(req, res, next) {
        try {
            const user = req.user;
            // Check validation errors
            const errors = (0, express_validator_1.validationResult)(req);
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
            // Ensure it's a Renoja store
            if (!storeCode.startsWith('ren')) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid store code for Renoja'
                });
            }
            // Handle week ending date if provided
            let fiscalYear;
            let weekNumber;
            let weekEnding;
            if (req.body.weekEnding) {
                weekEnding = req.body.weekEnding;
                const weekEndDate = new Date(weekEnding);
                fiscalYear = weekEndDate.getFullYear();
                // Calculate week number
                const startOfYear = new Date(fiscalYear, 0, 1);
                const daysSinceStart = Math.floor((weekEndDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
                weekNumber = Math.ceil((daysSinceStart + 1) / 7);
            }
            else {
                fiscalYear = parseInt(req.body.fiscalYear);
                weekNumber = parseInt(req.body.weekNumber);
                // Calculate week ending date
                const startOfYear = new Date(fiscalYear, 0, 1);
                const daysToAdd = (weekNumber - 1) * 7 + 6;
                const weekEndDate = new Date(startOfYear);
                weekEndDate.setDate(startOfYear.getDate() + daysToAdd);
                weekEnding = weekEndDate.toISOString().split('T')[0];
            }
            const entryData = {
                storeCode: req.body.storeCode,
                fiscalYear,
                weekNumber,
                weekEnding,
                digitalPosts: parseInt(req.body.digitalPosts),
                newGoogleReviews: parseInt(req.body.newGoogleReviews),
                totalGoogleReviews: parseInt(req.body.totalGoogleReviews),
                newPartnerships: parseInt(req.body.newPartnerships),
                eventsInStudio: parseInt(req.body.eventsInStudio),
                eventsOutsideStudio: parseInt(req.body.eventsOutsideStudio),
                newMembersSigned: parseInt(req.body.newMembersSigned),
                totalPayingMembers: parseInt(req.body.totalPayingMembers),
                membersLost: parseInt(req.body.membersLost),
                avgMemberRate: parseFloat(req.body.avgMemberRate),
                notes: req.body.notes || null
            };
            const result = await renojaService_1.renojaService.submitWeeklyEntry(entryData, user.id);
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
                return res.status(409).json({
                    success: false,
                    error: 'Entry for this store and week already exists'
                });
            }
            next(error);
        }
    },
    async getRecentEntries(req, res, next) {
        try {
            const user = req.user;
            const limit = parseInt(req.query.limit) || 10;
            let storeFilter;
            if (user.role === 'manager' && user.stores) {
                // Only show Renoja stores the manager has access to
                storeFilter = user.stores.filter(s => s.startsWith('ren'));
            }
            const entries = await renojaService_1.renojaService.getRecentEntries(limit, storeFilter);
            res.json({
                success: true,
                data: entries,
                meta: {
                    showing: entries.length,
                    limit: limit
                }
            });
        }
        catch (error) {
            next(error);
        }
    },
    async getLastWeekData(req, res, next) {
        try {
            const user = req.user;
            const { storeCode } = req.params;
            // Check if user has access to this store
            if (user.role === 'manager' && user.stores && !user.stores.includes(storeCode)) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied to this store'
                });
            }
            const lastWeekData = await renojaService_1.renojaService.getLastWeekData(storeCode);
            res.json({
                success: true,
                data: lastWeekData
            });
        }
        catch (error) {
            next(error);
        }
    }
};
