import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole, allowedRoles }) => {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const tokenExpiry = localStorage.getItem('tokenExpiry');

  // Check if token is expired
  const isTokenExpired = tokenExpiry && new Date().getTime() > parseInt(tokenExpiry);

  // If no token, user not logged in, or token expired
  if (!token || !user || isTokenExpired) {
    // Clear any existing session data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    return <Navigate to="/login" replace />;
  }

  // Check role access
  if (allowedRoles) {
    // If user's role is not in the allowed roles list
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/events" replace />;
    }
  } else if (requiredRole) {
    // If user's role doesn't match the required role
    if (user.role !== requiredRole) {
      return <Navigate to="/events" replace />;
    }
  }

  return children;
};

export default ProtectedRoute; 