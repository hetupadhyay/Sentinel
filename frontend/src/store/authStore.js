// frontend/src/store/authStore.js
import { create } from 'zustand';
import client from '@/api/client';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  hydrate: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) { set({ isLoading: false }); return; }
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
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  register: async (email, username, password) => {
    set({ isLoading: true, error: null });
    try {
      await client.post('/auth/register', { email, username, password });
      set({ isLoading: false });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
