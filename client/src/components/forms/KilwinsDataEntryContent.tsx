import React, { useState } from 'react';
import { WeeklyDataForm } from './WeeklyDataForm';
import CSVImportForm from './CSVImportForm';
import RecentEntriesTable from './RecentEntriesTable';
import { useAuth } from '@/contexts/AuthContext';

export function KilwinsDataEntryContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'manual' | 'import' | 'recent'>('manual');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  // If read-only, default to recent tab
  React.useEffect(() => {
    if (isReadOnly) {
      setActiveTab('recent');
    }
  }, [isReadOnly]);

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

  const tabs = isReadOnly 
    ? [{ id: 'recent', label: 'Recent Entries', icon: '🕒' }] as const
    : [
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

      {/* Header - only show for write users */}
      {!isReadOnly && (
        <div className="space-y-2">
          <p className="text-gray-600">
            Manage weekly sales, labor, and operational data for Kilwins locations
          </p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
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
        {activeTab === 'manual' && !isReadOnly && (
          <WeeklyDataForm 
            onSuccess={handleFormSuccess}
            onError={handleFormError}
          />
        )}

        {activeTab === 'import' && !isReadOnly && (
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
} 