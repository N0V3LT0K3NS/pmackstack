import axios from 'axios';
import type { 
  DashboardOverviewResponse,
  StoreListResponse,
  ApiResponse
} from '@shared/types/api';
import type { DashboardFilters } from '@shared/types/models';

// Use environment variable for API URL, fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// Debug logging
console.log('🔧 API Configuration:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL,
  MODE: import.meta.env.MODE,
  VITE_ENV: import.meta.env.VITE_ENV,
  allEnvVars: import.meta.env
});

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Debug interceptor
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });
    
    // Add auth token to all requests except login
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      response: error.response?.data
    });
    
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Dashboard endpoints
export const dashboardApi = {
  getOverview: async (filters?: DashboardFilters): Promise<DashboardOverviewResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.stores?.length) params.append('stores', filters.stores.join(','));
    if (filters?.metrics?.length) params.append('metrics', filters.metrics.join(','));
    if (filters?.groupBy) params.append('groupBy', filters.groupBy);
    if (filters?.comparison) params.append('comparison', filters.comparison);
    
    const response = await api.get<ApiResponse<DashboardOverviewResponse>>(
      `/dashboard/overview?${params.toString()}`
    );
    return response.data.data!;
  },

  exportCSV: async (filters?: DashboardFilters & { format?: 'summary' | 'detailed' }) => {
    const params = new URLSearchParams();
    
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.stores?.length) params.append('stores', filters.stores.join(','));
    if (filters?.format) params.append('format', filters.format);
    
    const response = await api.get(`/dashboard/export-csv?${params.toString()}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Extract filename from response headers or use default
    const contentDisposition = response.headers['content-disposition'];
    const filename = contentDisposition 
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : 'dashboard_export.csv';
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

// Store endpoints
export const storeApi = {
  getStores: async (brand?: string): Promise<StoreListResponse> => {
    const params = new URLSearchParams();
    if (brand) params.append('brand', brand);
    const response = await api.get<ApiResponse<StoreListResponse>>(`/stores${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data.data!;
  },
  
  getStoreMetrics: async (storeCode: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/stores/${storeCode}/metrics?${params.toString()}`);
    return response.data;
  },
};

// Renoja endpoints
export const renojaApi = {
  getDashboard: async (filters?: { store?: string; daysFrom?: number; daysTo?: number }) => {
    const params = new URLSearchParams();
    if (filters?.store && filters.store !== 'all') params.append('store', filters.store);
    if (filters?.daysFrom) params.append('daysFrom', filters.daysFrom.toString());
    if (filters?.daysTo) params.append('daysTo', filters.daysTo.toString());
    
    const response = await api.get<ApiResponse<any>>(`/renoja/dashboard?${params.toString()}`);
    return response.data.data!;
  },

  getRecentEntries: async (limit?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const response = await api.get<ApiResponse<any>>(`/renoja/recent?${params.toString()}`);
    return response.data.data!;
  },

  getLastWeekData: async (storeCode: string) => {
    const response = await api.get<ApiResponse<any>>(`/renoja/last-week/${storeCode}`);
    return response.data.data!;
  },

  submitWeeklyEntry: async (data: any) => {
    const response = await api.post<ApiResponse<any>>('/renoja/weekly', data);
    return response.data.data!;
  }
};

export default api; 