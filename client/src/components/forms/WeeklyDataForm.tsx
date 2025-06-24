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
  const [formData, setFormData] = useState<WeeklyEntryData>({
    storeCode: '',
    fiscalYear: new Date().getFullYear(),
    weekNumber: 1,
    totalSales: 0,
    variableHours: 0,
    numTransactions: 0,
    averageWage: 0,
    notes: ''
  });

  useEffect(() => {
    loadStores();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dataEntryApi.submitWeeklyEntry(formData);
      
      // Reset form
      setFormData({
        storeCode: formData.storeCode, // Keep store selection
        fiscalYear: new Date().getFullYear(),
        weekNumber: 1,
        totalSales: 0,
        variableHours: 0,
        numTransactions: 0,
        averageWage: 0,
        notes: ''
      });
      
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
              Fiscal Year
            </label>
            <input
              type="number"
              min="2020"
              max="2030"
              value={formData.fiscalYear}
              onChange={(e) => handleInputChange('fiscalYear', parseInt(e.target.value))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Week Number
            </label>
            <input
              type="number"
              min="1"
              max="53"
              value={formData.weekNumber}
              onChange={(e) => handleInputChange('weekNumber', parseInt(e.target.value))}
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
              value={formData.totalSales}
              onChange={(e) => handleInputChange('totalSales', parseFloat(e.target.value) || 0)}
              required
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
              value={formData.variableHours}
              onChange={(e) => handleInputChange('variableHours', parseFloat(e.target.value) || 0)}
              required
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
              value={formData.numTransactions}
              onChange={(e) => handleInputChange('numTransactions', parseInt(e.target.value) || 0)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Average Wage ($/hour)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.averageWage}
              onChange={(e) => handleInputChange('averageWage', parseFloat(e.target.value) || 0)}
              required
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
            onClick={() => setFormData({
              storeCode: '',
              fiscalYear: new Date().getFullYear(),
              weekNumber: 1,
              totalSales: 0,
              variableHours: 0,
              numTransactions: 0,
              averageWage: 0,
              notes: ''
            })}
          >
            Clear
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Entry'}
          </Button>
        </div>
      </form>
    </Card>
  );
}; 