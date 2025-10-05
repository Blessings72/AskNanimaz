import axios from 'axios';
import type { AuthResponse, LoginData, RegisterData, User } from '../types';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid, clear storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authApi = {
  login: async (loginData: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', loginData);
    return response.data;
  },

  register: async (registerData: RegisterData): Promise<User> => {
    const response = await api.post<User>('/auth/register', registerData);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// Utility to handle auth token
export const authStorage = {
  getToken: (): string | null => {
    return localStorage.getItem('access_token');
  },

  setToken: (token: string): void => {
    localStorage.setItem('access_token', token);
  },

  removeToken: (): void => {
    localStorage.removeItem('access_token');
  },

  getStoredUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setStoredUser: (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  removeStoredUser: (): void => {
    localStorage.removeItem('user');
  },

  clear: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
};