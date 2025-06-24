import type {
  DashboardSummary,
  StorePerformance,
  TimeSeriesDataPoint,
  Store,
  WeeklyData,
  CSVImportResult,
  LaborAnalysis
} from './models';

// Base API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard Overview Response
export interface DashboardOverviewResponse {
  summary: DashboardSummary;
  timeSeries: TimeSeriesDataPoint[];
  storePerformance: StorePerformance[];
  dateRange: {
    start: string;
    end: string;
  };
}

// Store List Response
export interface StoreListResponse {
  stores: Store[];
  total: number;
}

// Store Metrics Response
export interface StoreMetricsResponse {
  store: Store;
  currentPeriod: {
    sales: number;
    transactions: number;
    avgTransaction: number;
    laborPercent: number;
  };
  previousPeriod?: {
    sales: number;
    transactions: number;
    avgTransaction: number;
    laborPercent: number;
  };
  timeSeries: TimeSeriesDataPoint[];
  laborAnalysis: LaborAnalysis;
  rankings: {
    sales: number;
    transactions: number;
    avgTransaction: number;
    laborEfficiency: number;
  };
}

// Weekly Data Response
export interface WeeklyDataResponse {
  data: WeeklyData[];
  total: number;
  page: number;
  pageSize: number;
}

// Data Entry Response
export interface DataEntryResponse {
  success: boolean;
  data: WeeklyData;
  calculations: {
    avgTransactionValue: number;
    laborPercent: number;
  };
  warnings?: string[];
}

// CSV Import Response
export type CSVImportResponse = CSVImportResult;

// Store Comparison Response
export interface StoreComparisonResponse {
  stores: Store[];
  metrics: {
    [storeCode: string]: {
      sales: number;
      transactions: number;
      avgTransaction: number;
      laborPercent: number;
      yoyGrowth: number;
    };
  };
  timeSeries: {
    [storeCode: string]: TimeSeriesDataPoint[];
  };
}

// Export Data Response
export interface ExportDataResponse {
  filename: string;
  mimeType: string;
  data: string | Buffer;
} 