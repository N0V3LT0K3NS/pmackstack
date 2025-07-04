"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.testConnection = testConnection;
exports.closePool = closePool;
const serverless_1 = require("@neondatabase/serverless");
const env_1 = require("./env");
// Production-optimized connection pool configuration
const poolConfig = {
    connectionString: env_1.config.databaseUrl,
    ssl: { rejectUnauthorized: false },
    // Connection pool settings
    max: env_1.config.isProduction ? 10 : 3, // More connections for production
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 5000, // Connection timeout after 5 seconds
};
// Create database connection pool
exports.pool = new serverless_1.Pool(poolConfig);
// Error handling for unexpected pool errors
exports.pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err);
    // In production, you might want to notify your monitoring service here
});
/**
 * Tests the database connection with automatic retry
 * @param retries Number of retry attempts (default: 3)
 * @param delay Delay between retries in ms (default: 1000)
 * @returns Promise<boolean> True if connection was successful
 */
async function testConnection(retries = 3, delay = 1000) {
    try {
        const result = await exports.pool.query('SELECT NOW()');
        console.log('Database connected successfully:', result.rows[0].now);
        return true;
    }
    catch (error) {
        console.error('Database connection failed:', error);
        if (retries > 0) {
            console.log(`Retrying database connection in ${delay}ms... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return testConnection(retries - 1, delay * 2); // Exponential backoff
        }
        return false;
    }
}
// Graceful shutdown function to close pool connections properly
async function closePool() {
    try {
        await exports.pool.end();
        console.log('Database pool connections closed');
    }
    catch (error) {
        console.error('Error closing database pool:', error);
    }
}
