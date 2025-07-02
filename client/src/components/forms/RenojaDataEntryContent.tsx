import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStores } from '@/hooks/useStores';
import { AlertCircle, CheckCircle2, Calendar, Store, Users, Activity } from 'lucide-react';
import { renojaApi } from '@/lib/api';

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

// Manual Entry Form Component
function RenojaWeeklyForm({ onSuccess, onError }: { onSuccess: () => void; onError: (error: string) => void }) {
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

  const { data: stores } = useStores('Renoja');

  // Fetch last week's data for auto-fill
  const { data: lastWeekData } = useQuery({
    queryKey: ['renoja-last-week', selectedStore],
    queryFn: async () => {
      if (!selectedStore) return null;
      return await renojaApi.getLastWeekData(selectedStore);
    },
    enabled: !!selectedStore,
  });

  // Auto-fill with last week's data when available
  useEffect(() => {
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
      return await renojaApi.submitWeeklyEntry(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['renoja-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['renoja-recent'] });
      onSuccess();
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
    onError: (error: any) => {
      onError(error.message || 'Failed to submit Renoja data');
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
  );
}

// CSV Import Component (Placeholder)
function RenojaCSVImport({ onSuccess }: { onSuccess: () => void }) {
  return (
    <Card className="p-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-2xl">📄</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900">CSV Import for Renoja</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Bulk import functionality for Renoja wellness data coming soon. 
          For now, please use manual entry for each studio.
        </p>
        <Button disabled className="bg-gray-300 text-gray-500 cursor-not-allowed">
          Import CSV (Coming Soon)
        </Button>
      </div>
    </Card>
  );
}

// Recent Entries Component
function RenojaRecentEntries() {
  const { data: recentEntries, isLoading } = useQuery({
    queryKey: ['renoja-recent'],
    queryFn: () => renojaApi.getRecentEntries(10),
    staleTime: 30000, // 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">Loading recent entries...</div>
      </Card>
    );
  }

  if (!recentEntries || recentEntries.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">🕒</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No Recent Entries</h3>
          <p className="text-gray-600">
            No Renoja wellness data has been submitted yet. Use the Manual Entry tab to get started.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Studio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Week Ending
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                New Members
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Members
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Retention %
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Events
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentEntries.map((entry: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {entry.storeName || entry.store_code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(entry.week_ending).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.new_members_signed}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.total_paying_members}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parseFloat(entry.member_retention_rate || 0).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(entry.events_in_studio || 0) + (entry.events_outside_studio || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// Main Component
export function RenojaDataEntryContent() {
  const [activeTab, setActiveTab] = useState<'manual' | 'import' | 'recent'>('manual');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFormSuccess = () => {
    setMessage({ type: 'success', text: 'Renoja weekly data submitted successfully!' });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleFormError = (error: string) => {
    setMessage({ type: 'error', text: error });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleImportSuccess = () => {
    setMessage({ 
      type: 'success', 
      text: 'Renoja CSV import completed successfully!' 
    });
    setTimeout(() => setMessage(null), 8000);
  };

  const tabs = [
    { id: 'manual', label: 'Manual Entry', icon: '📝' },
    { id: 'import', label: 'CSV Import', icon: '📄' },
    { id: 'recent', label: 'Recent Entries', icon: '🕒' }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {message && (
        <div className={`px-4 py-2 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="space-y-2">
        <p className="text-gray-600">
          Manage weekly member engagement and growth metrics for Renoja wellness studios
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'manual' && (
          <RenojaWeeklyForm 
            onSuccess={handleFormSuccess}
            onError={handleFormError}
          />
        )}

        {activeTab === 'import' && (
          <RenojaCSVImport 
            onSuccess={handleImportSuccess}
          />
        )}

        {activeTab === 'recent' && (
          <RenojaRecentEntries />
        )}
      </div>
    </div>
  );
} 