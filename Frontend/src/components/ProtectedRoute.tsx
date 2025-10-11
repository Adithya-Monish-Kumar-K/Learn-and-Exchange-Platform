import React from 'react';
import { Navigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  if (!apiClient.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
