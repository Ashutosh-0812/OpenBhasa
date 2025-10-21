import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
} from "@mui/material";
import {
  Email,
  ArrowBack,
  CheckCircle,
  MarkEmailRead,
} from "@mui/icons-material";
import {
  forgotPassword,
  clearError,
  selectAuthLoading,
  selectAuthError,
} from "../../app/slices/authSlice";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (emailError) {
      setEmailError("");
    }
  };

  const handleSendResetLink = async (e) => {
    e.preventDefault();

    if (!validateEmail()) return;

    try {
      await dispatch(forgotPassword(email.trim().toLowerCase())).unwrap();
      setEmailSent(true);
    } catch (error) {
      // Error handled by Redux state
    }
  };

  const handleResendLink = async () => {
    try {
      await dispatch(forgotPassword(email.trim().toLowerCase())).unwrap();
      dispatch(clearError());
    } catch (error) {
      // Error handled by Redux state
    }
  };

  if (emailSent) {
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
            sx={{ p: 4, borderRadius: 3, textAlign: "center" }}
          >
            <MarkEmailRead
              sx={{ fontSize: 64, color: "success.main", mb: 2 }}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              Reset Link Sent!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your email and click the link to reset your password.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Don't see the email? Check your spam folder or try again.
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="outlined"
                onClick={handleResendLink}
                disabled={loading}
                sx={{ minWidth: 140 }}
              >
                {loading ? "Sending..." : "Resend Link"}
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate("/login")}
                sx={{ minWidth: 140 }}
              >
                Back to Login
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

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
            <Email sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your email address and we'll send you a reset link
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Reset Form */}
          <Box component="form" onSubmit={handleSendResetLink} noValidate>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={handleEmailChange}
              error={!!emailError}
              helperText={
                emailError ||
                "Enter the email address associated with your account"
              }
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? "Sending Reset Link..." : "Send Reset Link"}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              component={Link}
              to="/login"
              startIcon={<ArrowBack />}
              sx={{ py: 1.5 }}
            >
              Back to Login
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
