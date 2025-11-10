import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
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
  Divider,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Lock,
  Person,
  School,
  Email,
  Phone,
} from "@mui/icons-material";
import { participantInviteAPI } from "../../api/apiClient";
import { setCredentials } from "../../app/slices/authSlice";

const ParticipantRegister = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    fetchInvite();
  }, [token]);

  const fetchInvite = async () => {
    try {
      setLoading(true);
      const response = await participantInviteAPI.getInviteByToken(token);
      setInvite(response.data.invite);
    } catch (err) {
      setError(err.message || "Invalid or expired invitation link");
    } finally {
      setLoading(false);
    }
  };

  const validatePasswords = () => {
    const errors = {};

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    } else if (!/(?=.*[A-Z])/.test(password)) {
      errors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*[a-z])/.test(password)) {
      errors.password = "Password must contain at least one lowercase letter";
    } else if (!/(?=.*\d)/.test(password)) {
      errors.password = "Password must contain at least one number";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswords()) return;

    setRegistering(true);
    setError(null);

    try {
      const response = await participantInviteAPI.acceptInvite(token, password);

      // Set user credentials in Redux store
      dispatch(
        setCredentials({
          user: response.data.user,
          role: response.data.user.role,
          redirectTo: response.data.redirectTo,
        })
      );

      // Redirect to participant dashboard
      navigate("/participant/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !invite) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Typography variant="h6" gutterBottom>
              Invalid Invitation Link
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This invitation link is either invalid or has expired. Please
              contact the student who sent you this link for a new invitation.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/")}
              sx={{ mt: 2 }}
            >
              Go to Homepage
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Complete Your Registration
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          paragraph
        >
          You've been invited to join the OpenBhasha platform as a participant
        </Typography>

        {/* Invitation Details */}
        <Card sx={{ mb: 4, bgcolor: "primary.50" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Invitation Details
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
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
                  {new Date(invite?.expiresAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Pre-filled Information */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Your Information
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            The following information has been provided by your inviter:
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Full Name"
              value={invite?.participantData.name || ""}
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
              value={invite?.participantData.email || ""}
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
              value={invite?.participantData.phone || ""}
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
              value={invite?.participantData.institute || ""}
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

          {/* Languages */}
          {invite?.participantData.language?.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Languages
              </Typography>
              <Typography variant="body1">
                {invite.participantData.language.join(", ")}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Password Setup */}
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Set Your Password
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Create a secure password to complete your registration
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "grid", gap: 2 }}>
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!passwordErrors.password}
                helperText={
                  passwordErrors.password ||
                  "Must contain uppercase, lowercase, and number"
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
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                type={showConfirmPassword ? "text" : "password"}
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
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={registering}
                sx={{ mt: 2, py: 1.5 }}
              >
                {registering ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Creating Account...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ParticipantRegister;
