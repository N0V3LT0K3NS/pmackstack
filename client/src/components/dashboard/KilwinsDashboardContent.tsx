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
import { 
  DownloadIcon, 
  FilterIcon, 
  TrendingUpIcon, 
  StoreIcon,
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  RefreshCwIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

export function KilwinsDashboardContent() {
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

  const getDateRangeLabel = () => {
    if (!filters.startDate || !filters.endDate) return '';
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (${diffDays} days)`;
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-purple-600/5 rounded-2xl" />
        
        <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="space-y-2">
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  Real-time performance metrics across all Kilwins locations
                </p>
              </div>
              
              {/* Current Filter Summary */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-600">Period:</span>
                  <span className="font-semibold text-gray-900">{getDateRangeLabel()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPinIcon className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">Stores:</span>
                  <span className="font-semibold text-gray-900">
                    {filters.stores?.length === storesData?.stores?.length 
                      ? 'All Locations' 
                      : `${filters.stores?.length} Selected`}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleExport('summary')}
                disabled={exportLoading}
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                <DownloadIcon className="h-4 w-4" />
                {exportLoading ? 'Exporting...' : 'Export Summary'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExport('detailed')}
                disabled={exportLoading}
                className="flex items-center gap-2 hover:bg-green-50 hover:border-green-200 transition-colors"
              >
                <DownloadIcon className="h-4 w-4" />
                {exportLoading ? 'Exporting...' : 'Export Detailed'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FilterIcon className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters & Controls</h2>
        </div>

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
      </div>

      {/* Enhanced KPI Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUpIcon className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Key Performance Indicators</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      </div>

      {/* Enhanced Charts Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUpIcon className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Performance Trends</h2>
        </div>
        
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
      </div>
      
      {/* Enhanced Store Performance Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <StoreIcon className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Store Performance Rankings</h2>
        </div>
        
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/30">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <TrendingUpIcon className="h-5 w-5 text-blue-600" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayData?.storePerformance.map((store, index) => (
                <div
                  key={store.storeCode}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl transition-all duration-200",
                    "hover:shadow-md hover:scale-[1.02] cursor-pointer",
                    "bg-gradient-to-r from-white to-gray-50/50 border border-gray-200/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white",
                      index === 0 && "bg-gradient-to-r from-yellow-400 to-yellow-500",
                      index === 1 && "bg-gradient-to-r from-gray-400 to-gray-500", 
                      index === 2 && "bg-gradient-to-r from-orange-400 to-orange-500",
                      index > 2 && "bg-gradient-to-r from-blue-400 to-blue-500"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{store.storeName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-600">
                          Score: <span className="font-medium">{store.performanceScore.toFixed(1)}</span>
                        </span>
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          store.performanceScore >= 90 && "bg-green-400",
                          store.performanceScore >= 80 && store.performanceScore < 90 && "bg-yellow-400",
                          store.performanceScore < 80 && "bg-red-400"
                        )} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(store.totalSales)}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "text-sm font-semibold",
                        store.yoyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {store.yoyGrowth >= 0 ? '+' : ''}{store.yoyGrowth.toFixed(1)}% YoY
                      </p>
                      {store.yoyGrowth >= 0 ? (
                        <TrendingUpIcon className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingUpIcon className="h-3 w-3 text-red-600 rotate-180" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Status Indicators */}
      <div className="fixed bottom-6 right-6 space-y-3 z-50">
        {loading && (
          <div className="flex items-center gap-3 bg-blue-500 text-white px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm">
            <RefreshCwIcon className="h-4 w-4 animate-spin" />
            <span className="font-medium">Loading real data...</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm">
            <AlertCircleIcon className="h-4 w-4" />
            <span className="font-medium">Using demo data (API unavailable)</span>
          </div>
        )}
        {!loading && !error && dashboardData && (
          <div className="flex items-center gap-3 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm">
            <CheckCircleIcon className="h-4 w-4" />
            <span className="font-medium">Live data connected</span>
          </div>
        )}
      </div>
    </div>
  );
} 