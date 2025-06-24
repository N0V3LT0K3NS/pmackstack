# Quick Path to MVP - Executive Dashboard

## 🎯 MVP Core Requirements (from PRD)

The absolute minimum for a valid MVP:
1. **Login via magic link** (no passwords)
2. **Role-based access** (Executive, Bookkeeper, Manager)
3. **9 KPI cards** with specific calculations
4. **Manual data entry** for authorized users
5. **CSV import** capability

## 🚀 Streamlined Implementation Plan

### Option A: Simplified Auth (1 week)
Skip Clerk initially, implement basic auth:
```typescript
// Simple JWT auth without Clerk
- Email/password login (temporarily)
- JWT tokens with role claims
- Middleware to check tokens
- Hardcoded users in database
```

### Option B: Full Clerk Integration (2 weeks)
Implement complete PRD auth spec:
```typescript
// Full Clerk magic link auth
- Clerk integration
- Magic link emails
- Session management
- User sync to database
```

## 📋 Recommended Quick MVP Path (3-4 weeks)

### Week 1: Add Missing KPIs & Basic Auth
**Goal**: Complete all 9 KPI cards and add simple authentication

#### Day 1-2: Add Missing KPIs
```typescript
// Add to dashboard service:
- Total Labor $ (already in DB)
- Sales per Labor Hour
- Transactions per Labor Hour  
- Effective Hourly Wage
- YoY Sales % (dedicated card)
```

#### Day 3-4: Simple Auth System
```typescript
// Minimal auth implementation:
1. Add login page with email/password
2. Generate JWT on backend
3. Store token in localStorage
4. Add auth middleware to API
5. Protect frontend routes
```

#### Day 5: Database Updates
```sql
-- Minimal schema additions:
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed test users
INSERT INTO users (email, password_hash, role) VALUES
  ('exec@company.com', '$2b$10$...', 'executive'),
  ('book@company.com', '$2b$10$...', 'bookkeeper'),
  ('mgr1@company.com', '$2b$10$...', 'manager');
```

### Week 2: Role-Based Access Control
**Goal**: Filter data based on user roles

#### Day 1-2: Backend RBAC
```typescript
// Add to API middleware:
- Extract user role from JWT
- Filter queries based on role
- Executive: all data
- Bookkeeper: all data
- Manager: specific stores only
```

#### Day 3-4: Frontend RBAC
```typescript
// Update React components:
- UserContext with role info
- Conditional UI rendering
- Hide admin features from executives
- Filter store options for managers
```

#### Day 5: Testing Different Roles
- Test each role thoroughly
- Ensure data isolation
- Verify UI permissions

### Week 3: Data Entry Features
**Goal**: Enable data input for authorized users

#### Day 1-2: Manual Entry Form
```typescript
// New component: WeeklyDataEntry.tsx
- Form with all required fields
- Live calculation of derived values
- Validation with Zod
- Submit to new API endpoint
```

#### Day 3-4: CSV Import
```typescript
// New component: CSVImport.tsx
- File upload with PapaParse
- Preview imported data
- Validation & error display
- Bulk insert API endpoint
```

#### Day 5: Polish & Error Handling
- Better validation messages
- Success/error notifications
- Prevent duplicate entries

### Week 4: Performance & Polish
**Goal**: Meet performance requirements and final polish

#### Day 1-2: Query Optimization
```sql
-- Create indexes for common queries
CREATE INDEX idx_weekly_fiscal_year ON pos_weekly_data(fiscal_year);
CREATE INDEX idx_weekly_store_week ON pos_weekly_data(store_code, week_iso);

-- Simple materialized view
CREATE MATERIALIZED VIEW mv_store_summary AS
SELECT store_code, COUNT(*), SUM(total_sales) 
FROM pos_weekly_data 
GROUP BY store_code;
```

#### Day 3: Export Features
```typescript
// Add CSV export:
- Current view to CSV
- Include applied filters
- Download button in UI
```

#### Day 4: Date Presets
```typescript
// Quick filter buttons:
- Last 4 weeks
- Last 13 weeks  
- Last 52 weeks
- YTD
```

#### Day 5: Final Testing
- Performance testing
- Cross-browser testing
- Mobile responsiveness
- Bug fixes

## 🏃‍♂️ Ultra-Fast MVP (2 weeks)

If time is critical, implement only:

### Week 1
1. **Basic Login** (hardcoded users)
2. **Missing KPIs** (5 new cards)
3. **Simple RBAC** (role in JWT)

### Week 2  
1. **Manual Entry Form**
2. **CSV Import**
3. **Basic Export**

Skip for now:
- Clerk integration (use simple auth)
- Materialized views (optimize later)
- Advanced filtering (keep basic)
- Store assignment tables (hardcode)

## 📝 Implementation Checklist

### Immediate Tasks (This Week)
- [ ] Add 5 missing KPI calculations
- [ ] Create login page
- [ ] Add JWT generation/validation
- [ ] Create users table
- [ ] Protect API routes

### Next Week
- [ ] Implement role filtering
- [ ] Build data entry form
- [ ] Add CSV import
- [ ] Test with different roles

### Final Week
- [ ] Optimize slow queries
- [ ] Add export functionality
- [ ] Implement date presets
- [ ] Performance testing
- [ ] Bug fixes

## 🎉 MVP Success Criteria

Your MVP is complete when:
1. ✅ Users can log in
2. ✅ Executives see all data (read-only)
3. ✅ Managers see only their stores
4. ✅ Bookkeepers can enter/import data
5. ✅ All 9 KPIs are displayed
6. ✅ Dashboard loads quickly
7. ✅ Data can be exported

## 💡 Pro Tips

1. **Use existing code** - Your dashboard is 44% complete
2. **Simple auth first** - Upgrade to Clerk later
3. **Hardcode when needed** - Refactor after MVP
4. **Test continuously** - Each role, each feature
5. **Performance last** - Function over speed initially

Remember: MVP = Minimum VIABLE Product. Get it working, then make it perfect. 