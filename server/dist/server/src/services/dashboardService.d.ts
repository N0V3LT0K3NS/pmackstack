import { DashboardFilters, DashboardSummary, StorePerformance, TimeSeriesDataPoint } from '../../../shared/types/models';
import { DashboardOverviewResponse } from '../../../shared/types/api';
export declare const dashboardService: {
    getDashboardOverview(filters: DashboardFilters): Promise<DashboardOverviewResponse>;
    getDashboardSummary(startDate: string, endDate: string, stores?: string[]): Promise<DashboardSummary>;
    getTimeSeries(startDate: string, endDate: string, stores?: string[]): Promise<TimeSeriesDataPoint[]>;
    getTimeSeriesByStore(startDate: string, endDate: string, stores?: string[]): Promise<{
        [storeCode: string]: TimeSeriesDataPoint[];
    }>;
    getStorePerformance(startDate: string, endDate: string): Promise<StorePerformance[]>;
    getDetailedWeeklyData(startDate: string, endDate: string, stores?: string[]): Promise<any[]>;
};
//# sourceMappingURL=dashboardService.d.ts.map