import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarIcon, ClockIcon, TrendingUpIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
}

interface PresetOption {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  category: 'weeks' | 'days' | 'periods';
  popular?: boolean;
}

const presetOptions: PresetOption[] = [
  { id: '4w', label: '4 Weeks', shortLabel: '4W', icon: <ClockIcon className="h-3.5 w-3.5" />, category: 'weeks', popular: true },
  { id: '13w', label: '13 Weeks (Quarter)', shortLabel: '13W', icon: <TrendingUpIcon className="h-3.5 w-3.5" />, category: 'weeks', popular: true },
  { id: '52w', label: '52 Weeks (Year)', shortLabel: '52W', icon: <CalendarIcon className="h-3.5 w-3.5" />, category: 'weeks', popular: true },
  { id: '7d', label: 'Last 7 Days', shortLabel: '7D', icon: <ClockIcon className="h-3.5 w-3.5" />, category: 'days' },
  { id: '30d', label: 'Last 30 Days', shortLabel: '30D', icon: <ClockIcon className="h-3.5 w-3.5" />, category: 'days' },
  { id: '90d', label: 'Last 90 Days', shortLabel: '90D', icon: <ClockIcon className="h-3.5 w-3.5" />, category: 'days' },
  { id: 'ytd', label: 'Year to Date', shortLabel: 'YTD', icon: <CalendarIcon className="h-3.5 w-3.5" />, category: 'periods', popular: true },
  { id: '1y', label: 'Last Year', shortLabel: '1Y', icon: <CalendarIcon className="h-3.5 w-3.5" />, category: 'periods' },
];

export function DateRangeFilter({ startDate, endDate, onDateChange }: DateRangeFilterProps) {
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const handlePresetClick = (preset: string) => {
    const today = new Date();
    let start: Date;
    
    switch (preset) {
      case '4w':
        start = new Date(today.getTime() - 4 * 7 * 24 * 60 * 60 * 1000);
        break;
      case '13w':
        start = new Date(today.getTime() - 13 * 7 * 24 * 60 * 60 * 1000);
        break;
      case '52w':
        start = new Date(today.getTime() - 52 * 7 * 24 * 60 * 60 * 1000);
        break;
      case '7d':
        start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        start = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'ytd':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      case '1y':
        start = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return;
    }
    
    setActivePreset(preset);
    onDateChange(
      start.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    );
  };

  const handleCustomDateChange = (newStartDate: string, newEndDate: string) => {
    setActivePreset(null); // Clear active preset when custom dates are used
    onDateChange(newStartDate, newEndDate);
  };

  const formatDateRange = () => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days selected`;
  };

  // Group presets by category
  const popularPresets = presetOptions.filter(p => p.popular);
  const weekPresets = presetOptions.filter(p => p.category === 'weeks' && !p.popular);
  const dayPresets = presetOptions.filter(p => p.category === 'days');
  const periodPresets = presetOptions.filter(p => p.category === 'periods' && !p.popular);

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/30">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Custom Date Range */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-semibold text-gray-700 tracking-wide">Date Range</label>
              {startDate && endDate && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {formatDateRange()}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleCustomDateChange(e.target.value, endDate)}
                  className={cn(
                    "flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm",
                    "shadow-sm transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "hover:border-gray-300"
                  )}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleCustomDateChange(startDate, e.target.value)}
                  className={cn(
                    "flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm",
                    "shadow-sm transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "hover:border-gray-300"
                  )}
                />
              </div>
            </div>
          </div>
          
          {/* Quick Select Presets */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUpIcon className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-semibold text-gray-700 tracking-wide">Quick Select</label>
            </div>
            
            {/* Popular Presets */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Most Popular</div>
              <div className="flex flex-wrap gap-2">
                {popularPresets.map((preset) => (
                  <Button
                    key={preset.id}
                    variant={activePreset === preset.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePresetClick(preset.id)}
                    className={cn(
                      "flex items-center gap-2 h-9 px-3 transition-all duration-200",
                      "hover:scale-105 active:scale-95",
                      activePreset === preset.id 
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md ring-2 ring-blue-200" 
                        : "hover:bg-gray-50 hover:border-gray-300"
                    )}
                  >
                    {preset.icon}
                    <span className="font-medium">{preset.shortLabel}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Other Options */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Other Options</div>
              <div className="grid grid-cols-4 gap-2">
                {[...dayPresets, ...weekPresets, ...periodPresets].map((preset) => (
                  <Button
                    key={preset.id}
                    variant={activePreset === preset.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePresetClick(preset.id)}
                    className={cn(
                      "flex items-center gap-1.5 h-8 px-2 text-xs transition-all duration-200",
                      "hover:scale-105 active:scale-95",
                      activePreset === preset.id 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "hover:bg-gray-50"
                    )}
                  >
                    {preset.icon}
                    <span>{preset.shortLabel}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 