import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Alert,
  Box,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Close,
  Person,
  School,
  Phone,
  Email,
  LocationOn,
  Language,
} from "@mui/icons-material";
import { participantInviteAPI } from "../api/apiClient";

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

const GENDER_OPTIONS = ["male", "female"];

const ParticipantInviteDialog = ({ open, onClose, onInviteCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    institute: "",
    age: "",
    gender: "",
    native: "",
    language: [],
    dialects: [],
    accent: [],
  });

  const [inputValues, setInputValues] = useState({
    dialects: "",
    accent: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Email is invalid";
    if (!formData.phone.trim()) errors.phone = "Phone is required";
    if (!formData.institute.trim()) errors.institute = "Institute is required";
    if (!formData.age || formData.age < 13 || formData.age > 100) {
      errors.age = "Age must be between 13 and 100";
    }
    if (!formData.gender) errors.gender = "Gender is required";
    if (!formData.native.trim()) errors.native = "Native place is required";
    if (formData.language.length === 0)
      errors.language = "At least one language is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleArrayChange = (name, newValue) => {
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAddChip = (fieldName, value) => {
    if (value.trim() && !formData[fieldName].includes(value.trim())) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: [...prev[fieldName], value.trim()],
      }));
      setInputValues((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleRemoveChip = (fieldName, chipToRemove) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((item) => item !== chipToRemove),
    }));
  };

  const handleChipInputChange = (fieldName, value) => {
    setInputValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleChipInputKeyPress = (fieldName, event) => {
    if (event.key === "Enter" && inputValues[fieldName].trim()) {
      handleAddChip(fieldName, inputValues[fieldName]);
      event.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await participantInviteAPI.createInvite({
        ...formData,
        age: parseInt(formData.age),
      });

      setSuccess(response.data);
      onInviteCreated(response.data);

      // Reset form after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to create invite");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      institute: "",
      age: "",
      gender: "",
      native: "",
      language: [],
      dialects: [],
      accent: [],
    });
    setInputValues({ dialects: "", accent: "" });
    setFormErrors({});
    setSuccess(null);
    setError(null);
    onClose();
  };

  if (success) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "success.main", color: "white" }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            Invite Created Successfully!
            <IconButton onClick={handleClose} sx={{ color: "white" }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Participant invite created successfully!
          </Alert>
          <Typography variant="h6" gutterBottom>
            Participant: {success.invite.participantName}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Email: {success.invite.participantEmail}
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Invitation Link:
            </Typography>
            <Typography
              variant="body2"
              sx={{ wordBreak: "break-all", fontFamily: "monospace" }}
            >
              {success.invite.inviteLink}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Share this link with the participant. It will expire in 7 days.
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Invite New Participant
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Basic Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                name="name"
                label="Full Name"
                value={formData.name}
                onChange={handleChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                name="email"
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                error={!!formErrors.phone}
                helperText={formErrors.phone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                name="institute"
                label="Institute/College"
                value={formData.institute}
                onChange={handleChange}
                error={!!formErrors.institute}
                helperText={formErrors.institute}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <School />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Demographic Information */}
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="h6"
                gutterBottom
                color="primary"
                sx={{ mt: 2 }}
              >
                Demographic Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                name="age"
                type="number"
                label="Age"
                value={formData.age}
                onChange={handleChange}
                error={!!formErrors.age}
                helperText={formErrors.age}
                inputProps={{ min: 13, max: 100 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth error={!!formErrors.gender}>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  label="Gender"
                >
                  {GENDER_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.gender && (
                  <Typography variant="caption" color="error">
                    {formErrors.gender}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                name="native"
                label="Native Place"
                value={formData.native}
                onChange={handleChange}
                error={!!formErrors.native}
                helperText={formErrors.native}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Language Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Language Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Autocomplete
                multiple
                options={INDIAN_LANGUAGES}
                value={formData.language}
                onChange={(event, newValue) =>
                  handleArrayChange("language", newValue)
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
                    label="Languages"
                    placeholder="Select languages..."
                    error={!!formErrors.language}
                    helperText={
                      formErrors.language ||
                      "Select all languages they can speak fluently"
                    }
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <Language />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Dialects (Press Enter to add)"
                value={inputValues.dialects}
                onChange={(e) =>
                  handleChipInputChange("dialects", e.target.value)
                }
                onKeyPress={(e) => handleChipInputKeyPress("dialects", e)}
                helperText="Type dialect names and press Enter to add multiple"
              />
              <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {formData.dialects.map((dialect) => (
                  <Chip
                    key={dialect}
                    label={dialect}
                    onDelete={() => handleRemoveChip("dialects", dialect)}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Accents (Press Enter to add)"
                value={inputValues.accent}
                onChange={(e) =>
                  handleChipInputChange("accent", e.target.value)
                }
                onKeyPress={(e) => handleChipInputKeyPress("accent", e)}
                helperText="Type accent names and press Enter to add multiple"
              />
              <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {formData.accent.map((accent) => (
                  <Chip
                    key={accent}
                    label={accent}
                    onDelete={() => handleRemoveChip("accent", accent)}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            {loading ? "Creating..." : "Create Invite"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ParticipantInviteDialog;
