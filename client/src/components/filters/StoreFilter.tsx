import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useStores } from '@/hooks/useStores';
import { StoreIcon, MapPinIcon, CheckIcon, Users2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoreFilterProps {
  selectedStores: string[];
  onStoreChange: (stores: string[]) => void;
}

interface StoreInfo {
  code: string;
  name: string;
  location: string;
  color: string;
  performance: 'high' | 'medium' | 'low';
}

const storeInfo: Record<string, StoreInfo> = {
  'anna': { code: 'anna', name: 'Annapolis', location: 'Maryland', color: 'bg-red-500', performance: 'high' },
  'char': { code: 'char', name: 'Charlottesville', location: 'Virginia', color: 'bg-green-500', performance: 'high' },
  'fell': { code: 'fell', name: 'Fells Point', location: 'Maryland', color: 'bg-blue-500', performance: 'medium' },
  'vabe': { code: 'vabe', name: 'Virginia Beach', location: 'Virginia', color: 'bg-yellow-500', performance: 'medium' },
  'will': { code: 'will', name: 'Williamsburg', location: 'Virginia', color: 'bg-purple-500', performance: 'high' }
};

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

  const getSelectionSummary = () => {
    if (selectedStores.length === 0) return 'No stores selected';
    if (selectedStores.length === stores.length) return 'All stores selected';
    return `${selectedStores.length} of ${stores.length} stores selected`;
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/30">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/30">
      <CardContent className="p-6">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StoreIcon className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-semibold text-gray-700 tracking-wide">Store Locations</label>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSelectAll}
              className={cn(
                "text-xs font-medium transition-all duration-200 hover:scale-105",
                "hover:bg-blue-50 hover:text-blue-700"
              )}
            >
              {selectedStores.length === stores.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          
          {/* Store List */}
          <div className="space-y-2">
            {stores.map((store) => {
              const info = storeInfo[store.storeCode];
              const isSelected = selectedStores.includes(store.storeCode);
              
              return (
                <label 
                  key={store.storeCode}
                  className={cn(
                    "group flex items-center space-x-3 cursor-pointer p-3 rounded-lg transition-all duration-200",
                    "hover:bg-gray-50 hover:shadow-sm active:scale-98",
                    isSelected && "bg-blue-50 ring-2 ring-blue-100 shadow-sm"
                  )}
                >
                  {/* Custom Checkbox */}
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleStoreToggle(store.storeCode)}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center",
                      isSelected 
                        ? "bg-blue-600 border-blue-600 text-white" 
                        : "border-gray-300 group-hover:border-gray-400"
                    )}>
                      {isSelected && <CheckIcon className="h-3 w-3" />}
                    </div>
                  </div>
                  
                  {/* Store Color Indicator */}
                  <div className={cn(
                    "w-3 h-3 rounded-full transition-all duration-200",
                    info?.color || "bg-gray-400",
                    isSelected && "ring-2 ring-white shadow-md"
                  )} />
                  
                  {/* Store Information */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm font-semibold transition-colors duration-200",
                        isSelected ? "text-blue-900" : "text-gray-900"
                      )}>
                        {info?.name || store.storeCode.toUpperCase()}
                      </span>
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full transition-all duration-200",
                        isSelected ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-600"
                      )}>
                        {store.storeCode}
                      </span>
                    </div>
                    {info?.location && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPinIcon className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{info.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Performance Indicator */}
                  {info?.performance && (
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-all duration-200",
                      info.performance === 'high' && "bg-green-400",
                      info.performance === 'medium' && "bg-yellow-400",
                      info.performance === 'low' && "bg-red-400",
                      isSelected && "ring-2 ring-white"
                    )} />
                  )}
                </label>
              );
            })}
          </div>
          
          {/* Selection Summary */}
          <div className={cn(
            "flex items-center justify-between p-3 rounded-lg transition-all duration-200",
            "bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200"
          )}>
            <div className="flex items-center gap-2">
              <Users2Icon className="h-4 w-4 text-gray-500" />
              <span className="text-xs font-medium text-gray-600">
                {getSelectionSummary()}
              </span>
            </div>
            
            {selectedStores.length > 0 && (
              <div className="flex items-center gap-1">
                {selectedStores.slice(0, 3).map(storeCode => {
                  const info = storeInfo[storeCode];
                  return (
                    <div 
                      key={storeCode}
                      className={cn(
                        "w-2 h-2 rounded-full",
                        info?.color || "bg-gray-400"
                      )}
                    />
                  );
                })}
                {selectedStores.length > 3 && (
                  <span className="text-xs text-gray-500 ml-1">
                    +{selectedStores.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 