"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
// Manual CORS headers middleware
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
        'https://pmackstack.vercel.app',
        'http://localhost:5174',
        'http://localhost:5175'
    ];
    // Add CLIENT_URL if set
    if (env_1.config.clientUrl && !allowedOrigins.includes(env_1.config.clientUrl)) {
        allowedOrigins.push(env_1.config.clientUrl);
    }
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint (before auth middleware)
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '2025-07-02-v5-FORCE-REBUILD', // Force rebuild
        corsTest: true,
        env: env_1.config.nodeEnv
    });
});
// Test CORS endpoint
app.options('/test-cors', (req, res) => {
    res.status(200).end();
});
// API Routes (protected by auth middleware in routes/index.ts)
app.use('/api', routes_1.default);
// Error handling
app.use(errorHandler_1.errorHandler);
// Start server
const startServer = async () => {
    try {
        // Test database connection
        await (0, database_1.testConnection)();
        console.log('Database connection successful');
        // Log CORS configuration
        console.log('CORS Configuration:', {
            clientUrl: env_1.config.clientUrl,
            nodeEnv: env_1.config.nodeEnv,
            allowedOrigins: [
                'https://pmackstack.vercel.app',
                'http://localhost:5174',
                'http://localhost:5175',
                env_1.config.clientUrl
            ].filter(Boolean)
        });
        // Start server
        app.listen(env_1.config.port, () => {
            console.log(`Server is running on port ${env_1.config.port}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
