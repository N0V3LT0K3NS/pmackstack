# 🔐 User Management & Access Control Guide

## Overview

Your application has a **sophisticated 3-tier user management system** with role-based access control, multi-brand support, and granular store-level permissions.

## 🎯 User Roles & Permissions

### 1. **Executive** 👑
- **Access Level**: Full system access
- **Permissions**:
  - View all data across all brands (Kilwins + Renoja)
  - Access all stores and metrics
  - Create, update, and delete users
  - Manage user permissions
  - Export data and generate reports
- **Use Case**: Business owners, C-level executives, system administrators

### 2. **Bookkeeper** 📊
- **Access Level**: Financial data across all stores
- **Permissions**:
  - View financial metrics for all stores
  - Enter and edit weekly data
  - Generate financial reports
  - Access dashboard analytics
  - Cannot manage users
- **Use Case**: Accounting staff, financial analysts, data entry specialists

### 3. **Manager** 🏪
- **Access Level**: Limited to assigned stores only
- **Permissions**:
  - View data ONLY for their assigned stores
  - Enter and edit data for their stores
  - Access store-specific dashboards
  - Cannot see other stores' data
  - Cannot manage users
- **Use Case**: Individual store managers, regional managers

## 🏢 Current Store Setup

### **Kilwins Ice Cream Stores**
- `anna` - Anna Store
- `char` - Charlotte Store  
- `fell` - Fell Store
- `vabe` - Vabe Store
- `will` - Will Store

### **Renoja Wellness Studios**
- `ren001` - Renoja Downtown
- `ren002` - Renoja North Shore
- `ren003` - Renoja West Loop

## 🛠 How to Create Real Users

### Method 1: Interactive Script (Recommended)

1. **Run the User Management Script**:
   ```bash
   node scripts/create-user.js
   ```

2. **Login as Executive**:
   - Email: `exec@kilwins.com`
   - Password: `demo123`

3. **Create New Users**:
   - Follow the prompts to add real users
   - Choose appropriate roles
   - Set strong passwords

### Method 2: Direct API Calls

You can also create users by making API calls to your live backend:

```bash
# Login as executive first
curl -X POST https://pmackstack-production-93dc.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"exec@kilwins.com","password":"demo123"}'

# Create a new user (use the token from login response)
curl -X POST https://pmackstack-production-93dc.up.railway.app/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "email": "john.doe@kilwins.com",
    "password": "secure123",
    "fullName": "John Doe", 
    "role": "manager"
  }'
```

## 🏪 Assigning Stores to Managers

Managers need to be assigned to specific stores. Here's how:

### Method 1: Database Console (Railway)

1. **Go to Railway Dashboard**
2. **Open Database Console**
3. **Run the SQL from `scripts/assign-stores.sql`**

### Method 2: Direct SQL

```sql
-- Assign multiple Kilwins stores to a manager
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
WHERE u.email = 'manager@kilwins.com'
  AND u.role = 'manager';
```

## 📋 Common User Setup Scenarios

### Scenario 1: Kilwins Store Manager
```javascript
// Create user via API or script
{
  "email": "manager.anna@kilwins.com",
  "fullName": "Anna Store Manager",
  "role": "manager",
  "password": "SecurePass123"
}

// Then assign stores via SQL
INSERT INTO user_store (user_id, store_code, can_write)
SELECT id, 'anna', true FROM users WHERE email = 'manager.anna@kilwins.com';
```

### Scenario 2: Regional Manager (Multiple Stores)
```javascript
// Create user
{
  "email": "regional.manager@kilwins.com", 
  "fullName": "Regional Manager",
  "role": "manager",
  "password": "SecurePass123"
}

// Assign multiple stores
INSERT INTO user_store (user_id, store_code, can_write)
SELECT u.id, store_code, true
FROM users u
CROSS JOIN (VALUES ('anna'), ('char'), ('fell')) AS stores(store_code)
WHERE u.email = 'regional.manager@kilwins.com';
```

### Scenario 3: Renoja Wellness Manager
```javascript
// Create user
{
  "email": "wellness.manager@renoja.com",
  "fullName": "Renoja Wellness Manager", 
  "role": "manager",
  "password": "SecurePass123"
}

// Assign Renoja stores
INSERT INTO user_store (user_id, store_code, can_write)
SELECT u.id, store_code, true
FROM users u  
CROSS JOIN (VALUES ('ren001'), ('ren002'), ('ren003')) AS stores(store_code)
WHERE u.email = 'wellness.manager@renoja.com';
```

### Scenario 4: Bookkeeper (All Stores Access)
```javascript
// Create user - no store assignment needed
{
  "email": "bookkeeper@company.com",
  "fullName": "Head Bookkeeper",
  "role": "bookkeeper", 
  "password": "SecurePass123"
}
// Bookkeepers automatically get access to all stores
```

## 🔍 Monitoring & Management

### View All Users
```bash
node scripts/create-user.js
# Choose option 2 to list all users
```

### Check Store Assignments
```sql
-- View current store assignments
SELECT 
    u.email,
    u.full_name,
    u.role,
    us.store_code,
    s.store_name,
    b.name as brand_name,
    us.can_write
FROM users u
JOIN user_store us ON u.id = us.user_id
JOIN pos_stores s ON us.store_code = s.store_code
JOIN brands b ON s.brand_id = b.brand_id
ORDER BY u.email, b.name, us.store_code;
```

### Find Unassigned Managers
```sql
-- Managers without any store assignments
SELECT u.email, u.full_name
FROM users u
LEFT JOIN user_store us ON u.id = us.user_id
WHERE u.role = 'manager' AND us.user_id IS NULL;
```

## 🚨 Security Best Practices

### 1. Strong Passwords
- Minimum 8 characters
- Mix of letters, numbers, and symbols
- Avoid common passwords

### 2. Regular Audits
- Review user access quarterly
- Remove inactive users
- Update permissions as needed

### 3. Principle of Least Privilege
- Give users only the minimum access they need
- Regularly review and reduce permissions
- Use manager roles for store-specific access

### 4. Account Management
- Disable accounts instead of deleting (set `is_active = false`)
- Keep audit trails of user changes
- Use proper email addresses for accountability

## 📞 Live URLs

- **Frontend**: https://pmackstack.vercel.app
- **Backend API**: https://pmackstack-production-93dc.up.railway.app
- **Database**: Neon PostgreSQL (via Railway)

## 🔧 Current Demo Accounts

**⚠️ Replace these with real users!**

- **Executive**: `exec@kilwins.com` / `demo123`
- **Bookkeeper**: `bookkeeper@kilwins.com` / `demo123`
- **Manager 1**: `manager1@kilwins.com` / `demo123`
- **Manager 2**: `manager2@kilwins.com` / `demo123`
- **Renoja Manager**: `manager@renoja.com` / `demo123`

## 🎯 Next Steps

1. **Create Real Executive User**
   - Use your actual email
   - Set strong password
   - Test login

2. **Create Real Bookkeeper Users**
   - Add accounting team members
   - Test data entry access

3. **Create Real Manager Users**
   - Add store managers
   - Assign appropriate stores
   - Test store-limited access

4. **Remove Demo Accounts**
   - Once real users are set up
   - Keep system clean

5. **Set Up Regular Backups**
   - Database backups
   - User permission audits

## 📚 API Reference

### User Management Endpoints

- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user info
- `GET /api/users` - List all users (executive only)
- `POST /api/users` - Create user (executive only)
- `PUT /api/users/:id` - Update user (executive only)
- `DELETE /api/users/:id` - Delete user (executive only)

### Data Access Endpoints

- `GET /api/dashboard/overview` - Dashboard data (filtered by role)
- `GET /api/stores` - Store list (filtered by permissions)
- `POST /api/data-entry/weekly` - Submit weekly data
- `GET /api/renoja/dashboard` - Renoja dashboard data

## 🎉 You're Ready!

Your user management system is **production-ready** with:
- ✅ Role-based access control
- ✅ Multi-brand support
- ✅ Store-level permissions
- ✅ Secure authentication
- ✅ Full CRUD operations
- ✅ Audit trails

Use the tools provided to set up your real users and start managing your business data securely! 