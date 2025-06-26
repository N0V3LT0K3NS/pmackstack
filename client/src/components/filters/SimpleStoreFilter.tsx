import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import type { StoreListResponse } from '@shared/types/api';

interface SimpleStoreFilterProps {
  stores: StoreListResponse['stores'];
  value: string;
  onChange: (value: string) => void;
}

export function SimpleStoreFilter({ stores, value, onChange }: SimpleStoreFilterProps) {
  const selectedStore = value === 'all' 
    ? { storeCode: 'all', storeName: 'All Stores' }
    : stores.find(s => s.storeCode === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between">
          {selectedStore?.storeName || 'Select Store'}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        <DropdownMenuItem onClick={() => onChange('all')}>
          All Stores
        </DropdownMenuItem>
        {stores.map((store) => (
          <DropdownMenuItem 
            key={store.storeCode} 
            onClick={() => onChange(store.storeCode)}
          >
            {store.storeName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 