import React from 'react';
import { cn } from '@/lib/utils';

interface BrandTabsProps {
  activeBrand: 'kilwins' | 'renoja';
  onChange: (brand: 'kilwins' | 'renoja') => void;
  className?: string;
}

export function BrandTabs({ activeBrand, onChange, className }: BrandTabsProps) {
  const tabs = [
    {
      id: 'kilwins' as const,
      label: 'Kilwins',
      color: 'purple',
      activeClass: 'bg-purple-600 text-white border-purple-600',
      inactiveClass: 'text-purple-600 border-purple-200 hover:bg-purple-50'
    },
    {
      id: 'renoja' as const,
      label: 'Renoja',
      color: 'green',
      activeClass: 'bg-green-600 text-white border-green-600',
      inactiveClass: 'text-green-600 border-green-200 hover:bg-green-50'
    }
  ];

  return (
    <div className={cn('flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-6 py-2 text-sm font-medium rounded-md border transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            activeBrand === tab.id ? tab.activeClass : tab.inactiveClass,
            activeBrand === tab.id ? `focus:ring-${tab.color}-500` : `focus:ring-${tab.color}-500`
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
} 