import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface SimpleDateFilterProps {
  value: { from: number; to: number };
  onChange: (value: { from: number; to: number }) => void;
}

const dateOptions = [
  { label: 'Last 7 days', value: { from: 7, to: 0 } },
  { label: 'Last 30 days', value: { from: 30, to: 0 } },
  { label: 'Last 90 days', value: { from: 90, to: 0 } },
  { label: 'Last 6 months', value: { from: 180, to: 0 } },
  { label: 'Last year', value: { from: 365, to: 0 } },
];

export function SimpleDateFilter({ value, onChange }: SimpleDateFilterProps) {
  const currentOption = dateOptions.find(opt => opt.value.from === value.from) || dateOptions[1];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[150px] justify-between">
          <Calendar className="mr-2 h-4 w-4" />
          {currentOption.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[150px]">
        {dateOptions.map((option) => (
          <DropdownMenuItem 
            key={option.label} 
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 