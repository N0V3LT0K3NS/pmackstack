import type { DashboardSummary, StorePerformance, TimeSeriesDataPoint, Store, WeeklyData, CSVImportResult, LaborAnalysis } from './models';
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface DashboardOverviewResponse {
    summary: DashboardSummary;
    timeSeries: TimeSeriesDataPoint[];
    storePerformance: StorePerformance[];
    dateRange: {
        start: string;
        end: string;
    };
}
export interface StoreListResponse {
    stores: Store[];
    total: number;
}
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
export interface WeeklyDataResponse {
    data: WeeklyData[];
    total: number;
    page: number;
    pageSize: number;
}
export interface DataEntryResponse {
    success: boolean;
    data: WeeklyData;
    calculations: {
        avgTransactionValue: number;
        laborPercent: number;
    };
    warnings?: string[];
}
export type CSVImportResponse = CSVImportResult;
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
export interface ExportDataResponse {
    filename: string;
    mimeType: string;
    data: string | Buffer;
}
//# sourceMappingURL=api.d.ts.map