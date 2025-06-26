-- Migration: Add Renoja brand and initial setup
-- This migration adds Renoja as a new brand and creates initial stores

-- Step 1: Add Renoja to brands table (if it doesn't exist)
INSERT INTO brands (name) 
VALUES ('Renoja')
ON CONFLICT (name) DO NOTHING;

-- Step 2: Add Renoja stores to pos_stores table
-- Using 'ren' prefix for Renoja store codes to distinguish from Kilwins
INSERT INTO pos_stores (store_code, store_name, brand_id) 
VALUES 
  ('ren001', 'Renoja Wellness - Downtown', (SELECT brand_id FROM brands WHERE name = 'Renoja')),
  ('ren002', 'Renoja Wellness - North Shore', (SELECT brand_id FROM brands WHERE name = 'Renoja')),
  ('ren003', 'Renoja Wellness - West Loop', (SELECT brand_id FROM brands WHERE name = 'Renoja'))
ON CONFLICT (store_code) DO NOTHING;

-- Step 3: Grant access to existing test users for Renoja stores
-- Give bookkeeper access to all Renoja stores
INSERT INTO user_store (user_id, store_code)
SELECT u.id, s.store_code
FROM users u
CROSS JOIN pos_stores s
WHERE u.email = 'bookkeeper@kilwins.com'
  AND s.store_code LIKE 'ren%'
ON CONFLICT (user_id, store_code) DO NOTHING;

-- Give executive read access to all Renoja stores (though they already have global access)
INSERT INTO user_store (user_id, store_code)
SELECT u.id, s.store_code
FROM users u
CROSS JOIN pos_stores s
WHERE u.email = 'exec@kilwins.com'
  AND s.store_code LIKE 'ren%'
ON CONFLICT (user_id, store_code) DO NOTHING;

-- Give manager3 access to Renoja stores (new Renoja manager)
-- First, let's create a Renoja manager if it doesn't exist
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'manager@renoja.com',
  '$2b$10$XQ1zJqW0L0kM6TQtH8kPLO5H5h8kWyHtMZLJdU7J6qKvYkBxXhILi', -- password: demo123
  'Renoja Manager',
  'manager',
  true
)
ON CONFLICT (email) DO NOTHING;

-- Assign Renoja stores to the Renoja manager
INSERT INTO user_store (user_id, store_code)
SELECT u.id, s.store_code
FROM users u
CROSS JOIN pos_stores s
WHERE u.email = 'manager@renoja.com'
  AND s.store_code LIKE 'ren%'
ON CONFLICT (user_id, store_code) DO NOTHING; 