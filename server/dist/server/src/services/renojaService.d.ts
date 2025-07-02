interface RenojaWeeklyEntry {
    storeCode: string;
    fiscalYear: number;
    weekNumber: number;
    weekEnding: string;
    digitalPosts: number;
    newGoogleReviews: number;
    totalGoogleReviews: number;
    newPartnerships: number;
    eventsInStudio: number;
    eventsOutsideStudio: number;
    newMembersSigned: number;
    totalPayingMembers: number;
    membersLost: number;
    avgMemberRate: number;
    notes?: string;
}
export declare const renojaService: {
    getDashboardSummary(storeFilter?: string[], startDate?: string, endDate?: string): Promise<any>;
    getTimeSeries(storeFilter?: string[], startDate?: string, endDate?: string, groupBy?: "week" | "month"): Promise<any[]>;
    submitWeeklyEntry(entryData: RenojaWeeklyEntry, userId: number): Promise<{
        netMemberChange: any;
        totalEvents: any;
        memberRetentionRate: number;
        reviewGrowthRate: number;
        storeCode: string;
        fiscalYear: number;
        weekNumber: number;
        weekEnding: string;
        digitalPosts: number;
        newGoogleReviews: number;
        totalGoogleReviews: number;
        newPartnerships: number;
        eventsInStudio: number;
        eventsOutsideStudio: number;
        newMembersSigned: number;
        totalPayingMembers: number;
        membersLost: number;
        avgMemberRate: number;
        notes?: string;
        id: any;
        createdAt: any;
    }>;
    getRecentEntries(limit?: number, storeFilter?: string[]): Promise<any[]>;
    getLastWeekData(storeCode: string): Promise<{
        lastWeekData: {
            weekEnding: any;
            totalPayingMembers: any;
            avgMemberRate: any;
            totalGoogleReviews: any;
        };
        nextWeekEnding: string;
        storeName: any;
    }>;
};
export {};
//# sourceMappingURL=renojaService.d.ts.map