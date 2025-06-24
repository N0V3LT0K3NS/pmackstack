import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useStores } from '@/hooks/useStores';
import { useStoreTimeSeries } from '@/hooks/useStoreTimeSeries';
import { KPICard } from '@/components/dashboard/KPICard';
import { EnhancedSalesChart } from '@/components/charts/EnhancedSalesChart';
import { LaborChart } from '@/components/charts/LaborChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangeFilter } from '@/components/filters/DateRangeFilter';
import { StoreFilter } from '@/components/filters/StoreFilter';
import { dashboardApi } from '@/lib/api';
import type { DashboardFilters } from '@shared/types/models';

// Static demo data for testing styles
const DEMO_DATA = {
  summary: {
    totalSales: 624106,
    totalTransactions: 33186,
    avgTransactionValue: 18.81,
    totalLaborCost: 108714,
    laborCostPercent: 17.4,
    storeCount: 5,
    totalLaborHours: 5218,
    salesPerLaborHour: 119.62,
    transactionsPerLaborHour: 6.36,
    effectiveHourlyWage: 20.84,
    previousPeriod: {
      totalSales: 580000,
      totalTransactions: 31000,
      avgTransactionValue: 18.70,
      laborCostPercent: 18.2,
      totalLaborCost: 105360,
      salesPerLaborHour: 112.40,
      transactionsPerLaborHour: 6.01,
      effectiveHourlyWage: 20.45,
    },
    yoyGrowth: {
      sales: 7.6,
      transactions: 7.1,
      avgTransaction: 0.6,
      labor: -4.4,
    }
  },
  timeSeries: [
    { period: '2025-16', weekEnding: '2025-04-20', sales: 62059, transactions: 2875, avgTransaction: 21.59, laborPercent: 17.2 },
    { period: '2025-15', weekEnding: '2025-04-13', sales: 59737, transactions: 932, avgTransaction: 64.10, laborPercent: 16.8 },
    { period: '2025-14', weekEnding: '2025-04-06', sales: 51934, transactions: 1036, avgTransaction: 50.13, laborPercent: 18.1 },
    { period: '2025-13', weekEnding: '2025-03-30', sales: 57762, transactions: 1973, avgTransaction: 29.28, laborPercent: 17.5 },
  ],
  storePerformance: [
    { storeCode: 'anna', storeName: 'Annapolis', totalSales: 180000, performanceScore: 92.5, yoyGrowth: 8.2 },
    { storeCode: 'char', storeName: 'Charlottesville', totalSales: 165000, performanceScore: 89.1, yoyGrowth: 6.8 },
    { storeCode: 'fell', storeName: 'Fells Point', totalSales: 120000, performanceScore: 85.3, yoyGrowth: 5.2 },
    { storeCode: 'vabe', storeName: 'Virginia Beach', totalSales: 95000, performanceScore: 78.9, yoyGrowth: 3.1 },
    { storeCode: 'will', storeName: 'Williamsburg', totalSales: 64000, performanceScore: 72.4, yoyGrowth: 1.9 },
  ]
};

export function Dashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    // Default to 2024 full year to show complete actual data
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    stores: [], // Empty means all stores
  });
  const [exportLoading, setExportLoading] = useState(false);

  const { data: dashboardData, isLoading: isDashboardLoading, error } = useDashboard(filters);
  const { data: storesData, isLoading: isStoresLoading } = useStores();
  const { data: storeTimeSeriesData, isLoading: isStoreTimeSeriesLoading } = useStoreTimeSeries(
    filters.startDate,
    filters.endDate,
    filters.stores
  );

  const loading = isDashboardLoading || isStoresLoading || isStoreTimeSeriesLoading;
  
  // Use real data, fallback to demo only during loading
  const displayData = dashboardData || (loading ? null : DEMO_DATA);

  const handleDateChange = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  const handleStoreChange = (stores: string[]) => {
    setFilters(prev => ({ ...prev, stores }));
  };

  const handleExport = async (format: 'summary' | 'detailed') => {
    setExportLoading(true);
    try {
      await dashboardApi.exportCSV({ ...filters, format });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

  // Initialize with all stores selected when stores data loads
  useEffect(() => {
    if (storesData?.stores && filters.stores?.length === 0) {
      setFilters(prev => ({ 
        ...prev, 
        stores: storesData.stores.map(s => s.storeCode) 
      }));
    }
  }, [storesData, filters.stores?.length]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-2">
            Real-time performance metrics across all locations
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleExport('summary')}
            disabled={exportLoading}
          >
            {exportLoading ? 'Exporting...' : 'Export Summary'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport('detailed')}
            disabled={exportLoading}
          >
            {exportLoading ? 'Exporting...' : 'Export Detailed'}
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DateRangeFilter
            startDate={filters.startDate || ''}
            endDate={filters.endDate || ''}
            onDateChange={handleDateChange}
          />
        </div>
        <div>
          <StoreFilter
            selectedStores={filters.stores || []}
            onStoreChange={handleStoreChange}
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.stores?.length || 0) > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium">Active Filters:</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Date Range:</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {filters.startDate} to {filters.endDate}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Stores:</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  {filters.stores?.length === storesData?.stores?.length 
                    ? 'All Stores' 
                    : `${filters.stores?.length} Selected`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KPICard
          title="Total Sales"
          value={displayData?.summary.totalSales || 0}
          previousValue={displayData?.summary.previousPeriod?.totalSales}
          format="currency"
          trend={displayData?.summary.yoyGrowth.sales}
          loading={loading}
        />
        <KPICard
          title="Total Labor $"
          value={displayData?.summary.totalLaborCost || 0}
          previousValue={displayData?.summary.previousPeriod?.totalLaborCost}
          format="currency"
          trend={displayData?.summary.yoyGrowth.labor}
          loading={loading}
          positiveIsGood={false}
        />
        <KPICard
          title="Labor % of Sales"
          value={displayData?.summary.laborCostPercent || 0}
          previousValue={displayData?.summary.previousPeriod?.laborCostPercent}
          format="percent"
          trend={displayData?.summary.yoyGrowth.labor}
          loading={loading}
          positiveIsGood={false}
        />
        <KPICard
          title="Total Transactions"
          value={displayData?.summary.totalTransactions || 0}
          previousValue={displayData?.summary.previousPeriod?.totalTransactions}
          format="number"
          trend={displayData?.summary.yoyGrowth.transactions}
          loading={loading}
        />
        <KPICard
          title="Avg Transaction Value"
          value={displayData?.summary.avgTransactionValue || 0}
          previousValue={displayData?.summary.previousPeriod?.avgTransactionValue}
          format="currency"
          trend={displayData?.summary.yoyGrowth.avgTransaction}
          loading={loading}
        />
        <KPICard
          title="Sales per Labor Hour"
          value={displayData?.summary.salesPerLaborHour || 0}
          previousValue={displayData?.summary.previousPeriod?.salesPerLaborHour}
          format="currency"
          trend={0} // Calculate trend if previous period data available
          loading={loading}
        />
        <KPICard
          title="Transactions per Labor Hour"
          value={displayData?.summary.transactionsPerLaborHour || 0}
          previousValue={displayData?.summary.previousPeriod?.transactionsPerLaborHour}
          format="decimal"
          trend={0} // Calculate trend if previous period data available
          loading={loading}
        />
        <KPICard
          title="Effective Hourly Wage"
          value={displayData?.summary.effectiveHourlyWage || 0}
          previousValue={displayData?.summary.previousPeriod?.effectiveHourlyWage}
          format="currency"
          trend={0} // Calculate trend if previous period data available
          loading={loading}
          positiveIsGood={false}
        />
        <KPICard
          title="YoY Sales %"
          value={displayData?.summary.yoyGrowth.sales || 0}
          previousValue={0}
          format="percent"
          trend={0}
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <EnhancedSalesChart
            aggregateData={displayData?.timeSeries || []}
            storeData={storeTimeSeriesData || {}}
            loading={loading}
          />
          <LaborChart
            aggregateData={displayData?.timeSeries || []}
            storeData={storeTimeSeriesData || {}}
            loading={loading}
          />
        </div>
        
        {/* Store Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Store Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {displayData?.storePerformance.map((store) => (
                <div
                  key={store.storeCode}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{store.storeName}</p>
                    <p className="text-sm text-muted-foreground">
                      Performance Score: {store.performanceScore.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(store.totalSales)}
                    </p>
                    <p className={`text-sm ${
                      store.yoyGrowth >= 0 ? 'text-success-600' : 'text-error-600'
                    }`}>
                      {store.yoyGrowth >= 0 ? '+' : ''}{store.yoyGrowth.toFixed(1)}% YoY
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Status indicators */}
      <div className="fixed bottom-4 right-4 space-y-2">
        {loading && (
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Loading real data...
          </div>
        )}
        {error && (
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Using demo data (API unavailable)
          </div>
        )}
        {!loading && !error && dashboardData && (
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Live data connected
          </div>
        )}
      </div>
    </div>
  );
} 