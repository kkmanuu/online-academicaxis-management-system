import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';


const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated()) {
    console.warn("ProtectedRoute: User not authenticated. Redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
    console.warn(`ProtectedRoute: Access denied for role: ${user?.role}`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;