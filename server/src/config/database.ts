import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

// Fallback to known working database URL if not set
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_rtjyKc0hWJ1o@ep-steep-moon-a8q2x8sg-pooler.eastus2.azure.neon.tech/neondb?sslmode=require';

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connected successfully:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
} 