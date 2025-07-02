export interface Store {
    storeCode: string;
    storeName: string;
}
export interface WeeklyData {
    id?: number;
    storeCode: string;
    fiscalYear: number;
    weekNumber: number;
    weekIso: string;
    weekEnding: string;
    totalSales: number;
    numTransactions: number;
    avgTransactionValue: number;
    variableHours: number;
    averageWage: number;
    totalFixedCost: number;
    variableLaborCost: number;
    variableLaborPercent: number;
    fixedLaborPercent: number;
    totalLaborCost: number;
    totalLaborPercent: number;
    totalSalesPy?: number;
    variableHoursPy?: number;
    numTransactionsPy?: number;
    totalLaborPercentPy?: number;
    deltaSalesPercent?: number;
    deltaHoursPercent?: number;
    deltaTotalLaborPercent?: number;
    notes?: string;
    sourceFilename?: string;
    importedAt?: Date;
}
export interface DashboardSummary {
    totalSales: number;
    totalTransactions: number;
    avgTransactionValue: number;
    totalLaborCost: number;
    laborCostPercent: number;
    storeCount: number;
    totalLaborHours: number;
    salesPerLaborHour: number;
    transactionsPerLaborHour: number;
    effectiveHourlyWage: number;
    yoyGrowth: {
        sales: number;
        transactions: number;
        avgTransaction: number;
        labor: number;
    };
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
export interface DashboardFilters {
    startDate?: string;
    endDate?: string;
    stores?: string[];
    metrics?: string[];
    groupBy?: 'week' | 'month' | 'quarter';
    comparison?: 'yoy' | 'period' | 'none';
}
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
export interface WeeklyDataEntry {
    storeCode: string;
    weekEnding: string;
    totalSales: number;
    numTransactions: number;
    laborHours: number;
    laborCost: number;
    notes?: string;
}
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
//# sourceMappingURL=models.d.ts.map