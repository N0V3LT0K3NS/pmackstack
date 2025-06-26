import api from './api';

export interface WeeklyEntryData {
  storeCode: string;
  fiscalYear?: number;
  weekNumber?: number;
  weekEnding?: string;
  totalSales: number;
  variableHours: number;
  numTransactions: number;
  averageWage: number;
  totalFixedCost?: number;
  notes?: string;
}

export interface CSVImportResult {
  successful: number;
  failed: number;
  errors: string[];
}

export interface RecentEntry {
  id: number;
  store_code: string;
  store_name: string;
  fiscal_year: number;
  week_number: number;
  total_sales: number;
  variable_hours: number;
  num_transactions: number;
  average_wage: number;
  notes?: string;
  created_at: string;
  created_by_email?: string;
}

export const dataEntryApi = {
  async submitWeeklyEntry(data: WeeklyEntryData) {
    const response = await api.post('/data-entry/weekly', data);
    return response.data;
  },

  async importCSV(data: any[]) {
    const response = await api.post('/data-entry/import-csv', { data });
    return response.data;
  },

  async downloadCSVTemplate() {
    const response = await api.get('/data-entry/csv-template', {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'weekly_data_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async getRecentEntries(limit: number = 10): Promise<{entries: RecentEntry[], totalCount: number}> {
    const response = await api.get(`/data-entry/recent?limit=${limit}`);
    if (!response.data.success) {
      throw new Error('Failed to get recent entries');
    }
    return {
      entries: response.data.data,
      totalCount: response.data.meta?.totalCount || response.data.data.length
    };
  },

  async getLastWeekData(storeCode: string) {
    const response = await api.get(`/data-entry/last-week/${storeCode}`);
    
    if (!response.data.success) {
      throw new Error('Failed to get last week data');
    }
    return response.data.data;
  },

  async updateWeeklyEntry(id: number, data: WeeklyEntryData) {
    const response = await api.put(`/data-entry/weekly/${id}`, data);
    if (!response.data.success) {
      throw new Error('Failed to update entry');
    }
    return response.data.data;
  },

  async deleteWeeklyEntry(id: number) {
    const response = await api.delete(`/data-entry/weekly/${id}`);
    if (!response.data.success) {
      throw new Error('Failed to delete entry');
    }
    return response.data;
  }
}; 