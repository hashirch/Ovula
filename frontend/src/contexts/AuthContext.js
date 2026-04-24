import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Human-friendly error message mapping
const friendlyError = (detail) => {
  const map = {
    'EMAIL_NOT_VERIFIED': 'Please verify your email before logging in.',
    'Email already registered': 'This email is already registered. Try logging in instead.',
    'Incorrect email or password': 'Wrong email or password. Please try again.',
    'User not found': 'No account found with this email.',
    'OTP has expired. Please request a new one.': 'Your code expired. Please request a new one.',
    'Invalid OTP code': 'That code is incorrect. Please check your email and try again.',
    'Not authenticated': 'Please login to continue.',
    'Email already verified': 'Your email is already verified. You can login now.',
  };
  return map[detail] || detail || 'Something went wrong. Please try again.';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up axios defaults from stored token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Global 401 interceptor — handles expired/invalid tokens
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response?.status === 401 &&
          error.config?.url !== '/auth/login' &&
          error.config?.url !== '/auth/register'
        ) {
          // Token expired or invalid — clear session
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
          toast.error('Your session has expired. Please log in again.', {
            id: 'session-expired',
            duration: 5000,
          });
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { access_token } = response.data;

      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // Get user info
      const userResponse = await axios.get('/auth/me');
      setUser(userResponse.data);

      toast.success('Welcome back! 🌸');
      return { success: true };
    } catch (error) {
      const detail = error.response?.data?.detail;

      // Special case: redirect to verify-email instead of showing error
      if (detail === 'EMAIL_NOT_VERIFIED') {
        return { success: false, needsVerification: true, email };
      }

      toast.error(friendlyError(detail));
      return { success: false };
    }
  };

  const register = async (name, email, password) => {
    try {
      await axios.post('/auth/register', { name, email, password });
      return { success: true };
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(friendlyError(detail));
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};