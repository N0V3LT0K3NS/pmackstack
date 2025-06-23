# Executive Dashboard - Comprehensive Development Plan

## Project Overview

The Executive Dashboard is a standalone, self-contained web application designed to provide comprehensive visibility into Kilwins franchise performance across all locations. It will feature beautiful, interactive visualizations, historical data analysis, real-time filtering, and data management capabilities.

## Current State Analysis

### Database Structure (Confirmed)
We are using a PostgreSQL database (Neon) with the following tables:
- `pos_stores`: Store information (store_code, store_name)
- `pos_weekly_data`: Weekly performance metrics including:
  - Sales data (total_sales, num_transactions, avg_transaction_value)
  - Labor data (variable_hours, total_labor_cost, total_labor_percent)
  - Previous year comparisons (total_sales_py, num_transactions_py)
  - Delta percentages for YoY analysis
  - Week identification (fiscal_year, week_number, week_iso)

### Available Stores
- anna (Annapolis)
- char (Charlottesville)
- fell (Fells Point)
- vabe (Virginia Beach)
- will (Williamsburg)

### Existing Backend Capabilities
The current kilwinsDash backend provides:
- Store listing endpoint
- Weekly sales data retrieval
- Aggregated metrics calculation
- Year-over-year comparisons
- Labor analysis
- Store rankings

## Architecture Design

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts for interactive visualizations
- **State Management**: React Query for server state, Zustand for UI state
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Neon) with existing schema
- **Data Fetching**: Axios with interceptors
- **Forms**: React Hook Form + Zod validation
- **Date Handling**: date-fns
- **Export**: CSV and PDF generation

### Directory Structure
```
executive-dashboard/
├── client/                      # React frontend application
│   ├── src/
│   │   ├── components/         # UI components
│   │   │   ├── charts/        # Chart components
│   │   │   │   ├── SalesChart.tsx
│   │   │   │   ├── LaborChart.tsx
│   │   │   │   ├── TransactionChart.tsx
│   │   │   │   ├── YearOverYearChart.tsx
│   │   │   │   └── TrendSparkline.tsx
│   │   │   ├── dashboard/     # Dashboard-specific components
│   │   │   │   ├── KPICard.tsx
│   │   │   │   ├── StorePerformanceCard.tsx
│   │   │   │   ├── MetricsSummary.tsx
│   │   │   │   ├── PerformanceTable.tsx
│   │   │   │   └── ExecutiveSummary.tsx
│   │   │   ├── filters/       # Filter components
│   │   │   │   ├── DateRangePicker.tsx
│   │   │   │   ├── StoreSelector.tsx
│   │   │   │   ├── MetricSelector.tsx
│   │   │   │   └── QuickFilters.tsx
│   │   │   ├── forms/         # Data entry forms
│   │   │   │   ├── WeeklyDataForm.tsx
│   │   │   │   ├── BulkImportForm.tsx
│   │   │   │   └── ValidationRules.tsx
│   │   │   ├── layout/        # Layout components
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   └── ui/           # Base UI components (from shadcn)
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useDashboardData.ts
│   │   │   ├── useStoreMetrics.ts
│   │   │   ├── useFilters.ts
│   │   │   └── useExport.ts
│   │   ├── lib/             # Utilities
│   │   │   ├── api.ts       # API client
│   │   │   ├── formatters.ts
│   │   │   ├── calculations.ts
│   │   │   ├── constants.ts
│   │   │   └── types.ts
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── StoreDetail.tsx
│   │   │   ├── Comparison.tsx
│   │   │   ├── DataEntry.tsx
│   │   │   └── Reports.tsx
│   │   ├── store/          # State management
│   │   │   ├── filterStore.ts
│   │   │   └── uiStore.ts
│   │   ├── styles/         # Global styles
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/        # Configuration
│   │   │   ├── database.ts
│   │   │   └── env.ts
│   │   ├── controllers/   # Route controllers
│   │   │   ├── dashboardController.ts
│   │   │   ├── storesController.ts
│   │   │   ├── metricsController.ts
│   │   │   └── dataEntryController.ts
│   │   ├── services/      # Business logic
│   │   │   ├── metricsService.ts
│   │   │   ├── aggregationService.ts
│   │   │   ├── comparisonService.ts
│   │   │   └── validationService.ts
│   │   ├── utils/         # Utilities
│   │   │   ├── dateHelpers.ts
│   │   │   └── calculations.ts
│   │   ├── types/         # TypeScript types
│   │   │   └── index.ts
│   │   ├── middleware/    # Express middleware
│   │   │   ├── errorHandler.ts
│   │   │   └── validation.ts
│   │   ├── routes/        # API routes
│   │   │   └── index.ts
│   │   └── index.ts       # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── shared/                # Shared types/utilities
│   └── types/
│       ├── api.ts
│       └── models.ts
├── scripts/              # Utility scripts
│   ├── setup.sh
│   └── dev.sh
├── .env.example
├── .gitignore
├── docker-compose.yml   # For easy local development
└── README.md
```

## Feature Specifications

### 1. Executive Overview Dashboard

#### KPI Cards (Top Row)
- **Total Revenue**: Sum of all sales with YoY comparison
- **Transaction Volume**: Total transactions with trend indicator
- **Average Transaction Value**: With historical comparison
- **Labor Efficiency**: Labor cost % with target indicators
- **Store Count**: Active locations
- **Best Performer**: Top store by selected metric

#### Interactive Charts
1. **Multi-Line Sales Chart**
   - Current year vs previous year
   - Weekly/Monthly/Quarterly toggles
   - Individual store or aggregate view
   - Hover tooltips with detailed data
   - Export to image/PDF

2. **Labor Analysis Chart**
   - Labor % trend over time
   - Target line (e.g., 20%)
   - Color coding for above/below target
   - Breakdown by fixed vs variable labor

3. **Store Performance Comparison**
   - Bar chart comparing stores
   - Multiple metrics selection
   - Sortable by performance
   - Click to drill down

4. **Year-over-Year Heatmap**
   - Grid showing YoY changes
   - Color intensity for magnitude
   - Click for detailed view

#### Performance Tables
- Sortable, filterable data grid
- Column selection
- Export functionality
- Inline sparklines
- Expandable rows for details

### 2. Store Deep Dive View

#### Store-Specific Metrics
- Comprehensive KPIs for selected store
- Historical performance charts
- Ranking among other stores
- Period-over-period analysis

#### Comparative Analysis
- Side-by-side store comparison
- Metric normalization options
- Trend divergence highlighting
- Best practices identification

### 3. Data Management

#### Manual Data Entry Form
- Week selection with calendar
- Store selection
- Validated input fields:
  - Total Sales ($)
  - Number of Transactions
  - Labor Hours
  - Labor Cost ($)
- Real-time calculation of derived metrics
- Duplicate prevention
- Audit trail

#### Bulk Import
- CSV template download
- Drag-and-drop upload
- Data validation and preview
- Error reporting
- Batch processing with progress

### 4. Filtering and Exploration

#### Advanced Filters
- **Date Range**: Presets + custom
  - Last 4 weeks
  - Last 13 weeks (Quarter)
  - Last 26 weeks (Half Year)
  - Last 52 weeks (Year)
  - YTD, QTD, MTD
  - Custom range picker
  
- **Store Selection**: 
  - Multi-select with search
  - Select all/none
  - Store groups (future)
  
- **Metrics Filter**:
  - Show/hide specific metrics
  - Metric categories

#### Smart Insights
- Automated anomaly detection
- Trend identification
- Performance alerts
- Suggested actions

## Design System

### Color Palette
```scss
// Primary Colors
$primary-600: #7c3aed;  // Primary purple
$primary-500: #8b5cf6;
$primary-400: #a78bfa;

// Status Colors
$success-600: #059669;  // Green
$success-500: #10b981;
$success-50: #ecfdf5;

$error-600: #dc2626;    // Red
$error-500: #ef4444;
$error-50: #fef2f2;

$warning-600: #d97706;  // Amber
$warning-500: #f59e0b;
$warning-50: #fffbeb;

// Neutral Colors
$gray-900: #111827;
$gray-800: #1f2937;
$gray-700: #374151;
$gray-600: #4b5563;
$gray-500: #6b7280;
$gray-400: #9ca3af;
$gray-300: #d1d5db;
$gray-200: #e5e7eb;
$gray-100: #f3f4f6;
$gray-50: #f9fafb;
```

### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Headings**: 
  - H1: 2.25rem (36px), font-weight: 800
  - H2: 1.875rem (30px), font-weight: 700
  - H3: 1.5rem (24px), font-weight: 600
  - H4: 1.25rem (20px), font-weight: 600
- **Body**: 1rem (16px), font-weight: 400
- **Small**: 0.875rem (14px)
- **Tiny**: 0.75rem (12px)

### Spacing System
- Base unit: 4px
- Scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64

### Component Design Principles
1. **Consistency**: Unified look across all components
2. **Accessibility**: WCAG 2.1 AA compliant
3. **Responsiveness**: Mobile-first approach
4. **Performance**: Lazy loading, virtualization
5. **Clarity**: Clear visual hierarchy

## API Design

### Endpoints

#### Dashboard Overview
```
GET /api/dashboard/overview
Query params:
  - startDate: ISO date
  - endDate: ISO date
  - stores: comma-separated store codes
  - metrics: comma-separated metric names
  - groupBy: week|month|quarter

Response:
{
  summary: {
    totalSales: number,
    totalTransactions: number,
    avgTransactionValue: number,
    laborCostPercent: number,
    yoyGrowth: number
  },
  timeSeries: [{
    period: string,
    sales: number,
    transactions: number,
    laborPercent: number,
    previousYear: { ... }
  }],
  storePerformance: [{
    storeCode: string,
    storeName: string,
    metrics: { ... }
  }]
}
```

#### Store Details
```
GET /api/stores/:storeCode/metrics
Query params:
  - startDate: ISO date
  - endDate: ISO date
  - granularity: week|month|quarter

Response:
{
  store: { code, name },
  currentPeriod: { ... },
  previousPeriod: { ... },
  timeSeries: [ ... ],
  rankings: { ... }
}
```

#### Data Entry
```
POST /api/data/weekly
Body:
{
  storeCode: string,
  weekEnding: ISO date,
  totalSales: number,
  numTransactions: number,
  laborHours: number,
  laborCost: number
}

Response:
{
  success: boolean,
  data: { ... },
  calculations: { ... }
}
```

#### Bulk Import
```
POST /api/data/import
Body: FormData with CSV file

Response:
{
  success: boolean,
  processed: number,
  errors: [ ... ],
  results: [ ... ]
}
```

## Implementation Strategy

### Phase 1: Foundation (Week 1)
1. Set up project structure
2. Configure build tools and dependencies
3. Create base UI components
4. Set up database connection
5. Implement basic API endpoints
6. Create layout and routing

### Phase 2: Core Dashboard (Week 2)
1. Build KPI cards with real data
2. Implement sales chart
3. Create performance table
4. Add basic filtering
5. Connect all components
6. Add loading states

### Phase 3: Advanced Features (Week 3)
1. Build remaining charts
2. Add store comparison view
3. Implement data entry form
4. Add CSV import
5. Create export functionality
6. Add date range picker

### Phase 4: Polish & Enhancement (Week 4)
1. Responsive design refinement
2. Performance optimization
3. Error handling
4. Documentation
5. Testing
6. Deployment preparation

## Technical Considerations

### Performance
- Implement data caching with React Query
- Use virtualization for large tables
- Lazy load chart components
- Optimize bundle size with code splitting
- Implement proper memoization

### Security
- Input validation on all forms
- SQL injection prevention
- XSS protection
- Rate limiting on API
- Secure environment variables

### Accessibility
- Proper ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Focus management

### Browser Support
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

### Mobile Responsiveness
- Responsive grid system
- Touch-friendly interactions
- Optimized chart views
- Collapsible navigation
- Mobile-specific layouts

## Data Validation Rules

### Weekly Data Entry
- Week ending must be a Sunday
- Sales must be positive number
- Transactions must be positive integer
- Labor hours must be positive
- Labor cost must be positive
- Average transaction = Sales / Transactions
- Labor percent = Labor Cost / Sales

### Business Rules
- Labor percentage targets:
  - Excellent: < 18%
  - Good: 18-22%
  - Warning: 22-25%
  - Critical: > 25%
- Transaction thresholds vary by store
- Seasonal adjustments for comparisons

## Error Handling

### Frontend
- User-friendly error messages
- Retry mechanisms
- Fallback UI components
- Offline detection
- Form validation feedback

### Backend
- Comprehensive error logging
- Graceful degradation
- Transaction rollback
- Rate limiting
- Circuit breakers

## Future Enhancements

### Phase 2 Features
1. Weather data integration
2. Predictive analytics
3. Multi-franchise support
4. Role-based access control
5. Email reporting
6. Mobile app

### Advanced Analytics
1. Customer segmentation
2. Product mix analysis
3. Seasonal forecasting
4. Staffing optimization
5. Revenue optimization

## Success Metrics

### Technical KPIs
- Page load time < 2s
- API response time < 200ms
- 99.9% uptime
- Zero critical bugs
- 90%+ test coverage

### Business KPIs
- Daily active users
- Data entry compliance
- Report generation frequency
- User satisfaction score
- Time to insight reduction

## Development Tools

### Required Software
- Node.js 18+
- PostgreSQL client
- Git
- VS Code (recommended)
- Chrome DevTools

### VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin
- GitLens

### Development Workflow
1. Feature branch from main
2. Local development with hot reload
3. Unit and integration tests
4. Code review
5. Staging deployment
6. Production release

This comprehensive plan provides a complete roadmap for building a professional, scalable, and user-friendly executive dashboard that meets all specified requirements while maintaining high standards of code quality and user experience. 