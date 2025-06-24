import { pool } from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Use a secure secret in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'executive' | 'bookkeeper' | 'manager';
}

export interface AuthResponse {
  user: User;
  token: string;
  stores?: string[]; // For managers, list of assigned stores
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Find user by email
      const userQuery = `
        SELECT id, email, password_hash, full_name, role, is_active
        FROM users
        WHERE LOWER(email) = LOWER($1)
      `;
      
      const userResult = await pool.query(userQuery, [email]);
      
      if (userResult.rows.length === 0) {
        throw new Error('Invalid email or password');
      }
      
      const user = userResult.rows[0];
      
      // Check if user is active
      if (!user.is_active) {
        throw new Error('Account is disabled');
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }
      
      // Get assigned stores for managers
      let stores: string[] = [];
      if (user.role === 'manager') {
        const storesQuery = `
          SELECT store_code 
          FROM user_store 
          WHERE user_id = $1
        `;
        const storesResult = await pool.query(storesQuery, [user.id]);
        stores = storesResult.rows.map(row => row.store_code);
      }
      
      // Generate JWT token
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        stores: stores
      };
      
      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      
      // Return user data and token
      const userData: User = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      };
      
      return {
        user: userData,
        token,
        stores: stores.length > 0 ? stores : undefined
      };
      
    } catch (error) {
      throw error;
    }
  },
  
  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  },
  
  async getUserById(userId: number): Promise<User | null> {
    try {
      const query = `
        SELECT id, email, full_name, role
        FROM users
        WHERE id = $1 AND is_active = true
      `;
      
      const result = await pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  async getUserStores(userId: number): Promise<string[]> {
    try {
      const query = `
        SELECT store_code
        FROM user_store
        WHERE user_id = $1
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => row.store_code);
    } catch (error) {
      throw error;
    }
  }
}; 