import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Chip,
  Divider,
  Autocomplete,
  FormHelperText,
  Grid,
  Slider,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  School,
  Link as LinkIcon,
  PersonAdd,
  Cake,
  Wc,
  LocationOn,
  Language,
  RecordVoiceOver,
} from "@mui/icons-material";
import {
  registerUser,
  clearError,
  selectAuthLoading,
  selectAuthError,
} from "../../app/slices/authSlice";

// Predefined data for dropdowns
const INDIAN_LANGUAGES = [
  "Hindi",
  "English",
  "Bengali",
  "Telugu",
  "Marathi",
  "Tamil",
  "Urdu",
  "Gujarati",
  "Malayalam",
  "Kannada",
  "Odia",
  "Punjabi",
  "Assamese",
  "Maithili",
  "Sanskrit",
  "Nepali",
  "Konkani",
  "Manipuri",
  "Bodo",
  "Dogri",
  "Kashmiri",
  "Santali",
  "Sindhi",
];

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "student", // Only student role allowed
    organization: "",
    // Additional demographic fields
    age: "",
    gender: "",
    nativePlace: "",
    languages: [],
    dialects: [], // Array for multiple entries
    accents: [], // Array for multiple entries
  });

  // State for input values while typing
  const [inputValues, setInputValues] = useState({
    dialects: "",
    accents: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    // Organization required for students
    if (!formData.organization.trim()) {
      errors.organization = "Organization is required";
    }

    // Additional field validations
    if (!formData.age || formData.age < 13 || formData.age > 100) {
      errors.age = "Please enter a valid age between 13 and 100";
    }

    if (!formData.gender) {
      errors.gender = "Please select your gender";
    }

    if (!formData.nativePlace.trim()) {
      errors.nativePlace = "Native place is required";
    }

    if (formData.languages.length === 0) {
      errors.languages = "Please select at least one language you speak";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleArrayChange = (name, newValue) => {
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear field error
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle adding chips for dialects and accents
  const handleAddChip = (fieldName, value) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !formData[fieldName].includes(trimmedValue)) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: [...prev[fieldName], trimmedValue],
      }));
    }
    setInputValues((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  // Handle removing chips
  const handleRemoveChip = (fieldName, chipToRemove) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((chip) => chip !== chipToRemove),
    }));
  };

  // Handle input change for chip fields
  const handleChipInputChange = (fieldName, value) => {
    setInputValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Handle Enter key press to add chips
  const handleChipInputKeyPress = (fieldName, event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddChip(fieldName, inputValues[fieldName]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await dispatch(
        registerUser({
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          role: formData.role,
          college: formData.organization.trim(),
          // Demographic information
          age: parseInt(formData.age),
          gender: formData.gender,
          native: formData.nativePlace.trim(),
          // Language information
          language: formData.languages,
          dialects: formData.dialects,
          accent: formData.accents,
        })
      ).unwrap();

      setRegistrationSuccess(true);
    } catch (error) {
      // Error is handled by Redux state
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (registrationSuccess) {
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
            <PersonAdd sx={{ fontSize: 48, color: "success.main", mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Registration Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your student account has been created successfully. Please wait
              for admin approval to activate your account and start using the
              platform.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/login")}
              sx={{ mt: 2 }}
            >
              Go to Login
            </Button>
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
      <Container maxWidth="md">
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
            <PersonAdd sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Create Student Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join the OpenBhasha platform as a student to manage language data
              collection
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Registration Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Personal Information */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
              Personal Information
            </Typography>

            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                id="firstName"
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                id="lastName"
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

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
              id="phone"
              name="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Demographic Information */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
              Demographic Information
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  id="age"
                  name="age"
                  label="Age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  error={!!formErrors.age}
                  helperText={formErrors.age}
                  inputProps={{ min: 13, max: 100 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Cake color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth error={!!formErrors.gender}>
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Select
                    labelId="gender-label"
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    label="Gender"
                    startAdornment={
                      <InputAdornment position="start">
                        <Wc color="action" />
                      </InputAdornment>
                    }
                  >
                    {GENDER_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.gender && (
                    <FormHelperText>{formErrors.gender}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  id="nativePlace"
                  name="nativePlace"
                  label="Native Place"
                  value={formData.nativePlace}
                  onChange={handleChange}
                  error={!!formErrors.nativePlace}
                  helperText={formErrors.nativePlace}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {/* Language Information */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
              Language Information
            </Typography>

            <Autocomplete
              multiple
              id="languages"
              options={INDIAN_LANGUAGES}
              value={formData.languages}
              onChange={(event, newValue) =>
                handleArrayChange("languages", newValue)
              }
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      variant="outlined"
                      label={option}
                      {...tagProps}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Languages You Speak"
                  placeholder="Select languages..."
                  error={!!formErrors.languages}
                  helperText={
                    formErrors.languages ||
                    "Select all languages you can speak fluently"
                  }
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <Language color="action" />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              sx={{ mb: 2 }}
            />

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                id="dialects"
                label="Dialects (Optional)"
                value={inputValues.dialects}
                onChange={(e) =>
                  handleChipInputChange("dialects", e.target.value)
                }
                onKeyPress={(e) => handleChipInputKeyPress("dialects", e)}
                placeholder="Type dialect and press Enter (e.g., Mumbai Hindi, Kolkata Bengali)"
                helperText="Type each dialect and press Enter to add. Specify any regional variations you speak"
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <RecordVoiceOver color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              {formData.dialects.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {formData.dialects.map((dialect, index) => (
                    <Chip
                      key={index}
                      label={dialect}
                      onDelete={() => handleRemoveChip("dialects", dialect)}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              )}
            </Box>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                id="accents"
                label="Accent Types (Optional)"
                value={inputValues.accents}
                onChange={(e) =>
                  handleChipInputChange("accents", e.target.value)
                }
                onKeyPress={(e) => handleChipInputKeyPress("accents", e)}
                placeholder="Type accent type and press Enter (e.g., Native speaker, British accent)"
                helperText="Type each accent type and press Enter to add. Describe your speaking accent or proficiency level"
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <RecordVoiceOver color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              {formData.accents.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {formData.accents.map((accent, index) => (
                    <Chip
                      key={index}
                      label={accent}
                      onDelete={() => handleRemoveChip("accents", accent)}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              )}
            </Box>

            {/* Account Information */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
              Account Information
            </Typography>

            <TextField
              fullWidth
              id="organization"
              name="organization"
              label="Organization/Institution"
              value={formData.organization}
              onChange={handleChange}
              error={!!formErrors.organization}
              helperText={
                formErrors.organization ||
                "Enter your school, university, or organization name"
              }
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <School color="action" />
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
              autoComplete="new-password"
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

            <TextField
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              margin="normal"
              autoComplete="new-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              component={Link}
              to="/login"
              sx={{ py: 1.5 }}
            >
              Sign In
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
