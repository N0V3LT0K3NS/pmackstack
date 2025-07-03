# PMackStack Executive Dashboard

A comprehensive executive dashboard for managing multiple franchise locations (Kilwins & Renoja) with real-time analytics, historical comparisons, and multi-brand support.

## Features

### 🎯 Multi-Brand Dashboard
- **Kilwins Ice Cream/Sweets**: Traditional franchise metrics
- **Renoja Fitness/Wellness**: Member-focused analytics
- **Brand Switching**: Seamless tab-based brand selection
- **Real-time KPIs**: Sales, transactions, members, retention rates
- **YoY Comparisons**: Automatic year-over-year growth calculations

### 📊 Analytics & Reporting
- **Multi-store Analysis**: Compare performance across all locations
- **Labor Cost Analysis**: Track labor efficiency with color-coded indicators
- **Member Analytics**: Growth, retention, and engagement metrics (Renoja)
- **Time Series Data**: Weekly, monthly, and quarterly aggregations
- **Interactive Charts**: Sales trends and member growth visualizations

### 👥 User Management System
- **Role-based Access**: Executive, Bookkeeper, Manager roles
- **Authentication**: JWT-based secure login system
- **User CRUD Operations**: Create, read, update, delete users (Executive only)
- **Password Management**: Secure bcrypt password hashing
- **Store Assignments**: Managers can be assigned specific stores

#### Current Production Users:
```
patrick@lifegivingbusiness.com / LGB2024!Exec (executive)
bookkeeper@lifegivingbusiness.com / LGB2024!Book (bookkeeper)  
manager.ks@lifegivingbusiness.com / LGB2024!KS (manager)
manager.mo@lifegivingbusiness.com / LGB2024!MO (manager)
manager.tx@lifegivingbusiness.com / LGB2024!TX (manager)
manager.renoja@lifegivingbusiness.com / LGB2024!REN (manager)
```

#### Managing Users:

**Option 1: API Endpoints (Executive only)**
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

**Option 2: Password Hash Generator**
```bash
cd server
node scripts/hash-password.js "YourNewPassword123!"
# Use output hash in SQL INSERT
```

**Option 3: Direct Database (Neon Console)**
```sql
-- View users
SELECT id, email, full_name, role, is_active FROM users;

-- Add user (use hash generator first)
INSERT INTO users (email, password_hash, full_name, role) 
VALUES ('new@email.com', '$2b$10$hashedpassword', 'Full Name', 'manager');

-- Update password
UPDATE users SET password_hash = '$2b$10$newhash' WHERE email = 'user@email.com';

-- Deactivate user
UPDATE users SET is_active = false WHERE email = 'user@email.com';
```

### 📝 Data Management
- **CSV Import**: Bulk import weekly data from POS systems
- **Manual Entry**: Forms for entering weekly performance data
- **Auto-fill**: Previous week data pre-population
- **Data Export**: Export filtered data for external analysis
- **Recent Entries**: View and track latest data submissions

### 🏪 Store Locations

**Kilwins:**
- Annapolis, MD (anna)
- Charlottesville, VA (char)
- Fells Point, MD (fell)
- Virginia Beach, VA (vabe)
- Williamsburg, VA (will)

**Renoja:**
- Renoja Studio 1 (ren001)
- Renoja Studio 2 (ren002)
- Renoja Studio 3 (ren003)

## Deployment

### Production URLs
- **Frontend**: https://pmackstack.vercel.app
- **Backend**: https://your-railway-app.up.railway.app
- **Target Domain**: dashboard.lifegivingbusiness.com

### Environment Variables

**Railway (Backend):**
```
NODE_ENV=production
PORT=3002
DATABASE_URL=postgresql://neondb_owner:password@host.neon.tech/neondb?sslmode=require
JWT_SECRET=your-super-secure-jwt-secret-key
CLIENT_URL=https://pmackstack.vercel.app
```

**Vercel (Frontend):**
```
VITE_API_URL=https://your-railway-app.up.railway.app
```

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for modern, responsive UI
- **Recharts** for interactive data visualization
- **Axios** for API communication
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** (Neon cloud database)
- **JWT Authentication**
- **bcrypt** for password hashing
- **Manual CORS** implementation

### Database
- **Neon PostgreSQL** cloud database
- **Multi-brand schema** (Kilwins + Renoja)
- **User management** with role-based access
- **Audit trails** and timestamps

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Neon PostgreSQL account
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/N0V3LT0K3NS/pmackstack.git
   cd pmackstack
   ```

2. **Set up environment variables**
   ```bash
   # Server
   cd server
   cp .env.example .env
   # Edit .env with your Neon database credentials
   
   # Client  
   cd ../client
   echo "VITE_API_URL=http://localhost:3002" > .env.local
   ```

3. **Install dependencies**
   ```bash
   # Server
   cd server && npm install
   
   # Client
   cd ../client && npm install
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev
   
   # Terminal 2 - Frontend  
   cd client && npm run dev
   ```

   The application will start on:
   - Frontend: http://localhost:5174
   - Backend API: http://localhost:3002

## Project Structure

```
pmackstack/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components (charts, forms, layout)
│   │   ├── contexts/      # React contexts (auth)
│   │   ├── hooks/         # Custom hooks (dashboard, stores)
│   │   ├── lib/           # API client and utilities
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main app with routing
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/        # Database and environment config
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Auth and error handling
│   │   ├── services/      # Business logic
│   │   └── index.ts       # Server entry point
│   ├── scripts/           # Utility scripts
│   └── migrations/        # Database migrations
├── shared/                 # Shared TypeScript types
│   └── types/
└── AIDOCS/                # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### User Management (Executive only)
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Dashboard
- `GET /api/dashboard/overview` - Kilwins dashboard data
- `GET /api/renoja/dashboard` - Renoja dashboard data

### Stores
- `GET /api/stores` - List stores by brand
- `GET /api/stores/:code/metrics` - Store-specific metrics

### Data Entry
- `POST /api/data-entry/weekly` - Submit Kilwins weekly data
- `POST /api/renoja/weekly` - Submit Renoja weekly data
- `GET /api/data-entry/recent` - Recent entries
- `GET /api/renoja/recent` - Recent Renoja entries

## Database Schema

### Core Tables
- `users` - User accounts with roles
- `pos_stores` - Store information
- `pos_weekly_data` - Kilwins weekly metrics
- `brands` - Brand definitions
- `renoja_weekly_metrics` - Renoja-specific metrics

### User Roles
- **Executive**: Full access to all features and user management
- **Bookkeeper**: Access to financial data and reports
- **Manager**: Store-specific access for assigned locations

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure `CLIENT_URL` matches frontend URL exactly
2. **Database Connection**: Verify `DATABASE_URL` in Railway environment
3. **Build Failures**: Check TypeScript compilation and dependency versions
4. **Railway Crashes**: Monitor memory usage and container restarts

## Contributing

1. Create a feature branch from `main`
2. Make your changes with proper TypeScript types
3. Test both brands (Kilwins & Renoja) functionality
4. Update documentation if needed
5. Submit a pull request

## License

Private - Life Giving Business
