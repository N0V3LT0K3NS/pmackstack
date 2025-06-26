import React, { useState, useEffect } from 'react';
import { dataEntryApi } from '../../lib/dataEntry';
import type { RecentEntry, WeeklyEntryData } from '../../lib/dataEntry';
import { useStores } from '../../hooks/useStores';

interface EditModalProps {
  entry: RecentEntry;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: WeeklyEntryData) => Promise<void>;
}

const EditModal: React.FC<EditModalProps> = ({ entry, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<WeeklyEntryData>({
    storeCode: entry.store_code,
    totalSales: entry.total_sales,
    variableHours: entry.variable_hours,
    numTransactions: entry.num_transactions,
    averageWage: entry.average_wage,
    notes: entry.notes || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave(entry.id, formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update entry');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof WeeklyEntryData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          Edit Entry - {entry.store_name} (Week {entry.week_number}, {entry.fiscal_year})
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Sales
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.totalSales}
              onChange={(e) => handleChange('totalSales', parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Variable Hours
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.variableHours}
              onChange={(e) => handleChange('variableHours', parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Transactions
            </label>
            <input
              type="number"
              value={formData.numTransactions}
              onChange={(e) => handleChange('numTransactions', parseInt(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Average Wage
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.averageWage}
              onChange={(e) => handleChange('averageWage', parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface RecentEntriesTableProps {
  onRefresh?: () => void;
}

const RecentEntriesTable: React.FC<RecentEntriesTableProps> = ({ onRefresh }) => {
  const [entries, setEntries] = useState<RecentEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<RecentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<RecentEntry | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  
  // Filters
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'week_number' | 'total_sales'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [limit, setLimit] = useState(25);

  const storesQuery = useStores();
  const stores = storesQuery.data?.stores || [];

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dataEntryApi.getRecentEntries(limit);
      setEntries(result.entries);
      setTotalCount(result.totalCount);
    } catch (err: any) {
      setError(err.message || 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [limit]);

  useEffect(() => {
    let filtered = [...entries];

    // Store filter
    if (storeFilter !== 'all') {
      filtered = filtered.filter(entry => entry.store_code === storeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortBy) {
        case 'created_at':
          aVal = new Date(a.created_at);
          bVal = new Date(b.created_at);
          break;
        case 'week_number':
          aVal = `${a.fiscal_year}-${String(a.week_number).padStart(2, '0')}`;
          bVal = `${b.fiscal_year}-${String(b.week_number).padStart(2, '0')}`;
          break;
        case 'total_sales':
          aVal = a.total_sales;
          bVal = b.total_sales;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredEntries(filtered);
  }, [entries, storeFilter, sortBy, sortOrder]);

  const handleEdit = (entry: RecentEntry) => {
    setEditingEntry(entry);
  };

  const handleSave = async (id: number, data: WeeklyEntryData) => {
    await dataEntryApi.updateWeeklyEntry(id, data);
    await fetchEntries();
    onRefresh?.();
  };

  const handleDelete = async (entry: RecentEntry) => {
    if (!confirm(`Are you sure you want to delete the entry for ${entry.store_name} - Week ${entry.week_number}, ${entry.fiscal_year}?`)) {
      return;
    }

    try {
      await dataEntryApi.deleteWeeklyEntry(entry.id);
      await fetchEntries();
      onRefresh?.();
    } catch (err: any) {
      alert(err.message || 'Failed to delete entry');
    }
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) return '⇅';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading entries...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchEntries}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Store
          </label>
          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Stores</option>
                         {stores.map((store: any) => (
               <option key={store.storeCode} value={store.storeCode}>
                 {store.storeName}
               </option>
             ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Show
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={10}>10 entries</option>
            <option value={25}>25 entries</option>
            <option value={50}>50 entries</option>
            <option value={100}>100 entries</option>
            <option value={250}>250 entries</option>
            <option value={500}>500 entries</option>
            <option value={1000}>1000 entries</option>
            <option value={2000}>All entries</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={fetchEntries}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredEntries.length} of {entries.length} entries
        {totalCount > entries.length && (
          <span className="text-orange-600 font-medium">
            {' '}(Total in database: {totalCount.toLocaleString()})
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Store
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('week_number')}
              >
                Week {getSortIcon('week_number')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('total_sales')}
              >
                Sales {getSortIcon('total_sales')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transactions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Wage
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('created_at')}
              >
                Created {getSortIcon('created_at')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{entry.store_name}</div>
                  <div className="text-sm text-gray-500">{entry.store_code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Week {entry.week_number}, {entry.fiscal_year}
                </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   {formatCurrency(typeof entry.total_sales === 'number' ? entry.total_sales : parseFloat(entry.total_sales) || 0)}
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   {(typeof entry.variable_hours === 'number' ? entry.variable_hours : parseFloat(entry.variable_hours) || 0).toFixed(1)}
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   {(typeof entry.num_transactions === 'number' ? entry.num_transactions : parseInt(entry.num_transactions) || 0).toLocaleString()}
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   {formatCurrency(typeof entry.average_wage === 'number' ? entry.average_wage : parseFloat(entry.average_wage) || 0)}
                 </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{formatDate(entry.created_at)}</div>
                  {entry.created_by_email && (
                    <div className="text-xs">{entry.created_by_email}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(entry)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No entries found matching your filters.
        </div>
      )}

      {/* Edit Modal */}
      {editingEntry && (
        <EditModal
          entry={editingEntry}
          isOpen={true}
          onClose={() => setEditingEntry(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default RecentEntriesTable; 