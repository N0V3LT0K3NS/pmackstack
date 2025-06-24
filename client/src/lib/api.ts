import axios from 'axios';
import type { 
  DashboardOverviewResponse,
  StoreListResponse,
  ApiResponse
} from '@shared/types/api';
import type { DashboardFilters } from '@shared/types/models';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
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
  (response) => response,
  (error) => {
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
  getStores: async (): Promise<StoreListResponse> => {
    const response = await api.get<ApiResponse<StoreListResponse>>('/stores');
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



export default api; 