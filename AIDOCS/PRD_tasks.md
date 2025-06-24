
# FULL IMPLEMENTATION CHECKLIST

**Multi-Franchise Weekly KPI Dashboard – MVP**
*(All steps are atomic. Substeps are explicitly enumerated and explained.)*

---

## 1. Repository Initialization & Environment Setup

### 1.1. Prepare Project Directory

* [ ] **Create root project folder**

  * Name it: `kpi-dashboard`.
  * Work from within this folder for all following steps.

### 1.2. Initialize Git Repository

* [ ] `git init`

  * Ensure an empty local git repository is present.

### 1.3. Create Directory & File Structure

* [ ] **Save and execute the `init_project.sh` script** provided below:

  * Copy the script to `kpi-dashboard/init_project.sh`.
  * `chmod +x init_project.sh`
  * `bash init_project.sh`
  * **Verify**: All folders and stub files are present per canonical tree (see PRD).

### 1.4. Initialize PNPM and Install Dependencies

* [ ] `pnpm init -y`

  * Sets up `package.json`.
* [ ] **Add required dependencies**

  * Next.js (`@latest`), React, Drizzle ORM, Clerk, Tailwind, shadcn/ui, TanStack Table, Recharts, zod, react-hook-form, PapaParse, Playwright, Vitest, ESLint, Prettier, TimescaleDB.
* [ ] **Add development dependencies**

  * Typescript, Drizzle CLI, Neon driver, testing tools, Husky, lint-staged, etc.
* [ ] `pnpm install`

  * **Verify**: No dependency errors, `node_modules` created.

### 1.5. Configure `.env.local`

* [ ] Create `.env.local` at root.
* [ ] Populate with:

  ```dotenv
  DATABASE_URL=postgres://<user>:<pass>@ep-xxx.neon.tech/neondb
  NEON_USE_BRANCH=true
  CLERK_PUBLISHABLE_KEY=pk_live_xxx
  CLERK_SECRET_KEY=sk_live_xxx
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
  ```
* [ ] **Acceptance**: All values are present, correct, and secrets are not committed.

---

## 2. Database Provisioning & Seeding

### 2.1. Connect to Neon Postgres

* [ ] Use Neon dashboard or CLI to confirm connection string.
* [ ] `psql $DATABASE_URL` to verify connection.

### 2.2. Run SQL DDL for Schema

* [ ] **Create tables**: `brands`, `stores`, `weekly_metrics`, `users`, `user_store`.
* [ ] **Add TimescaleDB extension** (if needed): `CREATE EXTENSION IF NOT EXISTS timescaledb;`
* [ ] **Create hypertable**:
  `SELECT create_hypertable('weekly_metrics','week_iso', if_not_exists => TRUE);`
* [ ] **Create materialized view**: `mv_kpi_latest` as per PRD.
* [ ] **Acceptance**: `\dt` shows all required tables.

### 2.3. Seed Brands and Stores

* [ ] Insert Kilwins and Renoja into `brands`.
* [ ] Import data from `pos_stores.json` into `stores`.

  * Use a script or Postgres `COPY` with CSV if converting.
  * **Acceptance**: Row count in DB matches original JSON.

### 2.4. Seed Weekly Metrics

* [ ] Import data from `pos_weekly_data.json` into `weekly_metrics`.

  * Use a script or `COPY` with CSV as above.
  * **Acceptance**: Row count in DB matches JSON, no missing weeks.

### 2.5. Create Initial User Accounts

* [ ] Insert test users: 1 executive, 1 bookkeeper, 2 managers (each with distinct store access).
* [ ] Populate `user_store` for managers.
* [ ] **Acceptance**: Select from `users` and `user_store` returns correct rows.

### 2.6. Set Up Row-Level Security (RLS)

* [ ] Enable RLS on `weekly_metrics` table.
* [ ] Add `exec_all` policy (execs can select all).
* [ ] Add `scoped_rw` policy (managers/bookkeepers can select/insert only for stores they are mapped to).
* [ ] **Acceptance**: Test queries as different users (psql `SET app.role` and `SET app.user_id`).

### 2.7. Schedule Materialized View Refresh

* [ ] Create SQL script in `scripts/refresh_mviews.sql`.
* [ ] Set up Neon cron job (or local script) to call it nightly and every 15min.
* [ ] **Acceptance**: Query on view after refresh returns up-to-date data.

---

## 3. Backend Implementation

### 3.1. Drizzle ORM Schema

* [ ] Write `/db/schema/schema.ts` to match the actual DB schema.
* [ ] Generate types with Drizzle CLI.
* [ ] **Acceptance**: No schema drift; types match DB columns exactly.

### 3.2. Implement Database Client

* [ ] Create `/src/lib/db.ts`:

  * Import Neon, configure pooling, connect using `DATABASE_URL`.
  * Ensure every query sets `app.role` and `app.user_id` for RLS.
  * **Acceptance**: All queries respect session variables.

### 3.3. Auth Helpers

* [ ] `/src/lib/auth.ts` to:

  * Parse and verify Clerk JWT.
  * Extract `role`, `userId`, assign to session/context.
* [ ] **Acceptance**: Throws error on invalid JWT, exposes user/role to server.

### 3.4. RLS Helper

* [ ] `/src/lib/rls.ts`:

  * Utility to set Postgres session variables per request.
* [ ] **Acceptance**: Works with connection pool; does not leak session data.

### 3.5. Server-side Drizzle & tRPC Context

* [ ] `/src/server/drizzle/client.ts` exports singleton DB connection.
* [ ] `/src/server/trpc/index.ts` sets up tRPC router with proper context (user, db).
* [ ] **Acceptance**: tRPC context exposes validated user, role, and correct DB instance.

### 3.6. tRPC Routers

* [ ] `/src/server/trpc/routers/_app.ts` is root export.
* [ ] `/src/server/trpc/routers/kpi.ts`:

  * `list`: Query for all KPIs, filters by store, brand, date.
  * `chart`: Returns time-series data for trend chart.
  * `rank`: Returns store rankings for comparison table.
  * **Each endpoint** validates input, enforces access.
* [ ] `/src/server/trpc/routers/weekly.ts`:

  * `upsert`: Insert/update one week's data, validate user access.
  * `bulkUpsert`: Batch upsert for CSV.
  * **Acceptance**: Unit/integration tests pass for all paths.

---

## 4. Frontend Implementation

### 4.1. Configure Tailwind & Theme

* [ ] `/tailwind.config.mjs`:

  * Define color tokens for brands, positive/negative, and theme.
  * Set font scale, spacing.
* [ ] `/src/styles/globals.css` with @tailwind imports and any global rules.
* [ ] **Acceptance**: App loads with correct branding and style.

### 4.2. Layout and Routing

* [ ] `/src/app/layout.tsx`:

  * HTML shell, meta tags, wraps with ClerkProvider, sets CSP.
* [ ] `/src/app/page.tsx`:

  * Redirect to `/dashboard`.
* [ ] **Acceptance**: All pages render within correct shell; CSP is active.

### 4.3. Implement Filters and Switchers

* [ ] `/src/components/BrandSwitcher.tsx`:

  * Loads available brands from API.
  * Allows selecting one/many brands.
* [ ] `/src/components/DateRangePicker.tsx`:

  * Presets for last 4, 13, 52 weeks, and custom.
* [ ] `/src/components/StoreTable.tsx`:

  * Lists stores by filter.
* [ ] **Acceptance**: All filters update dashboard content reactively.

### 4.4. KPI Grid

* [ ] `/src/app/dashboard/components/KpiGrid.tsx`:

  * 6–8 KPI cards, each shows current value, delta, sparkline.
  * Framer Motion for number animation.
* [ ] `/src/components/KpiCard.tsx`:

  * Standalone card component, handles positive/negative coloring.
* [ ] **Acceptance**: Cards display correct KPI, animate updates.

### 4.5. Trend Chart and Comparison Table

* [ ] `/src/app/dashboard/components/TimeSeriesSection.tsx`:

  * Multi-series Recharts LineChart; supports overlays for stores/brands.
  * User legend, responsive.
* [ ] `/src/components/StoreTable.tsx`:

  * Uses TanStack Table for virtualized, sortable rankings.
  * Conditional formatting for outliers.
* [ ] **Acceptance**: Chart and table update on filter; are readable, accessible.

### 4.6. Manual Weekly Entry and CSV Upload

* [ ] `/src/app/admin/weekly-entry/page.tsx`:

  * Form built with react-hook-form + Zod.
  * On submit, calls tRPC `upsert`.
  * Live computed fields (e.g., labor %, avg transaction value).
* [ ] CSV upload widget:

  * Accepts file, parses with PapaParse, validates structure.
  * Calls tRPC `bulkUpsert` in batches.
  * Shows preview, error rows, import progress.
* [ ] **Acceptance**: Bookkeeper/manager can add/update data; errors caught early.

---

## 5. Authentication & Role-based UI

### 5.1. Integrate Clerk Auth

* [ ] Wrap app in ClerkProvider.
* [ ] Implement login/logout buttons; magic link flow only.
* [ ] Store user role and ID in client-side context.
* [ ] **Acceptance**: All roles can log in, session persists.

### 5.2. Hide/Show UI Elements by Role

* [ ] Only show admin entry/upload for bookkeeper/manager.
* [ ] Executive and bookkeeper see all stores; managers only see mapped stores.
* [ ] **Acceptance**: UI reflects role; trying forbidden paths yields access denied.

---

## 6. Testing & Quality Gates

### 6.1. Linting & Formatting

* [ ] Add ESLint and Prettier config.
* [ ] Set up Husky pre-commit hooks (`.husky/`).
* [ ] **Acceptance**: `pnpm lint` and `pnpm format` pass.

### 6.2. Unit and Integration Tests

* [ ] Add tests for utils, auth, DB helpers using Vitest.
* [ ] Test tRPC API endpoints for correct access enforcement and output.
* [ ] **Acceptance**: `pnpm test` passes, coverage reports show all business logic tested.

### 6.3. End-to-End Tests

* [ ] Use Playwright:

  * Test login for each role.
  * Test dashboard KPI view, filter, chart, and table.
  * Test weekly entry and CSV import (happy/sad paths).
* [ ] **Acceptance**: `pnpm e2e` passes; all flows covered.

### 6.4. Performance and Accessibility

* [ ] Run Lighthouse CI:

  * Performance > 90
  * Accessibility > 90
* [ ] Run axe-core scan on dashboard.
* [ ] **Acceptance**: No critical issues reported.

### 6.5. Security Checks

* [ ] Snyk or npm audit for dependencies.
* [ ] Confirm CSP header on all pages.
* [ ] Manual test: manager tries to access forbidden store, gets 403.

---

## 7. Automation & Deployment

### 7.1. Configure Materialized View Refresh

* [ ] Neon cron or GitHub Action to run `scripts/refresh_mviews.sql` every 15min and nightly.
* [ ] **Acceptance**: View is always fresh.

### 7.2. Continuous Integration

* [ ] GitHub Actions:

  * Run lint, test, build, e2e, and Lighthouse on every push/PR.
  * Auto-create Neon branch per PR.
  * Block merge on test/lint/fail.
* [ ] **Acceptance**: CI required to merge.

### 7.3. Deployment to Vercel

* [ ] Link repo to Vercel.
* [ ] Configure environment variables.
* [ ] On push to main, auto-deploy to production.
* [ ] On PR, deploy to preview.
* [ ] **Acceptance**: Each commit deploys and URL is available.

### 7.4. Smoke Test Production

* [ ] Log in as each role, verify dashboard, admin, entry.
* [ ] Upload CSV, check for correct rows.
* [ ] **Acceptance**: End-to-end flow works on production.

---

## 8. Documentation & Handoff

### 8.1. README.md

* [ ] Document all environment setup, scripts, test commands, deployment, and env vars.
* [ ] Include example CSV template.

### 8.2. Developer Guide

* [ ] List all folders and files, their purpose.
* [ ] Describe test strategy and code quality gates.

### 8.3. Client Handoff

* [ ] If required, record a 3-5 minute Loom/walkthrough video.
* [ ] Provide dashboard login for exec and manager.
* [ ] **Acceptance**: Client or team can use and maintain without further clarification.

---

## 9. Validation & Acceptance

* [ ] Data parity: DB row counts match imported JSON.
* [ ] Role enforcement: No escalation/leak between users.
* [ ] Performance: All KPIs and charts load < 400ms API.
* [ ] Accessibility: No violations.
* [ ] All tasks above have a green check.

