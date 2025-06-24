
# PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Product:** Multi-Franchise Weekly KPI Dashboard (MVP)
**Version:** 2.0 (June 23, 2025)
**Prepared For:** Senior Engineers, AI Coding Agents, QA, DevOps, Product Managers
**Guarantee:** This PRD is entirely standalone. It contains all requirements, schemas, technical context, file/folder purposes, and step-by-step implementation tasks needed to build, test, and deploy the product.

---

## 0. Executive Summary & Client Context

* **Client:** Family-run holding company operating franchises, starting with Kilwins (ice cream/sweets) and planning for Renoja (future).
* **Problem:** Manual spreadsheets for weekly sales and labor; executives and managers lack real-time, consistent, and comparative KPI visibility across stores/brands.
* **Solution:** Single secure web app for manual/CSV weekly entry, robust role-based access, and beautiful, performant dashboards with comparative KPIs and YoY trends.
* **MVP Objective:**

  * Executive sees curated, up-to-date KPIs across all stores/brands in <5 seconds from login.
  * Bookkeeper and managers can securely enter or upload weekly data for their stores.

---

## 1. MVP Scope & Requirements

### 1.1. Data Requirements

* System must persist canonical data from two historical sources:

  * **Stores:** One row per location, including brand, name, and region info.
  * **Weekly Metrics:** One row per store per week, containing sales, labor, and transaction fields.
* Database must preserve all fields as present in the original historic JSON files:

  * `pos_stores.json` (30 Kilwins stores)
  * `pos_weekly_data.json` (31,698 rows of weekly metrics, 2018–2025)

### 1.2. Functional Requirements

| ID   | Requirement Description                                                                                                                                                                           |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-1  | Login via email magic-link (Clerk); no passwords.                                                                                                                                                 |
| F-2  | Role-based access control: Executive (read-only all data), Bookkeeper (read/write all), Manager (read/write assigned stores).                                                                     |
| F-3  | Dashboard home defaults to Kilwins aggregate, last 13 weeks.                                                                                                                                      |
| F-4  | Filter bar: brand multi-select, store multi-select, date-range picker (presets: last 4/13/52 weeks, custom).                                                                                      |
| F-5  | KPI card grid: Total Sales, Total Labor (\$), Labor % of Sales, Total Transactions, Avg Transaction Value, Sales per Labor Hour, Transactions per Labor Hour, Effective Hourly Wage, YoY Sales %. |
| F-6  | Trend chart: Overlays up to 8 stores or 2 brands, user can select which to compare.                                                                                                               |
| F-7  | Comparison table: Ranks stores vs brand mean, highlights outliers.                                                                                                                                |
| F-8  | Manual weekly entry: Form for authorized roles; includes live calculated fields and server-side validation.                                                                                       |
| F-9  | CSV import: User uploads template-matching file; overwrites on duplicate (store, week).                                                                                                           |
| F-10 | Download current view to CSV.                                                                                                                                                                     |
| F-11 | Row-level security enforced in all DB operations.                                                                                                                                                 |
| F-12 | Materialized views for snappy queries, auto-refreshed nightly and every 15 min.                                                                                                                   |

### 1.3. Non-Functional Requirements

* **Performance:** FCP < 800ms, P95 KPI API < 400ms for 3 years of data.
* **Bundle budget:** JS ≤ 170KB gzip, no unneeded dependencies.
* **Accessibility:** WCAG 2.2 AA compliance for colors, keyboard, screen reader labels.
* **Security:** HTTPS only; CSP `default-src 'self'`; no plaintext secrets in VCS; PITR (point-in-time recovery) for 14 days.
* **Scalability:** Ready for 100 brands × 500 stores × 10 years (\~26M rows).
* **Cost:** Zero for dev (Vercel Hobby + Neon Free + Clerk Free).

---

## 2. Data Model & Schema

All schemas are ready for direct implementation in PostgreSQL, Drizzle, or for introspection.
**(All field names match historic data exactly.)**

### 2.1. Brands Table

```sql
CREATE TABLE brands (
  brand_id   SERIAL PRIMARY KEY,
  name       TEXT UNIQUE NOT NULL
);

INSERT INTO brands (name) VALUES ('Kilwins'), ('Renoja');
```

### 2.2. Stores Table

```sql
CREATE TABLE stores (
  store_code TEXT PRIMARY KEY,
  brand_id   INT REFERENCES brands(brand_id),
  store_name TEXT NOT NULL,
  city       TEXT,
  state      TEXT,
  timezone   TEXT NOT NULL DEFAULT 'US/Eastern',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.3. Weekly Metrics Table

```sql
CREATE TABLE weekly_metrics (
  store_code TEXT REFERENCES stores(store_code),
  week_iso   TEXT NOT NULL,                -- ISO-8601 year-week (e.g. 2025-24)
  fiscal_year INT NOT NULL,
  week_number INT NOT NULL,
  total_sales NUMERIC(12,2),
  variable_hours NUMERIC(8,2),
  num_transactions INT,
  average_wage NUMERIC(6,2),
  total_labor_cost NUMERIC(12,2),
  total_labor_percent NUMERIC(5,4),
  avg_transaction_value NUMERIC(8,2),
  total_sales_py NUMERIC(12,2),
  total_labor_percent_py NUMERIC(5,4),
  PRIMARY KEY (store_code, week_iso)
);
```

### 2.4. Users and User-Store Mapping

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('executive','bookkeeper','manager')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_store (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  store_code TEXT REFERENCES stores(store_code) ON DELETE CASCADE,
  can_write BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, store_code)
);
```

### 2.5. TimescaleDB Hypertable

```sql
SELECT create_hypertable('weekly_metrics','week_iso', if_not_exists => TRUE);
```

### 2.6. Materialized View for KPIs

```sql
CREATE MATERIALIZED VIEW mv_kpi_latest AS
SELECT
  store_code,
  MAX(week_iso) AS latest_week,
  SUM(total_sales) FILTER (WHERE week_iso >= to_char(current_date - INTERVAL '13 weeks','IYYY-IW')) AS sales_13w,
  SUM(total_sales) FILTER (WHERE week_iso >= to_char(current_date - INTERVAL '52 weeks','IYYY-IW')) AS sales_52w
FROM weekly_metrics
GROUP BY store_code;
```

---

## 3. Environment Setup Instructions

### 3.1. Prerequisites

* **Node.js:** >= 20.11 (LTS recommended)
* **PNPM:** >= 9.0
* **Neon CLI:** `npm i -g @neondatabase/cli`
* **Vercel CLI:** `npm i -g vercel`
* **Deno:** >= 1.x (for testing SQL snippets, if desired)
* **psql:** >= 14

### 3.2. Bootstrap

```bash
git clone <repo-url> kpi-dashboard && cd kpi-dashboard
bash init_project.sh           # (see §6 below for the script)
pnpm install
```

### 3.3. Environment Variables (`.env.local`)

```dotenv
DATABASE_URL=postgres://<user>:<pass>@ep-xxx.neon.tech/neondb
NEON_USE_BRANCH=true
CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
```

### 3.4. Connect to Neon DB

1. Log into Neon, get your connection string, paste in `DATABASE_URL`.
2. Run the full DDL (see §2 above) to create all tables.
3. Import JSONs into respective tables (`stores`, `weekly_metrics`) using psql/csv or a script.
4. Enable TimescaleDB and materialized views.
5. Run RLS policies below.

---

## 4. Security & Row-Level Security (RLS)

### 4.1. Session Variables for Auth

Every request must set:

* `app.role` — current user role
* `app.user_id` — UUID for current user

### 4.2. RLS Policy

```sql
ALTER TABLE weekly_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY exec_all
  ON weekly_metrics FOR SELECT
  USING (current_setting('app.role') = 'executive');

CREATE POLICY scoped_rw
  ON weekly_metrics
  FOR ALL
  USING (
    current_setting('app.role') IN ('manager','bookkeeper')
    AND store_code IN (SELECT store_code FROM user_store WHERE user_id = current_setting('app.user_id')::uuid)
  )
  WITH CHECK (TRUE);
```

---

## 5. File & Directory Structure (Canonical)

**All files listed here are to be created as placeholders (using `touch`) or directories (using `mkdir -p`).**

```
kpi-dashboard/
│
├── .husky/
├── .vscode/
├── public/
│
├── db/
│   ├── schema/
│   │   └── schema.ts      # Drizzle schema
│   └── migrations/
│
├── scripts/
│   └── refresh_mviews.sql
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── components/
│   │   │       ├── KpiGrid.tsx
│   │   │       └── TimeSeriesSection.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── weekly-entry/
│   │   │       └── page.tsx
│   │   └── api/
│   │       └── trpc/
│   │           └── [trpc].ts
│   ├── components/
│   │   ├── BrandSwitcher.tsx
│   │   ├── DateRangePicker.tsx
│   │   ├── KpiCard.tsx
│   │   ├── TimeSeriesChart.tsx
│   │   └── StoreTable.tsx
│   ├── components/ui/
│   ├── lib/
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   └── rls.ts
│   ├── server/
│   │   ├── drizzle/
│   │   │   ├── client.ts
│   │   │   └── schema.ts
│   │   └── trpc/
│   │       ├── index.ts
│   │       └── routers/
│   │           ├── _app.ts
│   │           ├── kpi.ts
│   │           └── weekly.ts
│   ├── styles/
│   │   └── globals.css
│   └── tests/
│       ├── e2e/
│       └── unit/
├── tailwind.config.mjs
├── drizzle.config.mjs
├── next.config.mjs
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── .eslintrc.cjs
├── .env.example
├── package.json
└── init_project.sh
```

### Description, Context & Concerns for Key Files

| File/Folder                           | Purpose & Content                              | Concerns & Notes                            |
| ------------------------------------- | ---------------------------------------------- | ------------------------------------------- |
| `db/schema/schema.ts`                 | Drizzle TypeScript schema, matches DDL above   | Must match DB, regenerate if schema changes |
| `db/migrations/`                      | Auto-generated migrations from Drizzle         | Never edit by hand                          |
| `scripts/refresh_mviews.sql`          | SQL to refresh materialized views              | Run via cron                                |
| `src/lib/db.ts`                       | Neon connection pool + Drizzle client          | Must set session vars for RLS               |
| `src/lib/auth.ts`                     | Clerk JWT helper, parses user/role             | Handles 401                                 |
| `src/lib/rls.ts`                      | Utility to set session vars in each query      | Needed for multi-tenant security            |
| `src/server/drizzle/client.ts`        | Exports singleton DB                           | Used in server logic                        |
| `src/server/trpc/index.ts`            | Root tRPC router, sets context                 | tRPC config                                 |
| `src/server/trpc/routers/`            | tRPC sub-routers: `kpi.ts`, `weekly.ts`        | API endpoints for dashboard/entry           |
| `src/app/layout.tsx`                  | App shell, sets CSP, wraps with Clerk provider | Secure headers                              |
| `src/app/page.tsx`                    | Redirect to dashboard                          |                                             |
| `src/app/dashboard/page.tsx`          | SSR dashboard page                             | Loads KPI data                              |
| `src/app/dashboard/components/`       | Reusable dashboard widgets                     | KpiGrid, charts                             |
| `src/app/admin/weekly-entry/page.tsx` | Weekly entry form, CSV upload                  | For bookkeeper/manager                      |
| `src/components/`                     | Reusable cross-app components                  | Brand switcher, filters                     |
| `src/components/ui/`                  | shadcn/ui primitives                           | Accessible widgets                          |
| `src/styles/globals.css`              | Tailwind global CSS                            | Theme tokens                                |
| `src/tests/`                          | All automated tests                            | E2E/unit folders                            |
| `tailwind.config.mjs`                 | Design tokens (color, spacing)                 | Maintainable styling                        |
| `drizzle.config.mjs`                  | DB migration config                            | Points at Neon                              |
| `next.config.mjs`                     | Next.js runtime config                         | Edge runtime, images                        |
| `tsconfig.json`                       | TypeScript project config                      | Strict types                                |
| `vitest.config.ts`                    | Unit test config                               |                                             |
| `playwright.config.ts`                | E2E test config                                |                                             |
| `.eslintrc.cjs`                       | Linting config                                 |                                             |
| `.env.example`                        | Example env vars                               |                                             |
| `package.json`                        | NPM/PNPM manifest                              | Scripts, deps                               |
| `init_project.sh`                     | Bootstrap all dirs/files                       | Run on repo init                            |

---

## 6. Bootstrap Script (init\_project.sh)

```bash
#!/usr/bin/env bash
set -euo pipefail

mkdir -p .husky .vscode public db/schema db/migrations scripts
mkdir -p src/{app,components/ui,lib,server/{drizzle,trpc/routers},styles,tests/{e2e,unit}}
mkdir -p src/app/dashboard/components src/app/admin/weekly-entry src/app/api/trpc

touch .env.example package.json tsconfig.json next.config.mjs tailwind.config.mjs drizzle.config.mjs \
      vitest.config.ts playwright.config.ts .eslintrc.cjs db/schema/schema.ts scripts/refresh_mviews.sql \
      src/app/layout.tsx src/app/page.tsx src/app/dashboard/{page.tsx,loading.tsx} \
      src/app/dashboard/components/{KpiGrid.tsx,TimeSeriesSection.tsx} \
      src/app/admin/{layout.tsx,page.tsx} src/app/admin/weekly-entry/page.tsx \
      src/app/api/trpc/[trpc].ts src/components/{BrandSwitcher.tsx,DateRangePicker.tsx,KpiCard.tsx,TimeSeriesChart.tsx,StoreTable.tsx} \
      src/lib/{db.ts,auth.ts,rls.ts} src/server/drizzle/{client.ts,schema.ts} \
      src/server/trpc/index.ts src/server/trpc/routers/{_app.ts,kpi.ts,weekly.ts} \
      src/styles/globals.css

touch src/tests/e2e/.gitkeep src/tests/unit/.gitkeep

echo "Project structure bootstrapped."
```

---

## 7. Key Implementation Details

### 7.1. KPI Card Formulae

| KPI Name              | SQL Expression                                                         | Format  |
| --------------------- | ---------------------------------------------------------------------- | ------- |
| Total Sales           | `SUM(total_sales)`                                                     | \$0     |
| Total Labor \$        | `SUM(total_labor_cost)`                                                | \$0     |
| Labor % of Sales      | `SUM(total_labor_cost)/SUM(total_sales)`                               | %.1     |
| Total Transactions    | `SUM(num_transactions)`                                                | integer |
| Avg Transaction Value | `SUM(total_sales)/NULLIF(SUM(num_transactions),0)`                     | \$0.00  |
| Sales per Labor Hour  | `SUM(total_sales)/SUM(variable_hours)`                                 | \$0.00  |
| Transactions per LH   | `SUM(num_transactions)/SUM(variable_hours)`                            | #0.00   |
| Effective Hourly Wage | `SUM(total_labor_cost)/SUM(variable_hours)`                            | \$0.00  |
| YoY Sales %           | `(SUM(total_sales)-SUM(total_sales_py))/NULLIF(SUM(total_sales_py),0)` | %.1     |

### 7.2. Manual Entry/CSV Import Flow

* Weekly entry: Form validates store, week, and all numeric fields; computes derived values live.
* CSV upload: Client parses file, validates headers/rows, POSTs batch to API. Server runs upsert (overwrite on conflict).

### 7.3. Authentication Flow

* Clerk provides login with magic link.
* JWT token is validated for each request; user role and store assignments are enforced in every API/database call.

### 7.4. Frontend/UI Guidance

* All UI is built with Next.js 15 (App Router), React 19, and TypeScript.
* Design is atomic with Tailwind CSS 4.x and shadcn/ui.
* Dashboard layout: KPI cards in a responsive grid, trend chart below, store comparison table beneath.
* Admin section: Only visible for users with write access.

---

## 8


. Testing & Quality

* All backend logic (API, schema, RLS) must be covered with unit and integration tests.
* Frontend components to have unit and snapshot tests.
* E2E tests: Playwright scripts for login, role access, weekly entry, CSV import, dashboard filter.
* Performance: Lighthouse CI script to enforce load and accessibility budgets.
* Security: Snyk scan for deps, CSP headers must be present.

---

## 9. Deployment & Validation

* CI: All pushes/PRs must pass tests and linting. Each PR creates a Vercel Preview and a Neon DB branch.
* Production: Merge to `main` triggers Vercel deploy with main Neon DB.
* Validation: Manual smoke test; run E2E suite; check all user roles; confirm row counts vs source JSON.

---

## 10. Task List & Dependency Map

1. **Repo/Env**

   * Clone repo, run bootstrap script, install packages, set env vars.
2. **DB & Schema**

   * Run DDL, import all data, configure RLS, create materialized views.
3. **Backend**

   * Implement Drizzle schema, DB client, Clerk auth helper, tRPC context/routers for kpi and weekly data.
4. **Frontend**

   * Scaffold layout, implement components for brand/store/date filters, KPI grid, trend chart, comparison table.
5. **Admin**

   * Build manual entry form, CSV upload handler, connect to backend.
6. **Auth & UI**

   * Integrate Clerk, hide/show UI by role, enforce permissions.
7. **Testing**

   * Write unit/integration/E2E tests, configure quality gates.
8. **Automation**

   * Add cron for materialized views, GitHub Actions for CI.
9. **Deployment**

   * Deploy preview, merge to main, smoke test production.
10. **Docs/Handoff**

    * Write README, sample CSV, optional walkthrough video.

---

## 11. Validation Checklist

* **Data parity:** Imported row counts match JSON.
* **Access isolation:** Each role sees only what is allowed.
* **Performance:** FCP and KPI API within budget.
* **Security:** RLS, CSP, no secrets in VCS, scans pass.
* **Usability:** Executive can see brand-wide YoY comparison in ≤3 clicks.
* **Accessibility:** No critical violations by axe-core or Lighthouse.

---

## 12. Final Statement

**This document contains every requirement, schema, workflow, file/folder, implementation detail, and test plan necessary to build, validate, and deploy the MVP Multi-Franchise Weekly KPI Dashboard. No external documentation is needed. An experienced engineer or AI agent can proceed directly to implementation.**

---
