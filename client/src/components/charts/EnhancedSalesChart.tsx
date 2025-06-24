import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateShort } from '@/lib/formatters';
import type { TimeSeriesDataPoint } from '@shared/types/models';

interface EnhancedSalesChartProps {
  aggregateData: TimeSeriesDataPoint[];
  storeData: { [storeCode: string]: TimeSeriesDataPoint[] };
  loading?: boolean;
  height?: number;
}

const STORE_COLORS = {
  anna: '#7c3aed',    // Purple
  char: '#059669',    // Emerald
  fell: '#dc2626',    // Red
  vabe: '#ea580c',    // Orange
  will: '#2563eb',    // Blue
};

const STORE_NAMES = {
  anna: 'Annapolis',
  char: 'Charlottesville', 
  fell: 'Fells Point',
  vabe: 'Virginia Beach',
  will: 'Williamsburg',
};

export function EnhancedSalesChart({ 
  aggregateData, 
  storeData, 
  loading = false, 
  height = 350 
}: EnhancedSalesChartProps) {
  const [viewMode, setViewMode] = useState<'aggregate' | 'stores'>('aggregate');

  // Debug logging to help identify the issue
  console.log('EnhancedSalesChart - storeData:', storeData);
  console.log('EnhancedSalesChart - aggregateData:', aggregateData);
  console.log('EnhancedSalesChart - loading:', loading);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full bg-gray-100 animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  const renderAggregateChart = () => {
    const chartData = aggregateData.map(point => ({
      ...point,
      weekEnding: point.weekEnding || point.period,
      previousSales: point.previousYear?.sales,
    }));

    return (
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="weekEnding"
            className="text-xs"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'currentColor' }}
            tickFormatter={(value) => formatCurrency(value, true)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="sales"
            name="Current Year"
            stroke="#7c3aed"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          {chartData.some(d => d.previousSales) && (
            <Line
              type="monotone"
              dataKey="previousSales"
              name="Previous Year"
              stroke="#9ca3af"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 2 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderStoreChart = () => {
    // Combine all store data into a single dataset
    const allPeriods = new Set<string>();
    Object.values(storeData).forEach(data => {
      data.forEach(point => allPeriods.add(point.period));
    });

    const chartData = Array.from(allPeriods).sort().map(period => {
      const dataPoint: any = { period, weekEnding: period };
      
      Object.entries(storeData).forEach(([storeCode, data]) => {
        const point = data.find(p => p.period === period);
        if (point) {
          dataPoint[`${storeCode}_current`] = point.sales;
          dataPoint[`${storeCode}_previous`] = point.previousYear?.sales;
        }
      });
      
      return dataPoint;
    });

    return (
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="period"
            className="text-xs"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'currentColor' }}
            tickFormatter={(value) => formatCurrency(value, true)}
          />
          <Tooltip content={<StoreTooltip />} />
          <Legend />
          
          {/* Current year lines for each store */}
          {Object.keys(storeData).map(storeCode => (
            <Line
              key={`${storeCode}_current`}
              type="monotone"
              dataKey={`${storeCode}_current`}
              name={`${STORE_NAMES[storeCode as keyof typeof STORE_NAMES]} (Current)`}
              stroke={STORE_COLORS[storeCode as keyof typeof STORE_COLORS]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
          
          {/* Previous year lines for each store */}
          {Object.keys(storeData).map(storeCode => (
            <Line
              key={`${storeCode}_previous`}
              type="monotone"
              dataKey={`${storeCode}_previous`}
              name={`${STORE_NAMES[storeCode as keyof typeof STORE_NAMES]} (Previous)`}
              stroke={STORE_COLORS[storeCode as keyof typeof STORE_COLORS]}
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={{ r: 1 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </div>
          ))}
          {payload[0]?.payload?.previousSales && (
            <div className="mt-2 pt-2 border-t text-sm">
              <div className="text-muted-foreground">YoY Change:</div>
              <div className="font-medium">
                {((payload[0].value - payload[0].payload.previousSales) / payload[0].payload.previousSales * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const StoreTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentYearData = payload.filter((p: any) => p.dataKey.includes('_current'));
      const previousYearData = payload.filter((p: any) => p.dataKey.includes('_previous'));

      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg max-w-sm">
          <p className="font-medium mb-2">{label}</p>
          
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground">Current Year:</div>
            {currentYearData.map((entry: any, index: number) => {
              if (entry.value) {
                const storeCode = entry.dataKey.replace('_current', '');
                return (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-muted-foreground">
                      {STORE_NAMES[storeCode as keyof typeof STORE_NAMES]}:
                    </span>
                    <span className="font-medium">{formatCurrency(entry.value)}</span>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {previousYearData.some((p: any) => p.value) && (
            <div className="mt-2 pt-2 border-t space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Previous Year:</div>
              {previousYearData.map((entry: any, index: number) => {
                if (entry.value) {
                  const storeCode = entry.dataKey.replace('_previous', '');
                  return (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full opacity-60"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-muted-foreground">
                        {STORE_NAMES[storeCode as keyof typeof STORE_NAMES]}:
                      </span>
                      <span className="font-medium">{formatCurrency(entry.value)}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sales Trend</CardTitle>
          <div className="flex gap-2">
            {/* Debug info to show what data we have */}
            <span className="text-xs text-gray-500 mr-2">
              Stores: {Object.keys(storeData).length} | Aggregate: {aggregateData.length}
            </span>
            <Button
              variant={viewMode === 'aggregate' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('aggregate')}
              className="bg-blue-500 text-white border-2 border-blue-500 hover:bg-blue-600"
            >
              Aggregate
            </Button>
            <Button
              variant={viewMode === 'stores' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('stores')}
              className="bg-green-500 text-white border-2 border-green-500 hover:bg-green-600"
            >
              By Store
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          {viewMode === 'aggregate' ? renderAggregateChart() : renderStoreChart()}
        </div>
      </CardContent>
    </Card>
  );
} 