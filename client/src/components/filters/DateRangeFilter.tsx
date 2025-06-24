import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
}

export function DateRangeFilter({ startDate, endDate, onDateChange }: DateRangeFilterProps) {
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
    
    onDateChange(
      start.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => onDateChange(e.target.value, endDate)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => onDateChange(startDate, e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Quick Select</label>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handlePresetClick('4w')}>
                4 Weeks
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePresetClick('13w')}>
                13 Weeks
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePresetClick('52w')}>
                52 Weeks
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePresetClick('7d')}>
                Last 7 Days
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePresetClick('30d')}>
                Last 30 Days
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePresetClick('90d')}>
                Last 90 Days
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePresetClick('ytd')}>
                Year to Date
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePresetClick('1y')}>
                Last Year
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 