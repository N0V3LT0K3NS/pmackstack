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
    // Temporarily store a dummy token in localStorage to force the interceptor to use it
    // This ensures the Authorization header is included even after interceptors run
    localStorage.setItem(TOKEN_KEY, 'dummy_token_for_login');
    
    try {
      const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', {
        email,
        password
      });
    
    if (response.data.success) {
      const { token } = response.data.data;
      // Replace the dummy token with the real token
      localStorage.setItem(TOKEN_KEY, token);
      // Set token in axios default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return response.data.data;
    }
    
    // If we got here without success, remove the dummy token
    localStorage.removeItem(TOKEN_KEY);
    throw new Error('Login failed');
    } catch (error) {
      // Always clean up dummy token if there's an error
      localStorage.removeItem(TOKEN_KEY);
      throw error;
    }
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