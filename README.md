# Kilwin's Executive Dashboard

A comprehensive executive dashboard for managing multiple Kilwin's franchise locations with real-time analytics, historical comparisons, and data management capabilities.

## Features

### 🎯 Dashboard Overview
- **Real-time KPIs**: Total sales, transactions, average transaction value, and labor cost percentages
- **YoY Comparisons**: Automatic year-over-year growth calculations
- **Store Rankings**: Performance-based store rankings with efficiency scores
- **Interactive Charts**: Sales trends with customizable time ranges

### 📊 Analytics & Reporting
- **Multi-store Analysis**: Compare performance across all 5 locations
- **Labor Cost Analysis**: Track labor efficiency with color-coded indicators
- **Time Series Data**: Weekly, monthly, and quarterly aggregations
- **Historical Trends**: Access years of historical data with drill-down capabilities

### 📝 Data Management
- **CSV Import**: Bulk import weekly data from POS systems
- **Manual Entry**: Forms for entering weekly performance data
- **Data Export**: Export filtered data for external analysis
- **Audit Trail**: Track all data changes and imports

### 🏪 Store Locations
- Annapolis, MD (anna)
- Charlottesville, VA (char)
- Fells Point, MD (fell)
- Virginia Beach, VA (vabe)
- Williamsburg, VA (will)

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for modern, responsive UI
- **Recharts** for interactive data visualization
- **React Query** for efficient data fetching
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** (Neon cloud database)
- **RESTful API** architecture

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or Neon account)
- Git

### Installation

1. **Clone the repository**
   ```bash
   cd kilwinsDash/executive-dashboard
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Install dependencies**
   ```bash
   # Install all dependencies
   ./scripts/setup.sh
   
   # Or manually:
   cd server && npm install
   cd ../client && npm install
   ```

4. **Start the application**
   ```bash
   # From executive-dashboard directory
   ./start.sh
   ```

   The application will start on:
   - Frontend: http://localhost:5174 (or next available port)
   - Backend API: http://localhost:3002

## Project Structure

```
executive-dashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and API client
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main app component
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── services/      # Business logic
│   │   └── index.ts       # Server entry point
│   └── package.json
├── shared/                 # Shared TypeScript types
│   └── types/
└── start.sh               # Start both servers

```

## API Endpoints

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard summary with filters

### Stores
- `GET /api/stores` - List all stores
- `GET /api/stores/:code/metrics` - Get store-specific metrics

### Metrics
- `GET /api/metrics/weekly` - Weekly performance data
- `GET /api/metrics/labor` - Labor analysis
- `GET /api/metrics/rankings` - Store performance rankings

### Data Entry
- `POST /api/data/weekly` - Create weekly entry
- `POST /api/data/import` - Import CSV data
- `GET /api/data/export` - Export filtered data

## Development

### Running in Development Mode
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Building for Production
```bash
# Build backend
cd server
npm run build

# Build frontend
cd client
npm run build
```

## Database Schema

The application uses the existing Kilwin's database with two main tables:
- `pos_stores`: Store information
- `pos_weekly_data`: Weekly performance metrics

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Private - Kilwin's Franchises
