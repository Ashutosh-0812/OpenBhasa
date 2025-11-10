import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  Divider,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Email, ArrowBack, MarkEmailRead, Send } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth() as any;
  const { forgotPassword, isLoading, error, clearError } = auth;

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
    if (error) clearError?.();
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;
    try {
      const res = await forgotPassword(email.trim().toLowerCase());
      if (res?.success) {
        setEmailSent(true);
      }
    } catch (err) {
      // error handled by hook
    }
  };

  const handleResendLink = async () => {
    if (!validateEmail()) return;
    try {
      await forgotPassword(email.trim().toLowerCase());
      clearError?.();
    } catch (err) {
      // error handled by hook
    }
  };

  // ✅ Success state
  if (emailSent) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#F8F9FA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: '1px solid #E0E0E0',
              p: 3,
              textAlign: 'center',
              maxWidth: 380,
              mx: 'auto',
              position: 'relative',
            }}
          >
            <IconButton
              onClick={() => navigate('/auth/login')}
              sx={{
                position: 'absolute',
                left: 16,
                top: 16,
                bgcolor: 'rgba(255,255,255,0.9)',
                boxShadow: 1,
              }}
            >
              <ArrowBack />
            </IconButton>

            <MarkEmailRead sx={{ fontSize: 48, color: '#4CAF50', mb: 2, mt: 1 }} />

            <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 1 }}>
              Reset Link Sent!
            </Typography>

            <Typography sx={{ fontSize: 13, color: '#666', mb: 2, lineHeight: 1.4 }}>
              We&apos;ve sent a password reset link to
            </Typography>

            <Paper
              elevation={0}
              sx={{
                bgcolor: '#E3F2FD',
                borderRadius: 1,
                mb: 3,
                px: 2,
                py: 1.2,
                wordBreak: 'break-word',
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1976D2' }}>
                {email}
              </Typography>
            </Paper>

            <Typography sx={{ fontSize: 12, color: '#666', mb: 3, lineHeight: 1.4 }}>
              Please check your email and click the link to reset your password. Don&apos;t see
              the email? Check your spam folder or resend.
            </Typography>

            <Button
              variant="outlined"
              onClick={handleResendLink}
              disabled={isLoading}
              sx={{
                borderRadius: '8px',
                py: 1.2,
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'none',
                mb: 1.5,
                width: '100%',
              }}
            >
              {isLoading ? 'Sending...' : 'Resend Link'}
            </Button>

            <Button
              variant="contained"
              onClick={() => navigate('/auth/login')}
              sx={{
                borderRadius: '8px',
                py: 1.2,
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'none',
                width: '100%',
              }}
            >
              Back to Login
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  // ✅ Default (enter email) state
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F8F9FA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ maxWidth: 375, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3, position: 'relative' }}>
            <IconButton
              onClick={() => navigate('/auth/login')}
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bgcolor: 'rgba(255,255,255,0.9)',
                boxShadow: 1,
              }}
            >
              <ArrowBack />
            </IconButton>

            <Email sx={{ fontSize: 40, color: '#2196F3', mb: 1, mt: 2 }} />

            <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#000', mb: 0.5 }}>
              🔐 Reset Password
            </Typography>

            <Typography sx={{ fontSize: 14, color: '#666', lineHeight: 1.4 }}>
              Enter your email address and we&apos;ll send you a secure reset link
            </Typography>
          </Box>

          {/* Form */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: '12px',
              border: '1px solid #E0E0E0',
              p: 3,
              bgcolor: '#fff',
            }}
          >
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSendResetLink} noValidate>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                type="email"
                value={email}
                onChange={handleEmailChange}
                error={!!emailError}
                helperText={emailError || "We'll send the reset link to this email"}
                autoComplete="email"
                autoFocus
                disabled={isLoading}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ fontSize: 18, color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <Send />}
                sx={{
                  borderRadius: '12px',
                  py: 1.5,
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: 'none',
                  mb: 2,
                }}
              >
                {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </Button>

              <Divider sx={{ my: 2 }}>
                <Typography sx={{ fontSize: 12, color: '#666' }}>or</Typography>
              </Divider>

              <Button
                fullWidth
                variant="outlined"
                component={Link}
                to="/auth/login"
                startIcon={<ArrowBack />}
                sx={{
                  borderRadius: '8px',
                  py: 1.5,
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Back to Login
              </Button>
            </form>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;
