import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_URL,
});

// Add token to requests
client.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  phone?: string;
  country?: string;
  gender?: string;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<any>;
  changePassword: (curr: string, newPw: string, conf: string) => Promise<any>;
  deleteAccount: (pw: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  hydrate: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('access_token');
    if (!token) { 
      set({ isLoading: false, isAuthenticated: false }); 
      return; 
    }
    
    set({ isLoading: true });
    try {
      const { data } = await client.get('/auth/me');
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await client.post('/auth/login', { email, password });
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      const me = await client.get('/auth/me');
      set({ user: me.data, isAuthenticated: true, isLoading: false, error: null });
    } catch (err: any) {
      let msg = 'Login failed.';
      if (err.response?.data?.detail) {
        msg = typeof err.response.data.detail === 'string' ? err.response.data.detail : JSON.stringify(err.response.data.detail);
      } else if (err.response?.data?.error?.message) {
        msg = err.response.data.error.message;
      }
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  register: async (email, username, password, fullName) => {
    set({ isLoading: true, error: null });
    try {
      await client.post('/auth/register', { email, username, password, full_name: fullName });
      set({ isLoading: false });
    } catch (err: any) {
      let msg = 'Registration failed.';
      if (err.response?.data?.detail) {
        msg = typeof err.response.data.detail === 'string' ? err.response.data.detail : JSON.stringify(err.response.data.detail);
      } else if (err.response?.data?.error?.message) {
        msg = err.response.data.error.message;
      }
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false, error: null });
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await client.put('/api/v1/profile', profileData);
      const me = await client.get('/auth/me');
      set({ user: me.data, isLoading: false });
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.detail || 'Failed to update profile.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await client.put('/api/v1/profile/password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      set({ isLoading: false });
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.detail || 'Failed to change password.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  deleteAccount: async (password) => {
    set({ isLoading: true, error: null });
    try {
      await client.delete('/api/v1/profile', { data: { password } });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.detail || 'Failed to delete account.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },
}));

export default client;
