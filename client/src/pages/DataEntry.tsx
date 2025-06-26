import React, { useState } from 'react';
import { WeeklyDataForm } from '../components/forms/WeeklyDataForm';
import CSVImportForm from '../components/forms/CSVImportForm';
import RecentEntriesTable from '../components/forms/RecentEntriesTable';

export const DataEntry: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'manual' | 'import' | 'recent'>('manual');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFormSuccess = () => {
    setMessage({ type: 'success', text: 'Weekly data submitted successfully!' });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleFormError = (error: string) => {
    setMessage({ type: 'error', text: error });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleImportSuccess = () => {
    setMessage({ 
      type: 'success', 
      text: 'CSV import completed successfully!' 
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
          />
        )}

        {activeTab === 'recent' && (
          <RecentEntriesTable />
        )}
      </div>
    </div>
  );
}; 