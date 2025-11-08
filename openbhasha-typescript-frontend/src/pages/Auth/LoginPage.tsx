import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  AccountCircle,
} from '@mui/icons-material';
import { User, UserRole } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';

// --- Mock AuthLayout (for self-contained demo) ---
// This component is mocked to resolve the import error.
const AuthLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ children }) => {
  // This is a minimal layout wrapper.
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f7f6' }}>
      {children}
    </Box>
  );
};




// --- Interface Definitions (Unified) ---

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
}

interface LoginPageProps {
  onLogin?: (user: User) => void;
}

// --- Login Page Component (Merged & Fixed) ---

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [infoMessage, setInfoMessage] = useState<string>('');

  const navigate = useNavigate();
  const location = useLocation();
  
  // Use the state from the useAuth hook for loading and errors
  const { login, isLoading, error, isAuthenticated, user } = useAuth();

  // Handle email pre-filling and message from navigation state
  useEffect(() => {
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    }
    if (location.state?.message) {
      setInfoMessage(location.state.message);
    }
    // If coming from an invitation, focus on the email field or password field
    if (location.state?.fromInvitation) {
      // Give a moment for the component to render, then focus
      setTimeout(() => {
        const emailField = document.getElementById('email');
        if (emailField) emailField.focus();
      }, 100);
    }
  }, [location.state]);

  // Redirect if already authenticated (from original logic)
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname || getDashboardRoute(user.role);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  const getDashboardRoute = (userRole: UserRole): string => {
    const dashboardRoutes = {
      admin: '/admin/dashboard',
      student: '/student/dashboard',
      participant: '/participant/dashboard',
      reviewer: '/reviewer/dashboard',
    };
    return dashboardRoutes[userRole] || '/student/dashboard';
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value,
    }));

    // Clear field error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Use the login function from the hook
      const response = await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (response.success && response.data) {
        // Call the onLogin prop for compatibility
        onLogin?.(response.data);
        
        // Navigate to the appropriate dashboard  
        const dashboardPath = getDashboardRoute(response.data.role);
        // Don't use fromPath - always go to role-specific dashboard after login
        const redirectPath = dashboardPath;
        
        console.log('✅ Login successful for user:', response.data.name, 'role:', response.data.role);
        console.log('🚀 Navigating to dashboard:', redirectPath, 'for role:', response.data.role);
        navigate(redirectPath, { replace: true });
      } else {
        console.log('❌ Login failed:', response);
      }
      // If login fails, the 'error' state from useAuth will be set
    } catch (err) {
      // The useAuth hook should catch and expose this as 'error'
      console.error('❌ Login exception:', err);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // --- Render (Using the new, enhanced styling) ---
  return (
    <AuthLayout title="Sign in">
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 2, sm: 3 },
          py: { xs: 1, sm: 2 },
          width: '100%',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: { xs: 2, sm: 3 },
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: {
              xs: '0 4px 16px rgba(0, 0, 0, 0.08)',
              sm: '0 8px 32px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          {/* Header */}
          <Box textAlign="center" mb={{ xs: 3, sm: 4 }}>
            <Box
              sx={{
                width: { xs: 64, sm: 72 },
                height: { xs: 64, sm: 72 },
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: { xs: 2, sm: 3 },
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
              }}
            >
              <AccountCircle
                sx={{
                  fontSize: { xs: 32, sm: 40 },
                  color: 'white',
                }}
              />
            </Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontSize: { xs: '1.75rem', sm: '2.125rem' },
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Sign in to your OpenBhasha account
            </Typography>
          </Box>

          {/* Info Alert (for invitation already accepted message) */}
          {infoMessage && (
            <Alert severity="info" sx={{ mb: 3 }}>
              {infoMessage}
            </Alert>
          )}

          {/* Error Alert (Using error from useAuth) */}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 2, sm: 1.5 },
                  fontSize: { xs: '16px', sm: '14px' }, // Prevents zoom on iOS
                },
              }}
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
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              margin="normal"
              autoComplete="current-password"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 2, sm: 1.5 },
                  fontSize: { xs: '16px', sm: '14px' }, // Prevents zoom on iOS
                },
              }}
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
                      size={window.innerWidth < 600 ? 'small' : 'medium'}
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
              flexDirection={{ xs: 'column', sm: 'row' }}
              gap={{ xs: 1, sm: 0 }}
              my={{ xs: 2, sm: 2 }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    color="primary"
                    size={window.innerWidth < 600 ? 'small' : 'medium'}
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  >
                    Remember me
                  </Typography>
                }
              />
              
              <Button
                variant="text"
                size="small"
                component={Link}
                to="/auth/forgot-password"
                sx={{
                  textDecoration: 'none',
                  color: 'primary.main',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  minHeight: { xs: 36, sm: 'auto' },
                  '&:hover': {
                    textDecoration: 'underline',
                    backgroundColor: 'transparent',
                  },
                }}
              >
                Forgot password?
              </Button>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              // Use isLoading from useAuth
              disabled={isLoading} 
              sx={{
                mt: { xs: 2, sm: 3 },
                mb: 2,
                py: { xs: 1.75, sm: 1.5 },
                fontSize: { xs: '1rem', sm: '1.1rem' },
                fontWeight: 600,
                borderRadius: { xs: 2, sm: 1.5 },
                background: isLoading
                  ? 'rgba(102, 126, 234, 0.6)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: isLoading
                  ? 'none'
                  : '0 6px 20px rgba(102, 126, 234, 0.4)',
                minHeight: { xs: 48, sm: 'auto' },
                '&:hover': {
                  background: isLoading
                    ? 'rgba(102, 126, 234, 0.6)'
                    : 'linear-gradient(135deg, #5a67d8 0%, #667eea 100%)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.5)',
                },
              }}
            >
              {/* Use isLoading from useAuth */}
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Divider sx={{ my: { xs: 2, sm: 3 } }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Don't have an account?
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              component={Link}
              to="/auth/register"
              sx={{
                py: { xs: 1.75, sm: 1.5 },
                fontSize: { xs: '1rem', sm: '1.1rem' },
                fontWeight: 600,
                borderRadius: { xs: 2, sm: 1.5 },
                borderColor: 'primary.main',
                color: 'primary.main',
                minHeight: { xs: 48, sm: 'auto' },
                '&:hover': {
                  borderColor: 'primary.dark',
                  backgroundColor: 'rgba(102, 126, 234, 0.04)',
                },
              }}
            >
              Create Account
            </Button>
          </Box>

          {/* Role Information */}
          <Box
            mt={{ xs: 3, sm: 4 }}
            p={{ xs: 2, sm: 3 }}
            sx={{
              background: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
              borderRadius: { xs: 2, sm: 2 },
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="subtitle2"
              color="text.primary"
              display="block"
              gutterBottom
              sx={{
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                mb: { xs: 1, sm: 1.5 },
              }}
            >
              🎯 Platform Access Levels
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                👑 <strong>Admin:</strong> Complete platform management
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                🎓 <strong>Student:</strong> Record audio & manage participants
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                📋 <strong>Reviewer:</strong> Review and validate recordings
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                🎤 <strong>Participant:</strong> Register via referral link only
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </AuthLayout>
  );
};

// --- Placeholder Components (from the new version) ---

export const ReviewQueuePage: React.FC = () => {
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6">Review Queue - Coming Soon</Typography>
    </Box>
  );
};

export const ProfilePage: React.FC<{ user: User }> = ({ user }) => {
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6">Profile Page - Coming Soon</Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Welcome, {user.name}
      </Typography>
    </Box>
  );
};