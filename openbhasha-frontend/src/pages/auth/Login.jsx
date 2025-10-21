import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  AccountCircle,
} from "@mui/icons-material";
import {
  loginUser,
  clearError,
  selectAuth,
  selectAuthLoading,
  selectAuthError,
} from "../../app/slices/authSlice";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, role } = useSelector(selectAuth);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && role) {
      const from = location.state?.from?.pathname || getDashboardRoute(role);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, role, navigate, location.state]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const getDashboardRoute = (userRole) => {
    const dashboardRoutes = {
      admin: "/admin/dashboard",
      student: "/student/dashboard",
      participant: "/participant/tasks",
      reviewer: "/reviewer/dashboard",
    };
    return dashboardRoutes[userRole] || "/";
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rememberMe" ? checked : value,
    }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await dispatch(
        loginUser({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        })
      ).unwrap();

      // Success - will be handled by useEffect
    } catch (error) {
      // Error is handled by Redux state
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <AccountCircle
              sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your OpenBhasha account
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              margin="normal"
              autoComplete="email"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              margin="normal"
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              my={2}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="Remember me"
              />
            </Box>

            <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
              <Button
                variant="text"
                size="small"
                component={Link}
                to="/forgot-password"
                sx={{
                  textDecoration: "none",
                  color: "primary.main",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Forgot your password?
              </Button>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 2, mb: 2, py: 1.5 }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              component={Link}
              to="/register"
              sx={{ py: 1.5 }}
            >
              Create Account
            </Button>
          </Box>

          {/* Role Information */}
          <Box
            mt={4}
            p={2}
            sx={{ backgroundColor: "background.default", borderRadius: 2 }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              gutterBottom
            >
              <strong>Role Access:</strong>
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              • <strong>Admin:</strong> Complete platform management
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              • <strong>Student:</strong> Record audio & manage participants
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              • <strong>Reviewer:</strong> Review and validate recordings
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              • <strong>Participant:</strong> Register via referral link only
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
