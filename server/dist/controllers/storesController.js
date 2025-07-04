"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storesController = void 0;
const database_1 = require("../config/database");
exports.storesController = {
    async getStores(req, res, next) {
        try {
            const user = req.user;
            const brandFilter = req.query.brand;
            let query = `
        SELECT s.*, b.name as brand_name 
        FROM pos_stores s
        LEFT JOIN brands b ON s.brand_id = b.brand_id
      `;
            let params = [];
            let conditions = [];
            // Filter by brand if specified
            if (brandFilter) {
                conditions.push(`b.name = $${params.length + 1}`);
                params.push(brandFilter);
            }
            // For managers, only show their assigned stores
            if (user.role === 'manager' && user.stores) {
                conditions.push(`s.store_code = ANY($${params.length + 1})`);
                params.push(user.stores);
            }
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
            query += ' ORDER BY b.name, s.store_name';
            const result = await database_1.pool.query(query, params);
            const stores = result.rows.map(row => ({
                storeCode: row.store_code,
                storeName: row.store_name,
                brand: row.brand_name || 'Kilwins' // Default to Kilwins for backward compatibility
            }));
            // Also get available brands for filtering
            const brandsResult = await database_1.pool.query('SELECT brand_id, name FROM brands ORDER BY name');
            const brands = brandsResult.rows;
            res.json({
                success: true,
                data: {
                    stores,
                    brands
                }
            });
        }
        catch (error) {
            next(error);
        }
    },
    async getStoreMetrics(req, res, next) {
        try {
            const user = req.user;
            const { storeCode } = req.params;
            // Check if manager has access to this store
            if (user.role === 'manager' && user.stores && !user.stores.includes(storeCode)) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied to this store'
                });
            }
            const startDate = req.query.startDate || '2024-01-01';
            const endDate = req.query.endDate || '2024-12-31';
            // Implementation for getting store-specific metrics
            // This is a placeholder - implement based on your needs
            res.json({
                success: true,
                data: {
                    storeCode,
                    metrics: []
                }
            });
        }
        catch (error) {
            next(error);
        }
    },
    async compareStores(req, res, next) {
        try {
            const user = req.user;
            let storeCodes = req.query.stores ? req.query.stores.split(',') : [];
            // For managers, filter to only their assigned stores
            if (user.role === 'manager' && user.stores) {
                storeCodes = storeCodes.filter(code => user.stores.includes(code));
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
        }
        catch (error) {
            next(error);
        }
    }
};
