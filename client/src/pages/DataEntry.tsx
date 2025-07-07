import React, { useState } from 'react';
import { BrandTabs } from '@/components/ui/brand-tabs';
import { KilwinsDataEntryContent } from '@/components/forms/KilwinsDataEntryContent';
import { RenojaDataEntryContent } from '@/components/forms/RenojaDataEntryContent';
import { 
  FileTextIcon, 
  ActivityIcon,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';

export const DataEntry: React.FC = () => {
  const { user } = useAuth();
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

  // Check if user has write permissions
  const hasWritePermission = () => {
    if (user?.role === 'executive' || user?.role === 'bookkeeper') return true;
    
    // For managers, only renoja user has write permissions
    if (user?.role === 'manager') {
      return user.email === 'renoja';
    }
    
    return false;
  };

  const isReadOnly = !hasWritePermission();

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
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Kilwins Data Entry</h1>
              {isReadOnly && (
                <Card className="mt-4 p-4 bg-amber-50 border-amber-200">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                    <p className="text-sm text-amber-800">
                      You have read-only access. You can view recent entries but cannot submit new data.
                    </p>
                  </div>
                </Card>
              )}
            </div>
            
            {isReadOnly ? (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Entries (Read Only)</h2>
                <p className="text-gray-600 mb-6">
                  You can view recent data entries below. Contact an administrator if you need write access.
                </p>
                {/* Show only the recent entries table */}
                <div className="mt-6">
                  <KilwinsDataEntryContent />
                </div>
              </Card>
            ) : (
              <KilwinsDataEntryContent />
            )}
          </>
        ) : (
          <RenojaDataEntryContent />
        )}
      </div>
    </div>
  );
}; 