import React, { useState } from 'react';
import { BrandTabs } from '@/components/ui/brand-tabs';
import { KilwinsDataEntryContent } from '@/components/forms/KilwinsDataEntryContent';
import { RenojaDataEntryContent } from '@/components/forms/RenojaDataEntryContent';
import { 
  FileTextIcon, 
  ActivityIcon,
} from 'lucide-react';

export const DataEntry: React.FC = () => {
  const [activeBrand, setActiveBrand] = useState<'kilwins' | 'renoja'>('kilwins');

  // Persist tab selection to localStorage
  React.useEffect(() => {
    const savedBrand = localStorage.getItem('data-entry-active-brand') as 'kilwins' | 'renoja';
    if (savedBrand) {
      setActiveBrand(savedBrand);
    }
  }, []);

  const handleBrandChange = (brand: 'kilwins' | 'renoja') => {
    setActiveBrand(brand);
    localStorage.setItem('data-entry-active-brand', brand);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      <div className="space-y-8 p-6 w-full">
        {/* Enhanced Header with Brand Tabs */}
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-green-600/5 rounded-2xl" />
          
          <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                    <FileTextIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Data Entry
                    </h1>
                    <p className="text-gray-600 mt-1 flex items-center gap-2">
                      <ActivityIcon className="h-4 w-4" />
                      Multi-brand data management and analytics input
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Brand Tabs */}
              <BrandTabs 
                activeBrand={activeBrand} 
                onChange={handleBrandChange}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* Brand-Specific Content */}
        {activeBrand === 'kilwins' ? (
          <KilwinsDataEntryContent />
        ) : (
          <RenojaDataEntryContent />
        )}
      </div>
    </div>
  );
}; 