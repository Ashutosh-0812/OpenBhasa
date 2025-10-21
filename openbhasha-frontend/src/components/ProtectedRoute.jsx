import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectUserRole,
  selectAuthLoading,
} from "../app/slices/authSlice";
import { Box, CircularProgress, Typography } from "@mui/material";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  const loading = useSelector(selectAuthLoading);
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        sx={{ backgroundColor: "background.default" }}
      >
        <CircularProgress size={48} sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Verifying authentication...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user role is allowed to access this route
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    const dashboardRoutes = {
      admin: "/admin/dashboard",
      student: "/student/dashboard",
      participant: "/participant/tasks",
      reviewer: "/reviewer/dashboard",
    };

    const redirectTo = dashboardRoutes[userRole] || "/login";
    return <Navigate to={redirectTo} replace />;
  }

  // User is authenticated and has proper role
  return children;
};

export default ProtectedRoute;
