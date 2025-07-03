"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.testConnection = testConnection;
const serverless_1 = require("@neondatabase/serverless");
const env_1 = require("./env");
// Fallback to known working database URL if not set
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_rtjyKc0hWJ1o@ep-steep-moon-a8q2x8sg-pooler.eastus2.azure.neon.tech/neondb?sslmode=require';
if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}
exports.pool = new serverless_1.Pool({
    connectionString: env_1.config.databaseUrl,
    ssl: { rejectUnauthorized: false }
});
// Test database connection
async function testConnection() {
    try {
        const result = await exports.pool.query('SELECT NOW()');
        console.log('Database connected successfully:', result.rows[0].now);
        return true;
    }
    catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}
