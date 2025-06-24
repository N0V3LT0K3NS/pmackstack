import api from './api';

export interface WeeklyEntryData {
  storeCode: string;
  fiscalYear: number;
  weekNumber: number;
  totalSales: number;
  variableHours: number;
  numTransactions: number;
  averageWage: number;
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

  async getRecentEntries(limit: number = 10): Promise<RecentEntry[]> {
    const response = await api.get(`/data-entry/recent?limit=${limit}`);
    return response.data.data;
  }
}; 