import React, { useState, useEffect } from 'react';
import { WeeklyDataForm } from '../components/forms/WeeklyDataForm';
import { CSVImportForm } from '../components/forms/CSVImportForm';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { dataEntryApi } from '../lib/dataEntry';
import type { RecentEntry, CSVImportResult } from '../lib/dataEntry';
import { formatCurrency, formatDate } from '../lib/formatters';

export const DataEntry: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'manual' | 'import' | 'recent'>('manual');
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (activeTab === 'recent') {
      loadRecentEntries();
    }
  }, [activeTab]);

  const loadRecentEntries = async () => {
    setLoading(true);
    try {
      const entries = await dataEntryApi.getRecentEntries(20);
      setRecentEntries(entries);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load recent entries' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setMessage({ type: 'success', text: 'Weekly data submitted successfully!' });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleFormError = (error: string) => {
    setMessage({ type: 'error', text: error });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleImportSuccess = (result: CSVImportResult) => {
    setMessage({ 
      type: 'success', 
      text: `CSV import completed! ${result.successful} records imported successfully${result.failed > 0 ? `, ${result.failed} failed` : ''}.` 
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Data Entry</h1>
        
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
                  ? 'border-blue-500 text-blue-600'
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
          <WeeklyDataForm 
            onSuccess={handleFormSuccess}
            onError={handleFormError}
          />
        )}

        {activeTab === 'import' && (
          <CSVImportForm 
            onSuccess={handleImportSuccess}
            onError={handleFormError}
          />
        )}

        {activeTab === 'recent' && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Data Entries</h2>
              <Button 
                onClick={loadRecentEntries}
                disabled={loading}
                variant="outline"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>

            {recentEntries.length === 0 && !loading ? (
              <div className="text-center py-8 text-gray-500">
                No recent entries found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Store
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sales
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transactions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Labor Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Wage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {entry.store_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {entry.store_code}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.fiscal_year} W{entry.week_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(entry.total_sales)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.num_transactions.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.variable_hours.toFixed(1)}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(entry.average_wage)}/hr
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(entry.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.created_by_email || 'System'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}; 