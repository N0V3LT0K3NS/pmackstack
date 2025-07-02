import express from 'express';
import { config } from './config/env';
import { testConnection } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

// Manual CORS headers middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://pmackstack.vercel.app',
    'http://localhost:5174',
    'http://localhost:5175'
  ];
  
  // Add CLIENT_URL if set
  if (config.clientUrl && !allowedOrigins.includes(config.clientUrl)) {
    allowedOrigins.push(config.clientUrl);
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
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
    
    // Start server
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 