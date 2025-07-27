import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { Box, CircularProgress } from '@mui/material';

const AuthContext = createContext(null);
const API_URL = process.env.REACT_APP_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Attach auth token to every request
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => axios.interceptors.request.eject(interceptor);
  }, []);

  // Load user profile from token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      if (!API_URL) {
        setError('API URL is not configured');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/api/auth/me`);
      setUser(response.data);
      setError(null);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      }

      setError(
        error.response?.data?.message || 'Failed to fetch user profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role = 'student') => {
    try {
      setError(null);

      if (!API_URL) {
        setError('API URL is not configured');
        return { success: false, error: 'API URL is not configured' };
      }

      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
        role,
      });

      const { token, user } = response.data;
      if (!token || !user) {
        throw new Error('Invalid response format from server');
      }

      localStorage.setItem('token', token);
      setUser(user);
      return { success: true, user };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const isAuthenticated = () => !!user;

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        setUser,
        logout,
        getAuthHeader,
        error,
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
