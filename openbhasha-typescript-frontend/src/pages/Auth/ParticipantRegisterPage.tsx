import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Person,
  School,
  Email,
  Phone,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/apiClient';

interface InviteData {
  _id: string;
  studentName: string;
  studentCollege: string;
  participantData: {
    name: string;
    email: string;
    phone: string;
    institute: string;
    age: number;
    gender: string;
    native: string;
    language: string[];
    dialects: string[];
    accent: string[];
  };
  expiresAt: string;
  status: string;
}

interface PasswordErrors {
  password?: string;
  confirmPassword?: string;
}

const ParticipantRegisterPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { login, setUser } = useAuth();

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAlreadyAccepted, setIsAlreadyAccepted] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});

  useEffect(() => {
    const fetchInvite = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.get<{ invite: InviteData }>(`/participant-invites/${token}`);
        
        // Check if invitation is already accepted
        if (response.invite.status === 'accepted') {
          console.log('🔄 Invitation already accepted, showing login form');
          // Set flags to show login form for this specific participant
          setInvite(response.invite);
          setIsAlreadyAccepted(true);
          setError(null);
          setLoading(false);
          return;
        }
        
        setInvite(response.invite);
        setError(null);
      } catch (err: any) {
        console.log('❌ Frontend: Error fetching invite:', err);
        console.log('❌ Response status:', err?.response?.status);
        console.log('❌ Response data:', err?.response?.data);
        
        // Check if this is the "already accepted" error message
        const errorMessage = err?.response?.data?.message || '';
        if (errorMessage.includes('already been accepted') || errorMessage.includes('This invitation has already been accepted')) {
          console.log('🔄 Invitation already accepted, keeping user on this page');
          // Show message that they should use this link to login (since general login is blocked)
          setError('This invitation has already been accepted. Please enter your password below to login to your participant account.');
          setLoading(false);
          return;
        }
        
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Invalid or expired invitation link';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [token]);

  const validatePasswords = () => {
    const errors: PasswordErrors = {};

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    } else if (!/(?=.*[A-Z])/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*[a-z])/.test(password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain at least one number';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setError('Password is required');
      return;
    }

    if (!invite || !token) return;

    setLoggingIn(true);
    setError(null);

    try {
      // Use participant-specific login endpoint instead of general login
      const response = await fetch(`/api/participant-invites/${token}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Participant login successful, updating auth context');
        // Update AuthContext with user data from login response
        setUser(data.user);
        
        console.log('🚀 Navigating to participant dashboard');
        navigate('/participant/dashboard');
      } else {
        setError(data.message || 'Login failed. Please check your password.');
      }
    } catch (err: any) {
      console.error('❌ Participant login error:', err);
      const msg = err?.message || 'Login failed';
      setError(msg);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Invalid invitation link');
      return;
    }
    if (!validatePasswords()) return;

    setRegistering(true);
    setError(null);

    try {
      const response = await apiClient.post<{ user?: { email?: string } }>(
        `/participant-invites/${token}/accept`,
        { password }
      );

      // if API returns user, log them in
      if (response?.user?.email) {
        const loginResult = await login({ email: response.user.email, password });
        if (loginResult.success) {
          // Navigation to participant dashboard after successful login
          navigate('/participant/dashboard');
        } else {
          navigate('/auth/login');
        }
      } else {
        // fallback: just send them to login
        navigate('/auth/login');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed';
      setError(msg);
    } finally {
      setRegistering(false);
    }
  };

  // ============ LOADING STATE ============
  if (loading) {
    return (
      <Container
        maxWidth="sm"
        sx={{ px: { xs: 2, sm: 3 } }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // ============ ERROR STATE (no invite) ============
  if (error && !invite) {
    // Check if this is the "already accepted" case
    const isAlreadyAcceptedError = error.includes('already been accepted');
    
    return (
      <Container
        maxWidth="sm"
        sx={{ px: { xs: 2, sm: 3 } }}
      >
        <Box sx={{ mt: { xs: 4, sm: 8 } }}>
          <Paper sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
            <Alert severity={isAlreadyAcceptedError ? "info" : "error"} sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Typography variant="h6" gutterBottom>
              {isAlreadyAcceptedError ? 'Invitation Already Used' : 'Invalid Invitation Link'}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {isAlreadyAcceptedError 
                ? 'This invitation has already been accepted and an account has been created.'
                : 'This invitation link is either invalid or has expired. Please contact the student who sent you this link for a new invitation.'
              }
            </Typography>
            
            {isAlreadyAcceptedError ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Please use this invitation link to access your participant account. 
                  The general login page is not available for participants.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => window.location.reload()}
                  fullWidth
                >
                  Reload Page to Login
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                onClick={() => navigate('/')}
                sx={{ mt: 2 }}
                fullWidth
              >
                Go to Home
              </Button>
            )}
          </Paper>
        </Box>
      </Container>
    );
  }

  // ============ MAIN PAGE ============
  return (
    <Container
      maxWidth="md"
      sx={{ px: { xs: 2, sm: 3 } }}
    >
      <Box sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 3, sm: 4 } }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          textAlign="center"
          sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
        >
          {isAlreadyAccepted ? 'Welcome Back!' : 'Complete Your Registration'}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          paragraph
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          {isAlreadyAccepted 
            ? 'This invitation has already been accepted. Please enter your password to login.'
            : 'You&apos;ve been invited to join the OpenBhasha platform as a participant'
          }
        </Typography>

        {/* Invitation Details */}
        <Card sx={{ mb: { xs: 2, sm: 4 }, bgcolor: 'primary.50' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h6"
              gutterBottom
              color="primary"
              sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
            >
              Invitation Details
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Invited by
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {invite?.studentName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {invite?.studentCollege}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Expires on
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {invite?.expiresAt &&
                    new Date(invite.expiresAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Pre-filled Information */}
        <Paper sx={{ p: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 } }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
          >
            Your Information
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            The following information has been provided by your inviter:
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Full Name"
              value={invite?.participantData.name || ''}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Email"
              value={invite?.participantData.email || ''}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Phone"
              value={invite?.participantData.phone || ''}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Institute"
              value={invite?.participantData.institute || ''}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <School />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {invite?.participantData.language?.length ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Languages
              </Typography>
              <Typography variant="body1">
                {invite.participantData.language.join(', ')}
              </Typography>
            </Box>
          ) : null}
        </Paper>

        {/* Password Setup */}
        <Paper sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
          >
            {isAlreadyAccepted ? 'Login to Your Account' : 'Set Your Password'}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {isAlreadyAccepted 
              ? `Enter your password for ${invite?.participantData.email}. This is the only way to access your participant account.`
              : 'Create a secure password to complete your registration. You will need to use this invitation link to login in the future.'
            }
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={isAlreadyAccepted ? handleLogin : handleSubmit}>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!passwordErrors.password}
                helperText={
                  passwordErrors.password || 
                  (isAlreadyAccepted ? 'Enter your password' : 'Must contain uppercase, lowercase, and number')
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {!isAlreadyAccepted && (
                <TextField
                  fullWidth
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!!passwordErrors.confirmPassword}
                helperText={passwordErrors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword((prev) => !prev)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                />
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isAlreadyAccepted ? loggingIn : registering}
                sx={{ mt: 2, py: 1.5 }}
              >
                {isAlreadyAccepted ? (
                  loggingIn ? (
                    <>
                      <CircularProgress
                        size={20}
                        sx={{ mr: 1, color: 'white' }}
                      />
                      Logging In...
                    </>
                  ) : (
                    'Login to Dashboard'
                  )
                ) : (
                  registering ? (
                    <>
                      <CircularProgress
                        size={20}
                        sx={{ mr: 1, color: 'white' }}
                      />
                      Creating Account...
                    </>
                  ) : (
                    'Complete Registration'
                  )
                )}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export { ParticipantRegisterPage };
