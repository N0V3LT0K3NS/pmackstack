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
import type { TimeSeriesDataPoint } from '@shared/types/models';

interface LaborChartProps {
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
      <Card>
        <CardHeader>
          <CardTitle>Labor Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full bg-gray-100 animate-pulse rounded" />
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
    const chartData = aggregateData.map(point => ({
      ...point,
      weekEnding: point.weekEnding || point.period,
      currentMetric: getMetricValue(point),
      previousMetric: point.previousYear ? getMetricValue({
        ...point,
        laborCost: point.previousYear.laborPercent && point.sales ? 
          (point.previousYear.laborPercent / 100) * point.sales : undefined,
        laborHours: undefined, // Not available for previous year
        laborPercent: point.previousYear.laborPercent
      } as TimeSeriesDataPoint) : undefined,
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
            tickFormatter={(value) => formatMetricValue(value, true)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="currentMetric"
            name={`Current Year ${getMetricName()}`}
            stroke="#059669"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          {chartData.some(d => d.previousMetric) && (
            <Line
              type="monotone"
              dataKey="previousMetric"
              name={`Previous Year ${getMetricName()}`}
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
          dataPoint[`${storeCode}_current`] = getMetricValue(point);
          if (point.previousYear) {
            dataPoint[`${storeCode}_previous`] = getMetricValue({
              ...point,
              laborCost: point.previousYear.laborPercent && point.sales ? 
                (point.previousYear.laborPercent / 100) * point.sales : undefined,
              laborHours: undefined,
              laborPercent: point.previousYear.laborPercent
            } as TimeSeriesDataPoint);
          }
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
            tickFormatter={(value) => formatMetricValue(value, true)}
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
              <span className="font-medium">{formatMetricValue(entry.value)}</span>
            </div>
          ))}
          {payload[0]?.payload?.previousMetric && payload[0]?.payload?.currentMetric && (
            <div className="mt-2 pt-2 border-t text-sm">
              <div className="text-muted-foreground">YoY Change:</div>
              <div className="font-medium">
                {((payload[0].payload.currentMetric - payload[0].payload.previousMetric) / payload[0].payload.previousMetric * 100).toFixed(1)}%
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
                    <span className="font-medium">{formatMetricValue(entry.value)}</span>
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
                      <span className="font-medium">{formatMetricValue(entry.value)}</span>
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
          <CardTitle>Labor Metrics</CardTitle>
          <div className="flex gap-2">
            <div className="flex gap-1">
              <Button
                variant={metricMode === 'cost' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMetricMode('cost')}
              >
                Cost
              </Button>
              <Button
                variant={metricMode === 'hours' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMetricMode('hours')}
              >
                Hours
              </Button>
              <Button
                variant={metricMode === 'percent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMetricMode('percent')}
              >
                %
              </Button>
            </div>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'aggregate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('aggregate')}
              >
                Aggregate
              </Button>
              <Button
                variant={viewMode === 'stores' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('stores')}
              >
                By Store
              </Button>
            </div>
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