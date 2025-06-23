import React from 'react';
import { RefreshCw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/formatters';

interface TopBarProps {
  onRefresh?: () => void;
}

export function TopBar({ onRefresh }: TopBarProps) {
  const today = new Date();
  
  return (
    <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Executive Dashboard</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(today)}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  );
} 