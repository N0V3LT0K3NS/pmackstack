-- ======================================================
-- Store Assignment Script for Managers
-- ======================================================
-- This script helps assign stores to manager users
-- Run this in your database console (Railway or directly)

-- 1. VIEW ALL USERS
-- ================
SELECT 
    id,
    email,
    full_name,
    role,
    is_active,
    created_at
FROM users 
ORDER BY role, created_at DESC;

-- 2. VIEW ALL STORES
-- ==================
SELECT 
    s.store_code,
    s.store_name,
    b.name as brand_name
FROM pos_stores s
JOIN brands b ON s.brand_id = b.brand_id
ORDER BY b.name, s.store_code;

-- 3. VIEW CURRENT STORE ASSIGNMENTS
-- ==================================
SELECT 
    u.email,
    u.full_name,
    u.role,
    us.store_code,
    s.store_name,
    b.name as brand_name,
    us.can_write,
    us.created_at
FROM users u
JOIN user_store us ON u.id = us.user_id
JOIN pos_stores s ON us.store_code = s.store_code
JOIN brands b ON s.brand_id = b.brand_id
ORDER BY u.email, b.name, us.store_code;

-- 4. ASSIGN STORES TO MANAGER EXAMPLES
-- =====================================

-- Example 1: Assign Kilwins stores to a manager
-- Replace 'manager@company.com' with actual manager email
-- Replace store codes with the ones you want to assign

INSERT INTO user_store (user_id, store_code, can_write)
SELECT 
    u.id,
    'anna',  -- Store code
    true     -- Can write data
FROM users u
WHERE u.email = 'manager@company.com'
  AND u.role = 'manager'
ON CONFLICT (user_id, store_code) 
DO UPDATE SET 
    can_write = EXCLUDED.can_write,
    created_at = NOW();

-- Example 2: Assign multiple stores at once
-- Replace 'manager@company.com' with actual manager email
INSERT INTO user_store (user_id, store_code, can_write)
SELECT 
    u.id,
    store_code,
    true
FROM users u
CROSS JOIN (
    VALUES 
        ('anna'), 
        ('char'), 
        ('fell')
) AS stores(store_code)
WHERE u.email = 'manager@company.com'
  AND u.role = 'manager'
ON CONFLICT (user_id, store_code) 
DO UPDATE SET 
    can_write = EXCLUDED.can_write,
    created_at = NOW();

-- Example 3: Assign Renoja stores to a manager
INSERT INTO user_store (user_id, store_code, can_write)
SELECT 
    u.id,
    store_code,
    true
FROM users u
CROSS JOIN (
    VALUES 
        ('ren001'), 
        ('ren002'), 
        ('ren003')
) AS stores(store_code)
WHERE u.email = 'renojamanager@company.com'
  AND u.role = 'manager'
ON CONFLICT (user_id, store_code) 
DO UPDATE SET 
    can_write = EXCLUDED.can_write,
    created_at = NOW();

-- 5. REMOVE STORE ASSIGNMENTS
-- ============================

-- Remove specific store from a manager
DELETE FROM user_store 
WHERE user_id = (SELECT id FROM users WHERE email = 'manager@company.com')
  AND store_code = 'anna';

-- Remove all store assignments from a manager
DELETE FROM user_store 
WHERE user_id = (SELECT id FROM users WHERE email = 'manager@company.com');

-- 6. QUICK TEMPLATE FOR NEW MANAGER
-- ==================================

-- Step 1: Create the manager user (use the Node.js script or this SQL)
-- INSERT INTO users (email, password_hash, full_name, role)
-- VALUES (
--     'newmanager@company.com',
--     '$2b$10$kBc5qqr.y3A1Jh5jqnYtA.FLqWqaJqT8XBxjbT4hxQ/6.qKGcO0bC', -- password: demo123
--     'Manager Full Name',
--     'manager'
-- );

-- Step 2: Assign stores to the new manager
-- INSERT INTO user_store (user_id, store_code, can_write)
-- SELECT 
--     u.id,
--     store_code,
--     true
-- FROM users u
-- CROSS JOIN (
--     VALUES 
--         ('anna'), 
--         ('char')
-- ) AS stores(store_code)
-- WHERE u.email = 'newmanager@company.com'
--   AND u.role = 'manager';

-- ======================================================
-- USEFUL QUERIES FOR MONITORING
-- ======================================================

-- Check which managers have no stores assigned
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role
FROM users u
LEFT JOIN user_store us ON u.id = us.user_id
WHERE u.role = 'manager'
  AND us.user_id IS NULL;

-- Count stores per manager
SELECT 
    u.email,
    u.full_name,
    COUNT(us.store_code) as store_count,
    STRING_AGG(us.store_code, ', ') as assigned_stores
FROM users u
LEFT JOIN user_store us ON u.id = us.user_id
WHERE u.role = 'manager'
GROUP BY u.id, u.email, u.full_name
ORDER BY store_count DESC;

-- Check stores without any manager assigned
SELECT 
    s.store_code,
    s.store_name,
    b.name as brand_name
FROM pos_stores s
JOIN brands b ON s.brand_id = b.brand_id
LEFT JOIN user_store us ON s.store_code = us.store_code
WHERE us.store_code IS NULL
ORDER BY b.name, s.store_code; 