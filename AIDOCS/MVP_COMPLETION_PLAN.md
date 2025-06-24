# MVP Completion Plan - Executive Dashboard

## Current State Analysis

### ✅ What's Working Well
1. **Database**: PostgreSQL (Neon) with 5 stores and data from 2017-2025
2. **Backend**: Express + TypeScript API serving dashboard data
3. **Frontend**: React + Vite with working KPI cards, charts, and filters
4. **Data Models**: Comprehensive types in shared folder
5. **Development Setup**: Working start script and hot reload

### Current vs PRD Schema Mapping
- `pos_stores` → PRD's `stores` table (missing: brand_id, city, state, timezone)
- `pos_weekly_data` → PRD's `weekly_metrics` table (has all required fields + more)
- Missing tables: `brands`, `users`, `user_store`

## Implementation Strategy
**Keep the current working architecture** while adding PRD features incrementally.

## Phase 1: Authentication & Security (Priority 1)
**Goal**: Add Clerk authentication without breaking current functionality

### 1.1 Add Clerk Authentication
```bash
cd client && npm install @clerk/clerk-react
cd ../server && npm install @clerk/express jsonwebtoken
```

### 1.2 Environment Setup
- Add Clerk keys to `.env` files
- Create Clerk application with magic link auth

### 1.3 Frontend Integration
- Wrap App.tsx with ClerkProvider
- Add SignIn component
- Protect routes with authentication

### 1.4 Backend Integration
- Add Clerk middleware to Express
- Verify JWT tokens on API routes
- Add user context to requests

**Deliverables**: Working auth without breaking existing dashboard

## Phase 2: Database Evolution (Priority 2)
**Goal**: Extend schema to support multi-tenant features

### 2.1 Add Missing Tables (Non-Breaking)
```sql
-- Add brands table
CREATE TABLE brands (
  brand_id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);
INSERT INTO brands (name) VALUES ('Kilwins');

-- Add brand_id to stores (nullable initially)
ALTER TABLE pos_stores ADD COLUMN brand_id INT REFERENCES brands(brand_id);
UPDATE pos_stores SET brand_id = 1; -- Set all to Kilwins

-- Add missing store fields
ALTER TABLE pos_stores ADD COLUMN city TEXT;
ALTER TABLE pos_stores ADD COLUMN state TEXT;
ALTER TABLE pos_stores ADD COLUMN timezone TEXT DEFAULT 'US/Eastern';

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('executive','bookkeeper','manager')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user-store mapping
CREATE TABLE user_store (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  store_code TEXT REFERENCES pos_stores(store_code) ON DELETE CASCADE,
  can_write BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, store_code)
);
```

### 2.2 Create Migration Scripts
- Script to run new tables
- Script to update store information
- Seed initial users and permissions

**Deliverables**: Extended schema supporting multi-tenant, no data loss

## Phase 3: Role-Based Access Control (Priority 3)
**Goal**: Implement role-based data filtering

### 3.1 Backend Middleware
- Create role extraction middleware
- Add user context to all queries
- Filter data based on user permissions

### 3.2 Frontend Context
- Create UserContext with role/permissions
- Update hooks to respect permissions
- Hide/show UI based on roles

### 3.3 API Updates
- Modify queries to filter by user access
- Add permission checks to endpoints
- Return 403 for unauthorized access

**Deliverables**: Data filtered by user role and store access

## Phase 4: Data Entry Features (Priority 4)
**Goal**: Enable weekly data entry and CSV import

### 4.1 Manual Entry Form
- Create WeeklyDataEntry component
- Add form validation with Zod
- Calculate derived fields (labor %, avg transaction)
- POST to new `/api/weekly-data` endpoint

### 4.2 CSV Import
- Create CSV upload component
- Parse with PapaParse
- Validate data structure
- Bulk insert endpoint
- Show import progress/errors

### 4.3 Backend Endpoints
```typescript
// New endpoints needed
POST /api/weekly-data/entry    // Single week entry
POST /api/weekly-data/import   // Bulk CSV import
GET  /api/weekly-data/template // Download CSV template
```

**Deliverables**: Working data entry for authorized users

## Phase 5: Performance Optimization (Priority 5)
**Goal**: Implement caching and materialized views

### 5.1 Create Materialized Views
```sql
CREATE MATERIALIZED VIEW mv_dashboard_summary AS
SELECT /* optimized summary queries */;

CREATE MATERIALIZED VIEW mv_store_performance AS
SELECT /* pre-calculated rankings */;
```

### 5.2 Add Refresh Logic
- Create refresh script
- Add to cron or scheduled job
- Refresh on data updates

### 5.3 Update Queries
- Use materialized views for dashboard
- Keep real-time for data entry
- Add cache headers

**Deliverables**: Sub-400ms API responses

## Phase 6: Additional PRD Features (Priority 6)

### 6.1 Export Functionality
- Add CSV export for current view
- Include filters in export

### 6.2 Enhanced Filtering
- Add date range presets (4, 13, 52 weeks)
- Multi-store selection
- Brand filtering (future-ready)

### 6.3 Additional KPIs
- Sales per Labor Hour
- Transactions per Labor Hour
- Effective Hourly Wage
- YoY Sales % (already partial)

**Deliverables**: Complete PRD feature set

## Implementation Timeline

### Week 1-2: Authentication & Security
- Day 1-2: Clerk setup and integration
- Day 3-4: Frontend auth flow
- Day 5-7: Backend JWT validation
- Day 8-10: Testing and debugging

### Week 3: Database & RBAC
- Day 1-2: Database migrations
- Day 3-4: Role-based filtering
- Day 5: Testing with different roles

### Week 4: Data Entry
- Day 1-2: Manual entry form
- Day 3-4: CSV import
- Day 5: Validation and error handling

### Week 5: Optimization & Polish
- Day 1-2: Materialized views
- Day 3-4: Additional features
- Day 5: Final testing

## Migration Commands

```bash
# Create migration branch
git checkout -b add-authentication

# Install dependencies
cd client && npm install @clerk/clerk-react
cd ../server && npm install @clerk/express jsonwebtoken

# Run database migrations
psql $DATABASE_URL -f migrations/001_add_auth_tables.sql
psql $DATABASE_URL -f migrations/002_add_materialized_views.sql

# Update environment variables
echo "CLERK_PUBLISHABLE_KEY=pk_test_..." >> .env.local
echo "CLERK_SECRET_KEY=sk_test_..." >> server/.env
```

## Testing Strategy

### Unit Tests
- Auth middleware
- Role filtering logic
- Data validation

### Integration Tests
- API endpoints with different roles
- Data entry workflows
- CSV import edge cases

### E2E Tests
- Login flow
- Dashboard access by role
- Data entry permissions

## Rollback Plan
Each phase is designed to be non-breaking:
1. Auth can be disabled via feature flag
2. New tables don't affect existing queries
3. Keep original endpoints alongside new ones
4. Materialized views are supplementary

## Success Criteria
- [ ] Executive can login and see all data
- [ ] Manager sees only assigned stores
- [ ] Bookkeeper can enter/import data
- [ ] Dashboard loads in < 800ms
- [ ] All PRD requirements met
- [ ] Zero downtime during migration 