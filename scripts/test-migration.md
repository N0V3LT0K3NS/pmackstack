# 🧪 Migration Testing Guide

## Overview
This guide shows you how to safely test the store and user migration before running it on production.

## 🎯 Testing Strategy

### Option 1: Railway Test Database (Recommended)
1. **Create a new Railway service**
2. **Deploy PostgreSQL database**
3. **Copy current schema** to test database
4. **Run migration on test database**
5. **Test thoroughly**

### Option 2: Local PostgreSQL Testing
1. **Install PostgreSQL locally**
2. **Create test database**
3. **Import current schema**
4. **Run migration**
5. **Test with local frontend**

### Option 3: Database Backup/Restore
1. **Backup current database**
2. **Run migration on production**
3. **Restore if issues occur**
4. **⚠️ NOT recommended - risky**

## 🚀 **Method 1: Railway Test Database Setup**

### Step 1: Create Test Database
```bash
# In Railway dashboard:
# 1. Create new project: "pmackstack-test"
# 2. Add PostgreSQL service
# 3. Note the connection string
```

### Step 2: Export Current Schema
```bash
# Export current database schema (without data)
pg_dump -h ep-steep-moon-a8q2x8sg-pooler.eastus2.azure.neon.tech \
        -U neondb_owner \
        -d neondb \
        --schema-only \
        --no-owner \
        --no-privileges \
        -f current_schema.sql
```

### Step 3: Import Schema to Test Database
```bash
# Import schema to test database
psql -h [TEST_DB_HOST] -U [TEST_DB_USER] -d [TEST_DB_NAME] -f current_schema.sql
```

### Step 4: Add Sample Data (Optional)
```sql
-- Add minimal sample data to test with
INSERT INTO brands (brand_id, name) VALUES 
(1, 'Kilwins'),
(2, 'Renoja');

INSERT INTO pos_stores (store_code, store_name, brand_id) VALUES 
('anna', 'Kilwins Annapolis', 1),
('char', 'Kilwins Charlottesville', 1),
('fell', 'Kilwins Fells Point', 1),
('vabe', 'Kilwins Virginia Beach', 1),
('will', 'Kilwins Williamsburg', 1),
('ren001', 'Renoja Colorado Springs', 2),
('ren002', 'Renoja Orlando', 2),
('ren003', 'Renoja Old Location', 2);

-- Add a test user to be removed
INSERT INTO users (email, password_hash, full_name, role, is_active) VALUES
('test@example.com', '$2a$10$demo.hash', 'Test User', 'manager', true);
```

### Step 5: Run Migration on Test Database
```bash
# Connect to test database and run migration
psql -h [TEST_DB_HOST] -U [TEST_DB_USER] -d [TEST_DB_NAME] -f scripts/store-user-migration.sql
```

## 🔍 **Method 2: Local PostgreSQL Testing**

### Step 1: Install PostgreSQL Locally
```bash
# macOS
brew install postgresql
brew services start postgresql

# Create test database
createdb pmackstack_test
```

### Step 2: Set Up Test Environment
```bash
# Create .env.test file
cp server/.env server/.env.test

# Edit server/.env.test
DATABASE_URL=postgresql://localhost:5432/pmackstack_test
NODE_ENV=test
```

### Step 3: Import Schema and Run Migration
```bash
# Import current schema
pg_dump [PRODUCTION_DB_URL] --schema-only --no-owner --no-privileges | psql postgresql://localhost:5432/pmackstack_test

# Run migration
psql postgresql://localhost:5432/pmackstack_test -f scripts/store-user-migration.sql
```

### Step 4: Test with Local Frontend
```bash
# Update client/.env.local
VITE_API_URL=http://localhost:3002

# Start backend with test database
cd server
NODE_ENV=test npm run dev

# Start frontend
cd ../client
npm run dev
```

## ✅ **Testing Checklist**

### Database Tests
- [ ] Migration script runs without errors
- [ ] All 7 new users created correctly
- [ ] Old users removed completely
- [ ] Store assignments are correct
- [ ] Renoja stores updated (Colorado Springs, Orlando)
- [ ] Old renoja store (ren003) removed
- [ ] User permissions match requirements

### Login Tests
- [ ] **tom** (executive) - can login with `tom123`
- [ ] **nick** (executive) - can login with `lglpPsalm23`
- [ ] **bookkeeper** - can login with `bookkeeper123`
- [ ] **salecker** - can login with `salecker123`
- [ ] **annapolis** - can login with `annapolis123`
- [ ] **fellspoint** - can login with `fellspoint123`
- [ ] **renoja** - can login with `renoja123`

### Permission Tests
- [ ] **tom & nick** see all stores (Kilwins + Renoja)
- [ ] **bookkeeper** sees all financial data
- [ ] **salecker** sees only: Virginia Beach, Charlottesville, Williamsburg
- [ ] **annapolis** sees only: Annapolis store
- [ ] **fellspoint** sees only: Fells Point store
- [ ] **renoja** sees only: Colorado Springs, Orlando (read/write)

### Frontend Tests
- [ ] Store filter shows correct stores
- [ ] Dashboard displays appropriate data per user
- [ ] Data entry restricted to authorized users
- [ ] Navigation works properly
- [ ] No errors in browser console

## 🐛 **Common Issues & Solutions**

### Migration Fails
```sql
-- Check if brands table exists
SELECT * FROM brands;

-- Check if previous migrations ran
SELECT * FROM pg_tables WHERE tablename LIKE '%user%';
```

### Login Issues
```sql
-- Verify user creation
SELECT email, role, is_active FROM users;

-- Check password hashes
SELECT email, LEFT(password_hash, 10) as hash_preview FROM users;
```

### Permission Issues
```sql
-- Check store assignments
SELECT u.email, us.store_code, us.can_write 
FROM users u 
JOIN user_store us ON u.id = us.user_id;
```

## 📋 **Test SQL Queries**

### Quick Verification Queries
```sql
-- Count users by role
SELECT role, COUNT(*) FROM users GROUP BY role;

-- List all store assignments
SELECT u.email, u.role, us.store_code, us.can_write
FROM users u
LEFT JOIN user_store us ON u.id = us.user_id
ORDER BY u.email;

-- Check store structure
SELECT s.store_code, s.store_name, b.name as brand
FROM pos_stores s
JOIN brands b ON s.brand_id = b.brand_id
ORDER BY b.name, s.store_code;
```

## 🎯 **Next Steps After Successful Testing**

1. **Document any issues** found during testing
2. **Fix any problems** in the migration script
3. **Re-test** until everything works perfectly
4. **Run on production** with confidence
5. **Monitor closely** after production deployment

## 🚨 **Emergency Rollback Plan**

If something goes wrong in production:
```sql
-- Emergency rollback
BEGIN;
DELETE FROM user_store;
DELETE FROM users;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
-- Restore from backup if available
COMMIT;
``` 