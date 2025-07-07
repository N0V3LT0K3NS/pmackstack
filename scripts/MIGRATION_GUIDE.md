# 🚀 Store & User Migration Guide

## Overview
This guide walks you through migrating your PMackstack application to the new store and user structure.

## ⚠️ IMPORTANT WARNINGS
- **This migration will DELETE ALL existing users and their data**
- **Make sure to backup your database before running this**
- **Test this on a development environment first**

## 📋 What This Migration Does

### 🏪 Store Changes
- **Removes**: Old Renoja store (ren003)
- **Updates**: Renoja stores to Colorado Springs (ren001) and Orlando (ren002)
- **Keeps**: All existing Kilwins stores (anna, char, fell, vabe, will)

### 👥 User Changes
- **Removes**: ALL existing users
- **Creates**: 7 new users with specified passwords and permissions

## 🔑 New Users Created

| Username | Password | Role | Access |
|----------|----------|------|--------|
| `tom` | `tom123` | Executive | Full admin access to everything |
| `nick` | `lglpPsalm23` | Executive | Full access to all Kilwins & Renoja |
| `bookkeeper` | `bookkeeper123` | Bookkeeper | Financial data across all stores |
| `salecker` | `salecker123` | Manager | Read-only: Virginia Beach, Charlottesville, Williamsburg |
| `annapolis` | `annapolis123` | Manager | Read-only: Annapolis store |
| `fellspoint` | `fellspoint123` | Manager | Read-only: Fells Point store |
| `renoja` | `renoja123` | Manager | Read/Write: All Renoja stores (Colorado Springs, Orlando) |

## 🚀 How to Run the Migration

### Option 1: Railway Database Console
1. **Log into Railway Dashboard**
2. **Go to your database service**
3. **Open the "Query" tab**
4. **Copy and paste the entire contents of `scripts/store-user-migration.sql`**
5. **Click "Run Query"**

### Option 2: Command Line (if you have psql access)
```bash
# Connect to your database
psql postgresql://neondb_owner:npg_rtjyKc0hWJ1o@ep-steep-moon-a8q2x8sg-pooler.eastus2.azure.neon.tech/neondb?sslmode=require

# Run the migration
\i scripts/store-user-migration.sql
```

### Option 3: Direct Database Connection
```bash
# From project root
psql "postgresql://neondb_owner:npg_rtjyKc0hWJ1o@ep-steep-moon-a8q2x8sg-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require" -f scripts/store-user-migration.sql
```

## ✅ After Migration - Verification

1. **Test Login**: Try logging in with each new user
2. **Check Permissions**: Verify each user can only access their assigned stores
3. **Verify Store Data**: Make sure store names and assignments are correct

### Test Login Sequence
```bash
# Test each login at: https://pmackstack.vercel.app

# Executive access (should see everything)
Username: tom
Password: tom123

Username: nick  
Password: lglpPsalm23

# Bookkeeper access (should see financial data)
Username: bookkeeper
Password: bookkeeper123

# Manager access (should see only assigned stores)
Username: salecker
Password: salecker123

Username: annapolis
Password: annapolis123

Username: fellspoint
Password: fellspoint123

Username: renoja
Password: renoja123
```

## 🔧 Troubleshooting

### If the migration fails:
1. **Check the error message** - it will tell you exactly what went wrong
2. **Common issues**:
   - Brands table not existing (run previous migrations first)
   - User table constraints
   - Store conflicts

### If you need to rollback:
```sql
-- Emergency rollback (removes all users created by migration)
BEGIN;
DELETE FROM user_store;
DELETE FROM users;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
COMMIT;
```

## 📞 Support
If you encounter any issues:
1. **Check the verification queries** at the end of the migration script
2. **Review the error messages** carefully
3. **Make sure all dependencies are met** (brands table, etc.)

## 🎯 Next Steps After Migration
1. **Update your development branch** with any additional changes
2. **Test all user roles** thoroughly
3. **Verify store data** is displaying correctly
4. **Check that permissions** are working as expected
5. **Consider changing passwords** for security if needed 