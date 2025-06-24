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
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { UsersIcon, BarChart3Icon, LayersIcon, InfoIcon, ClockIcon, DollarSignIcon, PercentIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimeSeriesDataPoint } from '@shared/types/models';

interface LaborChartProps {
  aggregateData: TimeSeriesDataPoint[];
  storeData: { [storeCode: string]: TimeSeriesDataPoint[] };
  loading?: boolean;
  height?: number;
}

const STORE_COLORS = {
  anna: '#dc2626',    // Red
  char: '#16a34a',    // Green  
  fell: '#2563eb',    // Blue
  vabe: '#ca8a04',    // Yellow/Gold
  will: '#7c3aed',    // Purple
};

const STORE_NAMES = {
  anna: 'Annapolis',
  char: 'Charlottesville', 
  fell: 'Fells Point',
  vabe: 'Virginia Beach',
  will: 'Williamsburg',
};

export function LaborChart({ 
  aggregateData, 
  storeData, 
  loading = false, 
  height = 350 
}: LaborChartProps) {
  const [viewMode, setViewMode] = useState<'aggregate' | 'stores'>('aggregate');
  const [metricMode, setMetricMode] = useState<'cost' | 'hours' | 'percent'>('cost');

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full bg-gradient-to-br from-gray-100 to-gray-50 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const getMetricValue = (point: TimeSeriesDataPoint) => {
    switch (metricMode) {
      case 'cost':
        return point.laborCost || 0;
      case 'hours':
        return point.laborHours || 0;
      case 'percent':
        return point.laborPercent || 0;
      default:
        return 0;
    }
  };

  const getMetricName = () => {
    switch (metricMode) {
      case 'cost':
        return 'Labor Cost';
      case 'hours':
        return 'Labor Hours';
      case 'percent':
        return 'Labor %';
      default:
        return 'Labor';
    }
  };

  const getMetricIcon = () => {
    switch (metricMode) {
      case 'cost':
        return <DollarSignIcon className="h-3.5 w-3.5" />;
      case 'hours':
        return <ClockIcon className="h-3.5 w-3.5" />;
      case 'percent':
        return <PercentIcon className="h-3.5 w-3.5" />;
      default:
        return <UsersIcon className="h-3.5 w-3.5" />;
    }
  };

  const formatMetricValue = (value: number, abbreviated = false) => {
    switch (metricMode) {
      case 'cost':
        return formatCurrency(value, abbreviated);
      case 'hours':
        return formatNumber(value, abbreviated) + (abbreviated ? 'h' : ' hours');
      case 'percent':
        return value.toFixed(1) + '%';
      default:
        return formatNumber(value, abbreviated);
    }
  };

  const renderAggregateChart = () => {
    const chartData = aggregateData.map(point => {
      let previousMetric: number | undefined = undefined;
      
      if (point.previousYear) {
        switch (metricMode) {
          case 'cost':
            // Use provided previous year labor cost, or calculate if not available
            previousMetric = point.previousYear.laborCost || 
              (point.previousYear.laborPercent && point.previousYear.sales ? 
                (point.previousYear.laborPercent / 100) * point.previousYear.sales : undefined);
            break;
          case 'hours':
            // Labor hours not typically available for previous year, but check if data exists
            previousMetric = point.previousYear.laborHours || undefined;
            break;
          case 'percent':
            previousMetric = point.previousYear.laborPercent;
            break;
        }
      }
      
      return {
        ...point,
        weekEnding: point.weekEnding || point.period,
        currentMetric: getMetricValue(point),
        previousMetric,
      };
    });

    return (
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" opacity={0.5} />
          <XAxis
            dataKey="weekEnding"
            className="text-xs"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => formatMetricValue(value, true)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="currentMetric"
            name={`Current Year ${getMetricName()}`}
            stroke="#059669"
            strokeWidth={3}
            dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
          />
          {chartData.some(d => d.previousMetric) && (
            <Line
              type="monotone"
              dataKey="previousMetric"
              name={`Previous Year ${getMetricName()}`}
              stroke="#9ca3af"
              strokeWidth={2}
              strokeDasharray="8 4"
              dot={{ r: 3, fill: '#9ca3af', strokeWidth: 1, stroke: '#fff' }}
              activeDot={{ r: 5, fill: '#9ca3af', strokeWidth: 2, stroke: '#fff' }}
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
          dataPoint[`${storeCode}_current`] = getMetricValue(point);
          if (point.previousYear) {
            let previousMetric: number | undefined = undefined;
            
            switch (metricMode) {
              case 'cost':
                // Use provided previous year labor cost, or calculate if not available
                previousMetric = point.previousYear.laborCost || 
                  (point.previousYear.laborPercent && point.previousYear.sales ? 
                    (point.previousYear.laborPercent / 100) * point.previousYear.sales : undefined);
                break;
              case 'hours':
                // Labor hours not typically available for previous year, but check if data exists
                previousMetric = point.previousYear.laborHours || undefined;
                break;
              case 'percent':
                previousMetric = point.previousYear.laborPercent;
                break;
            }
            
            dataPoint[`${storeCode}_previous`] = previousMetric;
          }
        }
      });
      
      return dataPoint;
    });

    return (
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" opacity={0.5} />
          <XAxis
            dataKey="period"
            className="text-xs"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => formatMetricValue(value, true)}
          />
          <Tooltip content={<StoreTooltip />} />
          
          {/* Current year lines for each store */}
          {Object.keys(storeData).map(storeCode => (
            <Line
              key={`${storeCode}_current`}
              type="monotone"
              dataKey={`${storeCode}_current`}
              name={`${STORE_NAMES[storeCode as keyof typeof STORE_NAMES]}`}
              stroke={STORE_COLORS[storeCode as keyof typeof STORE_COLORS]}
              strokeWidth={2.5}
              dot={{ 
                r: 4, 
                fill: STORE_COLORS[storeCode as keyof typeof STORE_COLORS], 
                strokeWidth: 2, 
                stroke: '#fff' 
              }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              connectNulls={false}
            />
          ))}
          
          {/* Previous year lines for each store */}
          {Object.keys(storeData).map(storeCode => (
            <Line
              key={`${storeCode}_previous`}
              type="monotone"
              dataKey={`${storeCode}_previous`}
              name=""
              stroke={STORE_COLORS[storeCode as keyof typeof STORE_COLORS]}
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={{ r: 2, strokeWidth: 1, stroke: '#fff' }}
              connectNulls={false}
              opacity={0.6}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg backdrop-blur-sm">
          <p className="font-semibold mb-3 text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3 text-sm mb-2">
              <div
                className="w-3 h-3 rounded-full ring-2 ring-white"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 min-w-0 flex-1">{entry.name}:</span>
              <span className="font-semibold text-gray-900 tabular-nums">{formatMetricValue(entry.value)}</span>
            </div>
          ))}
          {payload[0]?.payload?.previousMetric && payload[0]?.payload?.currentMetric && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">YoY Change:</span>
                <span className={cn(
                  "font-semibold tabular-nums",
                  ((payload[0].payload.currentMetric - payload[0].payload.previousMetric) / payload[0].payload.previousMetric * 100) > 0 
                    ? "text-red-600"  // For labor metrics, increase is usually bad
                    : "text-green-600"
                )}>
                  {((payload[0].payload.currentMetric - payload[0].payload.previousMetric) / payload[0].payload.previousMetric * 100).toFixed(1)}%
                </span>
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
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg backdrop-blur-sm max-w-sm">
          <p className="font-semibold mb-3 text-gray-900">{label}</p>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Current Year:</div>
            {currentYearData.map((entry: any, index: number) => {
              if (entry.value) {
                const storeCode = entry.dataKey.replace('_current', '');
                return (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div
                      className="w-3 h-3 rounded-full ring-2 ring-white"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-gray-600 min-w-0 flex-1">
                      {STORE_NAMES[storeCode as keyof typeof STORE_NAMES]}:
                    </span>
                    <span className="font-semibold text-gray-900 tabular-nums">{formatMetricValue(entry.value)}</span>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {previousYearData.some((p: any) => p.value) && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              <div className="text-sm font-medium text-gray-700">Previous Year:</div>
              {previousYearData.map((entry: any, index: number) => {
                if (entry.value) {
                  const storeCode = entry.dataKey.replace('_previous', '');
                  return (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div
                        className="w-3 h-3 rounded-full ring-2 ring-white opacity-60"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-gray-600 min-w-0 flex-1">
                        {STORE_NAMES[storeCode as keyof typeof STORE_NAMES]}:
                      </span>
                      <span className="font-semibold text-gray-900 tabular-nums">{formatMetricValue(entry.value)}</span>
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
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UsersIcon className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg font-bold text-gray-900">Labor Metrics</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            {/* Metric Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMetricMode('cost')}
                className={cn(
                  "flex items-center gap-1.5 h-8 px-3 text-xs font-medium transition-all duration-200",
                  "hover:scale-105 active:scale-95",
                  metricMode === 'cost'
                    ? "bg-white text-green-700 shadow-sm ring-1 ring-green-200"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <DollarSignIcon className="h-3 w-3" />
                Cost
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMetricMode('hours')}
                className={cn(
                  "flex items-center gap-1.5 h-8 px-3 text-xs font-medium transition-all duration-200",
                  "hover:scale-105 active:scale-95",
                  metricMode === 'hours'
                    ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-200"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <ClockIcon className="h-3 w-3" />
                Hours
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMetricMode('percent')}
                className={cn(
                  "flex items-center gap-1.5 h-8 px-3 text-xs font-medium transition-all duration-200",
                  "hover:scale-105 active:scale-95",
                  metricMode === 'percent'
                    ? "bg-white text-purple-700 shadow-sm ring-1 ring-purple-200"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <PercentIcon className="h-3 w-3" />
                %
              </Button>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('aggregate')}
                className={cn(
                  "flex items-center gap-2 h-8 px-3 text-xs font-medium transition-all duration-200",
                  "hover:scale-105 active:scale-95",
                  viewMode === 'aggregate'
                    ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-200"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <BarChart3Icon className="h-3.5 w-3.5" />
                Aggregate
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('stores')}
                className={cn(
                  "flex items-center gap-2 h-8 px-3 text-xs font-medium transition-all duration-200",
                  "hover:scale-105 active:scale-95",
                  viewMode === 'stores'
                    ? "bg-white text-green-700 shadow-sm ring-1 ring-green-200"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <LayersIcon className="h-3.5 w-3.5" />
                By Store
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div style={{ width: '100%', height }} className="rounded-lg overflow-hidden">
          {viewMode === 'aggregate' ? renderAggregateChart() : renderStoreChart()}
        </div>
      </CardContent>
    </Card>
  );
} 