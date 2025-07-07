import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStores } from '@/hooks/useStores';
import { AlertCircle, CheckCircle2, Calendar, Store } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface RenojaWeeklyData {
  storeCode: string;
  weekEnding: string;
  // Weekly Actionables
  digitalPosts: number;
  newGoogleReviews: number;
  partnerships: number;
  events: number;
  // Measured Results
  newMembersSigned: number;
  totalPayingMembers: number;
  membersLost: number;
  avgMemberRate: number;
}

export default function RenojaDataEntry() {
  const queryClient = useQueryClient();
  const [selectedStore, setSelectedStore] = useState('');
  const [weekEnding, setWeekEnding] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    return sunday.toISOString().split('T')[0];
  });

  const [formData, setFormData] = useState<Partial<RenojaWeeklyData>>({
    digitalPosts: 0,
    newGoogleReviews: 0,
    partnerships: 0,
    events: 0,
    newMembersSigned: 0,
    totalPayingMembers: 0,
    membersLost: 0,
    avgMemberRate: 0,
  });

  const { data: stores } = useStores('RENOJA');
  const { user } = useAuth();

  // Fetch last week's data for auto-fill
  const { data: lastWeekData } = useQuery({
    queryKey: ['renoja-last-week', selectedStore],
    queryFn: async () => {
      if (!selectedStore) return null;
      const response = await api.get(`/api/renoja/last-week/${selectedStore}`);
      return response.data;
    },
    enabled: !!selectedStore,
  });

  // Auto-fill with last week's data when available
  React.useEffect(() => {
    if (lastWeekData) {
      setFormData(prev => ({
        ...prev,
        totalPayingMembers: lastWeekData.totalPayingMembers || 0,
        avgMemberRate: lastWeekData.avgMemberRate || 0,
      }));
    }
  }, [lastWeekData]);

  const submitMutation = useMutation({
    mutationFn: async (data: RenojaWeeklyData) => {
      const response = await api.post('/api/renoja/weekly', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['renoja-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['renoja-recent'] });
      // Reset form
      setFormData({
        digitalPosts: 0,
        newGoogleReviews: 0,
        partnerships: 0,
        events: 0,
        newMembersSigned: 0,
        totalPayingMembers: lastWeekData?.totalPayingMembers || 0,
        membersLost: 0,
        avgMemberRate: lastWeekData?.avgMemberRate || 0,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore || !weekEnding) return;

    submitMutation.mutate({
      ...formData as RenojaWeeklyData,
      storeCode: selectedStore,
      weekEnding,
    });
  };

  const handleInputChange = (field: keyof RenojaWeeklyData, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  // Check if user has write permissions for Renoja
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Renoja Data Entry</h1>
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
          <h2 className="text-xl font-semibold mb-4">View Only Access</h2>
          <p className="text-gray-600">
            You do not have permission to enter data for Renoja locations. 
            Contact an administrator if you need write access.
          </p>
        </Card>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Renoja Weekly Data Entry</h1>
            <p className="text-gray-600 mt-1">Enter weekly actionables and measured results</p>
          </div>

          {submitMutation.isSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Data submitted successfully!
            </div>
          )}

          {submitMutation.isError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error submitting data. Please try again.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Store and Week Selection */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Store & Week</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Store className="inline h-4 w-4 mr-1" />
                    Store Location
                  </label>
                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select a store</option>
                    {stores?.stores.map((store) => (
                      <option key={store.storeCode} value={store.storeCode}>
                        {store.storeName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Week Ending
                  </label>
                  <input
                    type="date"
                    value={weekEnding}
                    onChange={(e) => setWeekEnding(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Weekly Actionables */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Weekly Actionables</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Digital Posts
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.digitalPosts || ''}
                    onChange={(e) => handleInputChange('digitalPosts', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Google Reviews
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.newGoogleReviews || ''}
                    onChange={(e) => handleInputChange('newGoogleReviews', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partnerships
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.partnerships || ''}
                    onChange={(e) => handleInputChange('partnerships', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Events
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.events || ''}
                    onChange={(e) => handleInputChange('events', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </Card>

            {/* Measured Results */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Measured Results</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Members Signed
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.newMembersSigned || ''}
                    onChange={(e) => handleInputChange('newMembersSigned', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Paying Members
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.totalPayingMembers || ''}
                    onChange={(e) => handleInputChange('totalPayingMembers', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                  {lastWeekData && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last week: {lastWeekData.totalPayingMembers}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Members Lost
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.membersLost || ''}
                    onChange={(e) => handleInputChange('membersLost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Average Member Rate ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.avgMemberRate || ''}
                    onChange={(e) => handleInputChange('avgMemberRate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                  />
                  {lastWeekData && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last week: ${lastWeekData.avgMemberRate}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!selectedStore || !weekEnding || submitMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit Weekly Data'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 