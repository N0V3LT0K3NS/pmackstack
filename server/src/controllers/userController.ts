import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';
import { config } from '../config/env';

const sql = neon(config.databaseUrl);

export const userController = {
  // Validation middleware
  validateCreateUser: [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('fullName').notEmpty().trim(),
    body('role').isIn(['executive', 'bookkeeper', 'manager'])
  ],

  validateUpdateUser: [
    body('email').optional().isEmail().normalizeEmail(),
    body('password').optional().isLength({ min: 6 }),
    body('fullName').optional().notEmpty().trim(),
    body('role').optional().isIn(['executive', 'bookkeeper', 'manager']),
    body('isActive').optional().isBoolean()
  ],

  // Get all users (executive only)
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await sql`
        SELECT id, email, full_name, role, is_active, created_at, updated_at
        FROM users 
        ORDER BY created_at DESC
      `;

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  },

  // Create new user (executive only)
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { email, password, fullName, role } = req.body;

      // Check if user already exists
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${email}
      `;

      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
      }

      // Hash password
      const passwordHash = bcrypt.hashSync(password, 10);

      // Insert user
      const newUser = await sql`
        INSERT INTO users (email, password_hash, full_name, role)
        VALUES (${email}, ${passwordHash}, ${fullName}, ${role})
        RETURNING id, email, full_name, role, is_active, created_at
      `;

      res.status(201).json({
        success: true,
        data: newUser[0]
      });
    } catch (error) {
      next(error);
    }
  },

  // Update user (executive only)
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { id } = req.params;
      const { email, password, fullName, role, isActive } = req.body;

      // Build update object
      const updates: any = {};
      if (email) updates.email = email;
      if (fullName) updates.full_name = fullName;
      if (role) updates.role = role;
      if (typeof isActive === 'boolean') updates.is_active = isActive;
      if (password) updates.password_hash = bcrypt.hashSync(password, 10);

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      // Simple approach: handle each field individually
      let updatedUser;
      if (password && email && fullName && role && typeof isActive === 'boolean') {
        updatedUser = await sql`
          UPDATE users 
          SET email = ${email}, password_hash = ${updates.password_hash}, 
              full_name = ${fullName}, role = ${role}, is_active = ${isActive}, 
              updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, email, full_name, role, is_active, updated_at
        `;
      } else if (password) {
        updatedUser = await sql`
          UPDATE users 
          SET password_hash = ${updates.password_hash}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, email, full_name, role, is_active, updated_at
        `;
      } else if (email) {
        updatedUser = await sql`
          UPDATE users 
          SET email = ${email}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, email, full_name, role, is_active, updated_at
        `;
      } else if (fullName) {
        updatedUser = await sql`
          UPDATE users 
          SET full_name = ${fullName}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, email, full_name, role, is_active, updated_at
        `;
      } else if (role) {
        updatedUser = await sql`
          UPDATE users 
          SET role = ${role}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, email, full_name, role, is_active, updated_at
        `;
      } else if (typeof isActive === 'boolean') {
        updatedUser = await sql`
          UPDATE users 
          SET is_active = ${isActive}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, email, full_name, role, is_active, updated_at
        `;
      }

      if (!updatedUser || updatedUser.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: updatedUser[0]
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete user (executive only)
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const deletedUser = await sql`
        DELETE FROM users 
        WHERE id = ${id}
        RETURNING id, email
      `;

      if (deletedUser.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
        data: deletedUser[0]
      });
    } catch (error) {
      next(error);
    }
  }
}; 