import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL - Update this to your computer's IP address when testing on physical device
// For Android emulator: use 10.0.2.2
// For iOS simulator: use localhost
// For physical device: use your computer's IP (e.g., 192.168.1.100)
const API_URL = 'http://10.0.2.2:8000'; // Android emulator
// const API_URL = 'http://localhost:8000'; // iOS simulator
// const API_URL = 'http://192.168.1.100:8000'; // Physical device (replace with your IP)

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
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
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (email, password, fullName) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },

  verifyEmail: async (email, otp) => {
    const response = await api.post('/auth/verify-email', {
      email,
      otp,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  resendOTP: async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  sendMessage: async (message) => {
    const response = await api.post('/chat', { message });
    return response.data;
  },

  getHistory: async (limit = 50) => {
    const response = await api.get(`/chat/history?limit=${limit}`);
    return response.data;
  },

  clearHistory: async () => {
    const response = await api.delete('/chat/history');
    return response.data;
  },
};

// Logs API
export const logsAPI = {
  addLog: async (logData) => {
    const response = await api.post('/logs', logData);
    return response.data;
  },

  getLogs: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/logs?${params.toString()}`);
    return response.data;
  },

  getLog: async (logId) => {
    const response = await api.get(`/logs/${logId}`);
    return response.data;
  },

  updateLog: async (logId, logData) => {
    const response = await api.put(`/logs/${logId}`, logData);
    return response.data;
  },

  deleteLog: async (logId) => {
    const response = await api.delete(`/logs/${logId}`);
    return response.data;
  },

  getInsights: async () => {
    const response = await api.get('/logs/insights');
    return response.data;
  },
};

// Cycle API
export const cycleAPI = {
  getCycles: async () => {
    const response = await api.get('/cycles');
    return response.data;
  },

  addCycle: async (cycleData) => {
    const response = await api.post('/cycles', cycleData);
    return response.data;
  },

  getPredictions: async () => {
    const response = await api.get('/cycles/predictions');
    return response.data;
  },
};

export default api;
