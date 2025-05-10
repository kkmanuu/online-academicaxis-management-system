import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { Box, CircularProgress } from '@mui/material';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setUser(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      }
      setError(error.response?.data?.message || 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role = 'student') => {
    try {
      setError(null);
      
      if (!email || !password) {
        setError('Email and password are required');
        return { success: false, error: 'Email and password are required' };
      }
      
      console.log('Attempting login with email:', email, 'and role:', role);
      
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
        role
      });

      console.log('Login response:', response.data);
      
      const { token, user } = response.data;
      
      if (token && user) {
        localStorage.setItem('token', token);
        setUser(user);
        return { success: true, user };
      } else {
        const errorMsg = 'Invalid response from server';
        setError(errorMsg);
        return {
          success: false,
          error: errorMsg
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No auth token found in localStorage');
      return {};
    }
    return { 'Authorization': `Bearer ${token}` };
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
    <AuthContext.Provider value={{ user, login, logout, getAuthHeader, error, isAuthenticated }}>
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