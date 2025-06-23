import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { testConnection } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

// Middleware
app.use(cors({
  origin: config.clientUrl,
  credentials: true
}));
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
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }

    app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🌐 CORS enabled for: ${config.clientUrl}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 