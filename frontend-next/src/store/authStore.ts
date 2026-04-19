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
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
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
        const detail = err.response.data.detail;
        msg = typeof detail === 'string' ? detail : JSON.stringify(detail);
      }
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  register: async (email, username, password) => {
    set({ isLoading: true, error: null });
    try {
      await client.post('/auth/register', { email, username, password });
      set({ isLoading: false });
    } catch (err: any) {
      let msg = 'Registration failed.';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        msg = typeof detail === 'string' ? detail : JSON.stringify(detail);
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
}));

export default client;
