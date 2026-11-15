import axios from 'axios';
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS, readMigratedStorage } from '../config/brand';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = readMigratedStorage(STORAGE_KEYS.token, LEGACY_STORAGE_KEYS.token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        localStorage.removeItem(STORAGE_KEYS.token);
        localStorage.removeItem(STORAGE_KEYS.user);
        localStorage.removeItem(LEGACY_STORAGE_KEYS.token);
        localStorage.removeItem(LEGACY_STORAGE_KEYS.user);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
