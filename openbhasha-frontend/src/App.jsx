import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Box, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

// Theme
import theme from "./theme";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import NavigationLayout from "./components/NavigationLayout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Dashboard Pages
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ParticipantDashboard from "./pages/ParticipantDashboard";
import ReviewerDashboard from "./pages/ReviewerDashboard";
import TaskRecording from "./pages/TaskRecording";

// Redux
import {
  verifyToken,
  selectIsAuthenticated,
  selectAuthLoading,
} from "./app/slices/authSlice";

// Placeholder components for testing without backend
const ParticipantTasks = () => (
  <div style={{ padding: "20px", textAlign: "center" }}>
    <h1>Participant Tasks</h1>
    <p>
      Welcome! Here you can view and complete your assigned audio recording
      tasks.
    </p>
  </div>
);

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const [initialLoadComplete, setInitialLoadComplete] = React.useState(false);

  // Verify token on app startup
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !isAuthenticated && !initialLoadComplete) {
      dispatch(verifyToken()).finally(() => {
        setInitialLoadComplete(true);
      });
    } else {
      setInitialLoadComplete(true);
    }
  }, [dispatch, isAuthenticated, initialLoadComplete]);

  // Show loading screen during initial authentication check
  if (!initialLoadComplete) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          sx={{ backgroundColor: "background.default" }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: "primary.main", mb: 3 }}
          >
            OpenBhasha
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                border: "3px solid #CFE5D3",
                borderTop: "3px solid #2E4431",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <Typography variant="body1" color="text.secondary">
              Loading...
            </Typography>
          </Box>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Temporarily unprotected routes for development (no backend yet) */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
              // </ProtectedRoute>
            }
          />

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
              // </ProtectedRoute>
            }
          />
          <Route
            path="/participant/dashboard"
            element={
              <ProtectedRoute allowedRoles={["participant"]}>
              <ParticipantDashboard />
              // </ProtectedRoute>
            }
          />

          <Route
            path="/reviewer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["reviewer"]}>
              <ReviewerDashboard />
              // </ProtectedRoute>
            }
          />

          <Route
            path="/participant/tasks"
            element={
              <ProtectedRoute allowedRoles={["participant"]}>
              <ParticipantTasks />
              // </ProtectedRoute>
            }
          />

          {/* Task Recording Routes */}
          <Route
            path="/student/tasks/:taskId/record"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
              <TaskRecording />
              // </ProtectedRoute>
            }
          />

          <Route
            path="/participant/tasks/:taskId/record"
            element={
              <ProtectedRoute allowedRoles={["participant"]}>
              <TaskRecording />
              // </ProtectedRoute>
            }
          />

          <Route
            path="/admin/tasks/:taskId/record"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
              <TaskRecording />
              // </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
