// Store Types
export interface Store {
  storeCode: string;
  storeName: string;
}

// Weekly Data Types
export interface WeeklyData {
  id?: number;
  storeCode: string;
  fiscalYear: number;
  weekNumber: number;
  weekIso: string;
  weekEnding: string;
  
  // Sales Metrics
  totalSales: number;
  numTransactions: number;
  avgTransactionValue: number;
  
  // Labor Metrics
  variableHours: number;
  averageWage: number;
  totalFixedCost: number;
  variableLaborCost: number;
  variableLaborPercent: number;
  fixedLaborPercent: number;
  totalLaborCost: number;
  totalLaborPercent: number;
  
  // Previous Year Data
  totalSalesPy?: number;
  variableHoursPy?: number;
  numTransactionsPy?: number;
  totalLaborPercentPy?: number;
  
  // Delta Calculations
  deltaSalesPercent?: number;
  deltaHoursPercent?: number;
  deltaTotalLaborPercent?: number;
  
  // Metadata
  notes?: string;
  sourceFilename?: string;
  importedAt?: Date;
}

// Dashboard Summary Types
export interface DashboardSummary {
  totalSales: number;
  totalTransactions: number;
  avgTransactionValue: number;
  totalLaborCost: number;
  laborCostPercent: number;
  storeCount: number;
  
  // Additional KPIs for PRD compliance
  totalLaborHours: number;
  salesPerLaborHour: number;
  transactionsPerLaborHour: number;
  effectiveHourlyWage: number;
  
  // Year over Year
  yoyGrowth: {
    sales: number;
    transactions: number;
    avgTransaction: number;
    labor: number;
  };
  
  // Period comparison
  previousPeriod?: {
    totalSales: number;
    totalTransactions: number;
    avgTransactionValue: number;
    laborCostPercent: number;
    totalLaborCost?: number;
    salesPerLaborHour?: number;
    transactionsPerLaborHour?: number;
    effectiveHourlyWage?: number;
  };
}

// Store Performance Types
export interface StorePerformance {
  storeCode: string;
  storeName: string;
  totalSales: number;
  totalTransactions: number;
  avgTransactionValue: number;
  laborCostPercent: number;
  salesRank: number;
  performanceScore: number;
  yoyGrowth: number;
}

// Time Series Data Point
export interface TimeSeriesDataPoint {
  period: string;
  weekEnding: string;
  sales: number;
  transactions: number;
  avgTransaction: number;
  laborPercent: number;
  laborCost?: number;
  laborHours?: number;
  previousYear?: {
    sales: number;
    transactions: number;
    avgTransaction: number;
    laborPercent: number;
    laborCost?: number;
    laborHours?: number;
  };
}

// Filter Types
export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  stores?: string[];
  metrics?: string[];
  groupBy?: 'week' | 'month' | 'quarter';
  comparison?: 'yoy' | 'period' | 'none';
}

// Labor Analysis
export interface LaborAnalysis {
  totalLaborCost: number;
  variableLaborCost: number;
  fixedLaborCost: number;
  laborHours: number;
  averageWage: number;
  laborPercent: number;
  optimalLaborPercent: number;
  efficiency: 'excellent' | 'good' | 'warning' | 'critical';
}

// Data Entry Types
export interface WeeklyDataEntry {
  storeCode: string;
  weekEnding: string;
  totalSales: number;
  numTransactions: number;
  laborHours: number;
  laborCost: number;
  notes?: string;
}

// CSV Import Types
export interface CSVImportResult {
  success: boolean;
  processed: number;
  errors: CSVImportError[];
  results: WeeklyData[];
}

export interface CSVImportError {
  row: number;
  field?: string;
  message: string;
  data?: any;
} 