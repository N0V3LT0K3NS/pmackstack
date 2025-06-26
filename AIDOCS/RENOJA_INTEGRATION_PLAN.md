# Renoja Integration Plan

## Executive Summary

This document outlines the implementation plan for integrating Renoja (fitness/wellness studio) as a second brand into our existing multi-franchise KPI dashboard. Renoja has fundamentally different metrics than Kilwins, focusing on membership, engagement, and growth KPIs rather than traditional retail metrics.

## Current State Analysis

### What We Have (Kilwins)
- **Database**: PostgreSQL with `pos_stores` and `pos_weekly_data` tables
- **Backend**: Express + TypeScript API with dashboard and data entry endpoints
- **Frontend**: React dashboard with 9 retail-focused KPIs
- **Auth**: JWT-based with role-based access (executive, bookkeeper, manager)
- **Data Entry**: Manual forms and CSV import for weekly sales/labor data

### What Renoja Needs
- **Different Metrics**: Digital engagement, membership, partnerships, events
- **Different Data Model**: Member-based vs transaction-based
- **Same Infrastructure**: Leverage existing auth, roles, and UI patterns
- **Brand Separation**: Clear visual/functional separation while sharing core functionality

## Architecture Decision: Hybrid Approach

**Recommendation**: Implement a **hybrid architecture** that:
1. Shares core infrastructure (auth, navigation, common components)
2. Separates brand-specific data models and UI
3. Uses tabs/routing to switch between brands
4. Maintains separate database tables for Renoja metrics

## Database Schema Design

### New Tables for Renoja

```sql
-- Renoja stores (links to existing stores table)
-- Uses existing stores table with brand_id = 2 (Renoja)

-- Renoja weekly metrics (completely different from Kilwins)
CREATE TABLE renoja_weekly_metrics (
  id SERIAL PRIMARY KEY,
  store_code TEXT REFERENCES pos_stores(store_code),
  fiscal_year INT NOT NULL,
  week_number INT NOT NULL,
  week_ending DATE NOT NULL,
  
  -- Weekly Actionables
  digital_posts INT DEFAULT 0,
  new_google_reviews INT DEFAULT 0,
  total_google_reviews INT DEFAULT 0,
  new_partnerships INT DEFAULT 0,
  events_in_studio INT DEFAULT 0,
  events_outside_studio INT DEFAULT 0,
  
  -- Measured Results
  new_members_signed INT DEFAULT 0,
  total_paying_members INT NOT NULL,
  members_lost INT DEFAULT 0,
  avg_member_rate NUMERIC(10,2) DEFAULT 0,
  
  -- Calculated fields
  net_member_change INT GENERATED ALWAYS AS (new_members_signed - members_lost) STORED,
  total_events INT GENERATED ALWAYS AS (events_in_studio + events_outside_studio) STORED,
  review_growth_rate NUMERIC(5,2),
  member_retention_rate NUMERIC(5,2),
  
  -- Metadata
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(store_code, fiscal_year, week_number),
  UNIQUE(store_code, week_ending)
);

-- Create indexes for performance
CREATE INDEX idx_renoja_weekly_store_week ON renoja_weekly_metrics(store_code, week_ending);
CREATE INDEX idx_renoja_weekly_created ON renoja_weekly_metrics(created_at DESC);
```

## Implementation Phases

### Phase 1: Database Foundation (Week 1)
1. Create Renoja brand entry in brands table
2. Add Renoja stores to pos_stores table
3. Create renoja_weekly_metrics table
4. Add migration files
5. Generate sample data for testing
6. Update database service layer

### Phase 2: Backend API Extensions (Week 1)
1. Create Renoja-specific services
2. Add new API endpoints:
   - `/api/renoja/dashboard`
   - `/api/renoja/data-entry`
   - `/api/renoja/metrics`
3. Extend store filtering to handle brand separation
4. Add validation for Renoja-specific fields

### Phase 3: Frontend UI Updates (Week 2)
1. Add brand switcher/tabs to main navigation
2. Create Renoja dashboard with relevant KPIs:
   - Member Growth Rate
   - Total Active Members
   - Engagement Score (posts + reviews + events)
   - Average Member Value
   - Retention Rate
   - Partnership Growth
3. Build Renoja data entry form
4. Adapt existing components for reuse

### Phase 4: Integration & Polish (Week 2-3)
1. Unified navigation with brand context
2. Role-based access updates
3. Testing and bug fixes
4. Documentation updates

## Frontend Architecture

### Navigation Structure
```
/                     → Landing/Brand selector
/kilwins/dashboard    → Kilwins dashboard (current)
/kilwins/data-entry   → Kilwins data entry
/renoja/dashboard     → Renoja dashboard (new)
/renoja/data-entry    → Renoja data entry (new)
```

### Shared Components
- TopBar (with brand switcher)
- Sidebar (brand-aware navigation)
- DateRangeFilter
- StoreFilter (filtered by brand)
- ProtectedRoute
- Button, Card, UI components

### Brand-Specific Components
- KilwinsKPICard (existing)
- RenojaKPICard (new)
- KilwinsSalesChart (existing)
- RenojaEngagementChart (new)
- RenojaMembershipChart (new)

## Renoja KPIs Design

### Primary KPIs (Top Row)
1. **Total Active Members** - Current total paying members
2. **Net Member Growth** - New members - Lost members
3. **Member Retention Rate** - (1 - (Lost/Previous Total)) × 100
4. **Average Member Value** - Avg member rate

### Secondary KPIs (Second Row)
5. **Digital Engagement** - Posts + Reviews for the period
6. **Event Activity** - Total events (in + out of studio)
7. **Partnership Growth** - New partnerships added
8. **Review Rating** - Avg Google review score (if available)

### Charts
1. **Member Growth Trend** - Line chart showing total members over time
2. **Engagement Metrics** - Stacked bar chart (posts, reviews, events)
3. **Retention Analysis** - Cohort retention visualization

## Sample Data Structure

```javascript
// Sample Renoja weekly data
{
  store_code: "ren001",
  fiscal_year: 2025,
  week_number: 1,
  week_ending: "2025-01-05",
  
  // Actionables
  digital_posts: 5,
  new_google_reviews: 3,
  total_google_reviews: 127,
  new_partnerships: 1,
  events_in_studio: 2,
  events_outside_studio: 1,
  
  // Results
  new_members_signed: 12,
  total_paying_members: 245,
  members_lost: 3,
  avg_member_rate: 89.99,
  
  notes: "New Year promotion brought in 8 new members"
}
```

## Migration Strategy

### Step 1: Create Feature Branch ✓
```bash
git checkout -b feature/renoja-integration
```

### Step 2: Database Updates
1. Run migration to add Renoja brand
2. Create Renoja stores
3. Create new metrics table
4. Generate test data

### Step 3: Backend Updates
1. Extend services for multi-brand support
2. Add Renoja-specific endpoints
3. Update validation logic

### Step 4: Frontend Updates
1. Add routing structure
2. Implement brand switching
3. Build Renoja-specific views
4. Update data entry forms

## Risk Mitigation

1. **Data Model Differences**: Keep Kilwins and Renoja data completely separate
2. **UI Complexity**: Use clear visual separation and brand-specific color schemes
3. **Performance**: Add proper indexes and consider separate materialized views
4. **User Confusion**: Clear labeling and intuitive navigation between brands

## Success Criteria

1. Users can seamlessly switch between Kilwins and Renoja views
2. Renoja managers can enter weekly metrics specific to their business
3. Executives see aggregated KPIs for both brands
4. No regression in Kilwins functionality
5. Performance remains within defined SLAs

## Next Steps

1. Review and approve this plan
2. Create database migration files
3. Start with backend API extensions
4. Implement frontend changes incrementally
5. Test with sample data before production 