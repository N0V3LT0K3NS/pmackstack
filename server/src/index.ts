import express from 'express';
import { config } from './config/env';
import { testConnection, closePool } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

// Manual CORS headers middleware (optimized)
const allowedOrigins = [
  'https://pmackstack.vercel.app',
  'http://localhost:5174',
  'http://localhost:5175'
];

// Add CLIENT_URL if set and not already included
if (config.clientUrl && !allowedOrigins.includes(config.clientUrl)) {
  allowedOrigins.push(config.clientUrl);
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (before auth middleware)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2025-07-02-v5-FORCE-REBUILD', // Force rebuild
    corsTest: true,
    env: config.nodeEnv
  });
});

// Test CORS endpoint
app.options('/test-cors', (req, res) => {
  res.status(200).end();
});

// API Routes (protected by auth middleware in routes/index.ts)
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    console.log('Database connection successful');
    
    // Log CORS configuration
    console.log('CORS Configuration:', {
      clientUrl: config.clientUrl,
      nodeEnv: config.nodeEnv,
      allowedOrigins: [
        'https://pmackstack.vercel.app',
        'http://localhost:5174',
        'http://localhost:5175',
        config.clientUrl
      ].filter(Boolean)
    });
    
    // Memory monitoring
    const logMemoryUsage = () => {
      const used = process.memoryUsage();
      console.log('Memory Usage:', {
        rss: Math.round(used.rss / 1024 / 1024) + 'MB',
        heapTotal: Math.round(used.heapTotal / 1024 / 1024) + 'MB',
        heapUsed: Math.round(used.heapUsed / 1024 / 1024) + 'MB',
        external: Math.round(used.external / 1024 / 1024) + 'MB'
      });
    };
    
    // Log memory every 5 minutes
    setInterval(logMemoryUsage, 5 * 60 * 1000);
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully');
      logMemoryUsage();
      await closePool();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully');
      logMemoryUsage();
      await closePool();
      process.exit(0);
    });
    
    // Start server
    const server = app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      logMemoryUsage(); // Initial memory log
    });
    
    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      logMemoryUsage();
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};
  
startServer(); 