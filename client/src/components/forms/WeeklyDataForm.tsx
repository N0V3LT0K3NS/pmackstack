import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { dataEntryApi } from '../../lib/dataEntry';
import type { WeeklyEntryData } from '../../lib/dataEntry';
import { storeApi } from '../../lib/api';

import type { Store } from '@shared/types/models';

interface WeeklyDataFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const WeeklyDataForm: React.FC<WeeklyDataFormProps> = ({ onSuccess, onError }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLastWeek, setLoadingLastWeek] = useState(false);
  const [formData, setFormData] = useState<WeeklyEntryData>({
    storeCode: '',
    weekEnding: new Date().toISOString().split('T')[0],
    totalSales: 0,
    variableHours: 0,
    numTransactions: 0,
    averageWage: 0,
    totalFixedCost: 0,
    notes: ''
  });

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    if (formData.storeCode) {
      loadLastWeekData();
    }
  }, [formData.storeCode]);

  const loadStores = async () => {
    try {
      const storeData = await storeApi.getStores();
      setStores(storeData.stores);
      
      // Set default store if user has limited access
      if (storeData.stores.length === 1) {
        setFormData(prev => ({ ...prev, storeCode: storeData.stores[0].storeCode }));
      }
    } catch (error) {
      console.error('Failed to load stores:', error);
    }
  };

  const loadLastWeekData = async () => {
    if (!formData.storeCode) return;
    
    setLoadingLastWeek(true);
    try {
      const lastWeekData = await dataEntryApi.getLastWeekData(formData.storeCode);
      
      if (lastWeekData) {
        setFormData(prev => ({
          ...prev,
          weekEnding: lastWeekData.nextWeekEnding,
          averageWage: lastWeekData.lastWeekData.averageWage,
          totalFixedCost: lastWeekData.lastWeekData.totalFixedCost
        }));
      }
    } catch (error) {
      console.error('Failed to load last week data:', error);
      // If no last week data, just keep current values
    } finally {
      setLoadingLastWeek(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dataEntryApi.submitWeeklyEntry(formData);
      
      // Reset form but keep store selection
      const currentStore = formData.storeCode;
      setFormData({
        storeCode: currentStore,
        weekEnding: new Date().toISOString().split('T')[0],
        totalSales: 0,
        variableHours: 0,
        numTransactions: 0,
        averageWage: formData.averageWage, // Keep average wage
        totalFixedCost: formData.totalFixedCost, // Keep fixed cost
        notes: ''
      });
      
      // Reload last week data to get the new next week
      if (currentStore) {
        loadLastWeekData();
      }
      
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to submit entry';
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof WeeklyEntryData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Weekly Data Entry</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store
            </label>
            <select
              value={formData.storeCode}
              onChange={(e) => handleInputChange('storeCode', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a store</option>
              {stores.map(store => (
                <option key={store.storeCode} value={store.storeCode}>
                  {store.storeName} ({store.storeCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Week Ending Date
              {loadingLastWeek && <span className="text-gray-500 text-xs ml-2">(Loading...)</span>}
            </label>
            <input
              type="date"
              value={formData.weekEnding || ''}
              onChange={(e) => handleInputChange('weekEnding', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Sales ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.totalSales || ''}
              onChange={(e) => handleInputChange('totalSales', parseFloat(e.target.value) || 0)}
              required
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Transactions
            </label>
            <input
              type="number"
              min="0"
              value={formData.numTransactions || ''}
              onChange={(e) => handleInputChange('numTransactions', parseInt(e.target.value) || 0)}
              required
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Variable Hours
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.variableHours || ''}
              onChange={(e) => handleInputChange('variableHours', parseFloat(e.target.value) || 0)}
              required
              placeholder="0.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Average Wage ($/hour)
              <span className="text-gray-500 text-xs ml-2">(Auto-filled from last week)</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.averageWage || ''}
              onChange={(e) => handleInputChange('averageWage', parseFloat(e.target.value) || 0)}
              required
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fixed Labor Cost ($)
              <span className="text-gray-500 text-xs ml-2">(Auto-filled from last week)</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.totalFixedCost || ''}
              onChange={(e) => handleInputChange('totalFixedCost', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional notes about this week's data..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const currentStore = formData.storeCode;
              setFormData({
                storeCode: currentStore,
                weekEnding: new Date().toISOString().split('T')[0],
                totalSales: 0,
                variableHours: 0,
                numTransactions: 0,
                averageWage: 0,
                totalFixedCost: 0,
                notes: ''
              });
              // Reload last week data
              if (currentStore) {
                loadLastWeekData();
              }
            }}
          >
            Clear
          </Button>
          <Button type="submit" disabled={loading || !formData.storeCode}>
            {loading ? 'Submitting...' : 'Submit Entry'}
          </Button>
        </div>
      </form>
    </Card>
  );
}; 