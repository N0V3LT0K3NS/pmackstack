interface WeeklyEntryData {
    storeCode: string;
    fiscalYear: number;
    weekNumber: number;
    weekEnding?: string;
    totalSales: number;
    variableHours: number;
    numTransactions: number;
    averageWage: number;
    totalFixedCost?: number;
    notes?: string | null;
}
interface CSVImportResult {
    successful: number;
    failed: number;
    errors: string[];
}
export declare const dataEntryService: {
    submitWeeklyEntry(entryData: WeeklyEntryData, userId: number): Promise<{
        totalFixedCost: number;
        laborCost: number;
        laborPercent: number;
        avgTransaction: number;
        salesPerLaborHour: number;
        transactionsPerLaborHour: number;
        storeCode: string;
        fiscalYear: number;
        weekNumber: number;
        weekEnding?: string;
        totalSales: number;
        variableHours: number;
        numTransactions: number;
        averageWage: number;
        notes?: string | null;
        id: any;
        createdAt: any;
    }>;
    importCSVData(data: any[], userId: number): Promise<CSVImportResult>;
    getCSVTemplate(): string;
    getRecentEntries(limit?: number, storeFilter?: string[]): Promise<{
        entries: any[];
        totalCount: number;
        showing: number;
    }>;
    getLastWeekData(storeCode: string): Promise<{
        lastWeekData: {
            weekEnding: string;
            averageWage: any;
            totalFixedCost: any;
            totalSales: any;
            numTransactions: any;
            variableHours: any;
        };
        nextWeekEnding: string;
        storeName: any;
    }>;
    getWeeklyEntryById(id: number): Promise<any>;
    updateWeeklyEntry(entryData: any, userId: number): Promise<any>;
    deleteWeeklyEntry(id: number): Promise<void>;
};
export {};
//# sourceMappingURL=dataEntryService.d.ts.map