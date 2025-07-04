import api from './api';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'executive' | 'bookkeeper' | 'manager';
}

export interface AuthResponse {
  user: User;
  token: string;
  stores?: string[];
}

const TOKEN_KEY = 'auth_token';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    // Add dummy auth header for login requests to bypass server auth check
    // This is a workaround for the server requiring auth headers on login endpoint
    const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', 
      {
        email,
        password
      },
      {
        headers: { Authorization: 'Bearer dummy_token' }
      }
    );
    
    if (response.data.success) {
      const { token } = response.data.data;
      localStorage.setItem(TOKEN_KEY, token);
      // Set token in axios default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return response.data.data;
    }
    
    throw new Error('Login failed');
  },
  
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  },
  
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
  
  async getCurrentUser(): Promise<{ user: User; stores?: string[] }> {
    const response = await api.get<{ success: boolean; data: { user: User; stores?: string[] } }>('/auth/me');
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error('Failed to get current user');
  },
  
  initializeAuth() {
    const token = this.getToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
}; 