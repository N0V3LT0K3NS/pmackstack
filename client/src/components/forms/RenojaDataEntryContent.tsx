import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStores } from '@/hooks/useStores';
import { AlertCircle, CheckCircle2, Calendar, Store, Users, Activity } from 'lucide-react';
import api from '@/lib/api';

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

export function RenojaDataEntryContent() {
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

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {submitMutation.isSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2" />
          Renoja weekly data submitted successfully!
        </div>
      )}

      {submitMutation.isError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Error submitting Renoja data. Please try again.
        </div>
      )}

      {/* Header */}
      <div className="space-y-2">
        <p className="text-gray-600">
          Track weekly member engagement and growth metrics for Renoja wellness studios
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store and Week Selection */}
        <Card className="p-6 bg-gradient-to-br from-white to-green-50/30 border-green-100">
          <div className="flex items-center gap-2 mb-4">
            <Store className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Studio & Week</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Store className="inline h-4 w-4 mr-1" />
                Studio Location
              </label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select a studio</option>
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
        <Card className="p-6 bg-gradient-to-br from-white to-blue-50/30 border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Weekly Actionables</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📱 Digital Posts
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
                ⭐ New Google Reviews
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
                🤝 New Partnerships
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
                🎉 Events (In-studio + Outside)
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
        <Card className="p-6 bg-gradient-to-br from-white to-purple-50/30 border-purple-100">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Measured Results</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ➕ New Members Signed
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
                👥 Total Paying Members
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
                ➖ Members Lost
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
                💰 Average Member Rate ($)
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

        {/* Summary */}
        {(formData.newMembersSigned || 0) > 0 || (formData.membersLost || 0) > 0 ? (
          <Card className="p-4 bg-gradient-to-br from-white to-gray-50/30 border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Net Member Change:</span>
              <span className={`font-semibold ${
                ((formData.newMembersSigned || 0) - (formData.membersLost || 0)) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {((formData.newMembersSigned || 0) - (formData.membersLost || 0)) >= 0 ? '+' : ''}
                {(formData.newMembersSigned || 0) - (formData.membersLost || 0)}
              </span>
            </div>
          </Card>
        ) : null}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!selectedStore || !weekEnding || submitMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit Weekly Data'}
          </Button>
        </div>
      </form>
    </div>
  );
} 