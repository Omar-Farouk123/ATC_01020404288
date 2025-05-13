import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and token is not expired
    const token = localStorage.getItem('token');
    const userDetails = JSON.parse(localStorage.getItem('user'));
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    const isTokenExpired = tokenExpiry && new Date().getTime() > parseInt(tokenExpiry);
    
    if (token && userDetails && !isTokenExpired) {
      setUser(userDetails);
    } else {
      // Clear expired session
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, role } = response.data;
      
      // Set token expiry to 24 hours from now
      const tokenExpiry = new Date().getTime() + (24 * 60 * 60 * 1000);
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('tokenExpiry', tokenExpiry.toString());
      
      // Get user details
      const userResponse = await userAPI.getProfile();
      const userData = { ...userResponse.data, role };
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, role } = response.data;
      
      // Set token expiry to 24 hours from now
      const tokenExpiry = new Date().getTime() + (24 * 60 * 60 * 1000);
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('tokenExpiry', tokenExpiry.toString());
      
      // Get user details
      const userResponse = await userAPI.getProfile();
      const userDetails = { ...userResponse.data, role };
      localStorage.setItem('user', JSON.stringify(userDetails));
      
      setUser(userDetails);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated,
      isAdmin
    }}>
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