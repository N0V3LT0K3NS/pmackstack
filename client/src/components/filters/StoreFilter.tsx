import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useStores } from '@/hooks/useStores';

interface StoreFilterProps {
  selectedStores: string[];
  onStoreChange: (stores: string[]) => void;
}

export function StoreFilter({ selectedStores, onStoreChange }: StoreFilterProps) {
  const { data: storesData, isLoading } = useStores();
  
  const stores = storesData?.stores || [];
  
  const handleStoreToggle = (storeCode: string) => {
    if (selectedStores.includes(storeCode)) {
      onStoreChange(selectedStores.filter(s => s !== storeCode));
    } else {
      onStoreChange([...selectedStores, storeCode]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedStores.length === stores.length) {
      onStoreChange([]);
    } else {
      onStoreChange(stores.map(s => s.storeCode));
    }
  };
  
  const getStoreName = (storeCode: string) => {
    const storeNames: Record<string, string> = {
      'anna': 'Annapolis',
      'char': 'Charlottesville', 
      'fell': 'Fells Point',
      'vabe': 'Virginia Beach',
      'will': 'Williamsburg'
    };
    return storeNames[storeCode] || storeCode.toUpperCase();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Store Locations</label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSelectAll}
              className="text-xs"
            >
              {selectedStores.length === stores.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          
          <div className="space-y-2">
            {stores.map((store) => (
              <label 
                key={store.storeCode}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md"
              >
                <input
                  type="checkbox"
                  checked={selectedStores.includes(store.storeCode)}
                  onChange={() => handleStoreToggle(store.storeCode)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium">
                  {getStoreName(store.storeCode)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({store.storeCode})
                </span>
              </label>
            ))}
          </div>
          
          {selectedStores.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {selectedStores.length} of {stores.length} stores selected
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 