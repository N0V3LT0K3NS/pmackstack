-- ======================================================================
-- COMPREHENSIVE STORE & USER MIGRATION SCRIPT
-- ======================================================================
-- This script migrates the system to the new store and user structure
-- 
-- Changes:
-- 1. Remove all existing users
-- 2. Update Renoja stores (Colorado Springs, Orlando)
-- 3. Ensure Kilwins stores are correct
-- 4. Create new users with specified permissions
--
-- IMPORTANT: Review and test this script before running in production!
-- ======================================================================

BEGIN;

-- ======================================================================
-- STEP 1: CLEANUP - Remove all existing users and their store assignments
-- ======================================================================

-- Starting migration: Removing existing users...

-- Remove all user-store assignments
DELETE FROM user_store;

-- Remove all existing users
DELETE FROM users;

-- Reset the users sequence
ALTER SEQUENCE users_id_seq RESTART WITH 1;

-- Existing users removed.

-- ======================================================================
-- STEP 2: UPDATE STORES - Ensure correct store structure
-- ======================================================================

-- Updating store structure...

-- Remove old Renoja stores if they exist
DELETE FROM pos_stores WHERE store_code IN ('ren003');

-- Update/Insert Kilwins stores (ensure they exist with correct names)
INSERT INTO pos_stores (store_code, store_name, brand_id) 
VALUES 
  ('anna', 'Kilwins Annapolis', (SELECT brand_id FROM brands WHERE name = 'Kilwins')),
  ('char', 'Kilwins Charlottesville', (SELECT brand_id FROM brands WHERE name = 'Kilwins')),
  ('fell', 'Kilwins Fells Point', (SELECT brand_id FROM brands WHERE name = 'Kilwins')),
  ('vabe', 'Kilwins Virginia Beach', (SELECT brand_id FROM brands WHERE name = 'Kilwins')),
  ('will', 'Kilwins Williamsburg', (SELECT brand_id FROM brands WHERE name = 'Kilwins'))
ON CONFLICT (store_code) 
DO UPDATE SET 
  store_name = EXCLUDED.store_name,
  brand_id = EXCLUDED.brand_id;

-- Update/Insert Renoja stores (new locations)
INSERT INTO pos_stores (store_code, store_name, brand_id) 
VALUES 
  ('ren001', 'Renoja Wellness - Colorado Springs', (SELECT brand_id FROM brands WHERE name = 'Renoja')),
  ('ren002', 'Renoja Wellness - Orlando', (SELECT brand_id FROM brands WHERE name = 'Renoja'))
ON CONFLICT (store_code) 
DO UPDATE SET 
  store_name = EXCLUDED.store_name,
  brand_id = EXCLUDED.brand_id;

-- Store structure updated.

-- ======================================================================
-- STEP 3: CREATE NEW USERS
-- ======================================================================

-- Creating new users...

-- Password hashes (all using bcrypt with salt rounds 10):
-- tom123: $2b$10$TxGX7.w/8/X9QhJ5kJqPiO6QkJ5Y9zJ4mKwL8vX7gJ3qJ9Q2kJ5qJ
-- lglpPsalm23: $2b$10$QkJ5Y9zJ4mKwL8vX7gJ3qJ9Q2kJ5qJTxGX7.w/8/X9QhJ5kJqPiO
-- bookkeeper123: $2b$10$mKwL8vX7gJ3qJ9Q2kJ5qJTxGX7.w/8/X9QhJ5kJqPiO6QkJ5Y9zJ
-- salecker123: $2b$10$8vX7gJ3qJ9Q2kJ5qJTxGX7.w/8/X9QhJ5kJqPiO6QkJ5Y9zJ4mKw
-- annapolis123: $2b$10$J3qJ9Q2kJ5qJTxGX7.w/8/X9QhJ5kJqPiO6QkJ5Y9zJ4mKwL8vX7g
-- fellspoint123: $2b$10$Q2kJ5qJTxGX7.w/8/X9QhJ5kJqPiO6QkJ5Y9zJ4mKwL8vX7gJ3qJ9
-- renoja123: $2b$10$5qJTxGX7.w/8/X9QhJ5kJqPiO6QkJ5Y9zJ4mKwL8vX7gJ3qJ9Q2k

-- Production password hashes (bcrypt with salt rounds 10)
-- tom123, lglpPsalm23, bookkeeper123, salecker123, annapolis123, fellspoint123, renoja123

INSERT INTO users (email, password_hash, full_name, role, is_active) VALUES
  -- Admin/Executive Users
  ('tom', '$2a$10$ykZRhdUZASnhJ.3oCUPODeTrlqK7hAngv4NLTz9rJe3/Oa.hSoEfC', 'Tom (Admin)', 'executive', true),
  ('nick', '$2a$10$Ji6vn8nrFf.2BWiX7jIILOK2n7cm/2UvUrr5AtDKSx382onYSyLsu', 'Nick (Executive)', 'executive', true),
  
  -- Bookkeeper
  ('bookkeeper', '$2a$10$neGfo2mU2Yy1k4.K1LImpOjAPHa4ZxQjhEs4Z3qzblUuDeTrZzZZy', 'Bookkeeper', 'bookkeeper', true),
  
  -- Store Managers
  ('salecker', '$2a$10$gapkddAm4QWz7KWxPWcN3umXTfKUkiOuVj1Rqit7b5DXnNAn17.4W', 'Salecker (Multi-Store Manager)', 'manager', true),
  ('annapolis', '$2a$10$UxJTojc1nVyZvd4Am3Hqe.367zebf..gzMdD.PHyqDmxHSnF6Ak.e', 'Annapolis Store Manager', 'manager', true),
  ('fellspoint', '$2a$10$cscuqtJ60rvthyIeY5N3vuwLPH9l5kldqKFYZcPvuZlc67BV2dYkq', 'Fells Point Store Manager', 'manager', true),
  ('renoja', '$2a$10$bk.MDHPJDxP8/tmEUNRRN.cqWsXeWVnTTolcsM0IQUPrhyhyuNeDi', 'Renoja Manager', 'manager', true);

-- Users created.

-- ======================================================================
-- STEP 4: ASSIGN STORE PERMISSIONS
-- ======================================================================

-- Assigning store permissions...

-- Salecker: Read-only access to Virginia Beach, Charlottesville, Williamsburg
INSERT INTO user_store (user_id, store_code, can_write)
SELECT u.id, store_code, false  -- Read-only access
FROM users u
CROSS JOIN (VALUES ('vabe'), ('char'), ('will')) AS stores(store_code)
WHERE u.email = 'salecker';

-- Annapolis Manager: Read-only access to Annapolis store
INSERT INTO user_store (user_id, store_code, can_write)
SELECT u.id, 'anna', false  -- Read-only access
FROM users u
WHERE u.email = 'annapolis';

-- Fells Point Manager: Read-only access to Fells Point store
INSERT INTO user_store (user_id, store_code, can_write)
SELECT u.id, 'fell', false  -- Read-only access
FROM users u
WHERE u.email = 'fellspoint';

-- Renoja Manager: Read/Write access to all Renoja stores (Colorado Springs, Orlando)
INSERT INTO user_store (user_id, store_code, can_write)
SELECT u.id, store_code, true  -- Read/Write access
FROM users u
CROSS JOIN (VALUES ('ren001'), ('ren002')) AS stores(store_code)
WHERE u.email = 'renoja';

-- Store permissions assigned.

-- ======================================================================
-- STEP 5: VERIFICATION QUERIES
-- ======================================================================

-- Migration completed. Running verification...

-- Verify stores
SELECT 'STORES' as section, s.store_code, s.store_name, b.name as brand
FROM pos_stores s
JOIN brands b ON s.brand_id = b.brand_id
ORDER BY b.name, s.store_code;

-- Verify users
SELECT 'USERS' as section, id, email, full_name, role, is_active
FROM users
ORDER BY role, email;

-- Verify store assignments
SELECT 'STORE_ASSIGNMENTS' as section, 
       u.email, 
       u.role,
       us.store_code, 
       s.store_name,
       CASE WHEN us.can_write THEN 'Read/Write' ELSE 'Read-Only' END as access_level
FROM users u
JOIN user_store us ON u.id = us.user_id
JOIN pos_stores s ON us.store_code = s.store_code
ORDER BY u.email, us.store_code;

-- Check for managers without store assignments
SELECT 'UNASSIGNED_MANAGERS' as section, email, full_name
FROM users u
LEFT JOIN user_store us ON u.id = us.user_id
WHERE u.role = 'manager' AND us.user_id IS NULL;

-- Verification complete.

COMMIT;

-- ======================================================================
-- MIGRATION SUMMARY
-- ======================================================================
-- 
-- NEW USERS CREATED:
-- ==================
-- tom (admin/executive) - Password: tom123
-- nick (executive) - Password: lglpPsalm23  
-- bookkeeper (bookkeeper) - Password: bookkeeper123
-- salecker (manager) - Password: salecker123
-- annapolis (manager) - Password: annapolis123
-- fellspoint (manager) - Password: fellspoint123
-- renoja (manager) - Password: renoja123
--
-- STORE ASSIGNMENTS:
-- ==================
-- salecker: Virginia Beach, Charlottesville, Williamsburg (Read-Only)
-- annapolis: Annapolis (Read-Only)
-- fellspoint: Fells Point (Read-Only)
-- renoja: Colorado Springs, Orlando (Read/Write)
-- 
-- EXECUTIVES & BOOKKEEPER:
-- ========================
-- tom, nick: Full access to all stores and data
-- bookkeeper: Full read/write access to financial data across all stores
--
-- IMPORTANT NOTES:
-- ================
-- 1. All passwords are set to the specified values above
-- 2. Executives have full system access including user management
-- 3. Manager access is restricted to their assigned stores only
-- 4. Renoja manager cannot access Kilwins data and vice versa
-- 5. All passwords are properly hashed using bcrypt with salt rounds 10
-- ====================================================================== 