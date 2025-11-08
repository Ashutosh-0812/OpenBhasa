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
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  School,
  PersonAdd,
  Cake,
  LocationOn,
  Language,
  RecordVoiceOver,
} from '@mui/icons-material';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/layout/AuthLayout';

const INDIAN_LANGUAGES = [
  'Hindi',
  'English',
  'Bengali',
  'Telugu',
  'Marathi',
  'Tamil',
  'Urdu',
  'Gujarati',
  'Malayalam',
  'Kannada',
  'Odia',
  'Punjabi',
  'Assamese',
  'Maithili',
  'Sanskrit',
  'Nepali',
  'Konkani',
  'Manipuri',
  'Bodo',
  'Dogri',
  'Kashmiri',
  'Santali',
  'Sindhi',
];

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

type UserRole = 'student' | 'participant' | 'reviewer' | 'admin';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  organization: string;
  age: string;
  gender: string;
  nativePlace: string;
  languages: string[];
  dialects: string[];
  accents: string[];
}

interface InputValues {
  dialects: string;
  accents: string;
}

interface FormErrors {
  [key: string]: string;
}

interface RegisterPageProps {
  onRegister?: (user: User) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister }) => {
  const navigate = useNavigate();
  const { register, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    organization: '',
    age: '',
    gender: '',
    nativePlace: '',
    languages: [],
    dialects: [],
    accents: [],
  });

  const [inputValues, setInputValues] = useState<InputValues>({
    dialects: '',
    accents: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName.trim())) {
      errors.firstName = 'First name can only contain letters and spaces';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName.trim())) {
      errors.lastName = 'Last name can only contain letters and spaces';
    }

    // Validate combined name length
    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
    if (fullName.length > 50) {
      errors.firstName = 'Combined name is too long (max 50 characters)';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      const cleanedPhone = formData.phone.replace(/\D/g, '');
      if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
        errors.phone = 'Phone number must be between 10 and 15 digits';
      }
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    } else if (formData.password.length > 100) {
      errors.password = 'Password must not exceed 100 characters';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one number';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.organization.trim()) {
      errors.organization = 'Organization is required';
    }

    if (!formData.age || Number(formData.age) < 13 || Number(formData.age) > 100) {
      errors.age = 'Please enter a valid age between 13 and 100';
    }

    if (!formData.gender) {
      errors.gender = 'Please select your gender';
    }

    if (!formData.nativePlace.trim()) {
      errors.nativePlace = 'Native place is required';
    }

    if (formData.languages.length === 0) {
      errors.languages = 'Please select at least one language you speak';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayChange = (name: keyof FormData, newValue: string[]) => {
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (formErrors[name as string]) {
      setFormErrors((prev) => ({ ...prev, [name as string]: '' }));
    }
  };

  const handleAddChip = (fieldName: keyof InputValues, value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;
    const fieldKey = fieldName as unknown as keyof FormData;
    const current = formData[fieldKey] as unknown as string[];
    if (!current.includes(trimmedValue)) {
      setFormData((prev) => ({ ...prev, [fieldKey]: [...(prev[fieldKey] as string[]), trimmedValue] }));
    }
    setInputValues((prev) => ({ ...prev, [fieldName]: '' }));
  };

  const handleRemoveChip = (fieldName: keyof FormData, chipToRemove: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: (prev[fieldName] as string[]).filter((c) => c !== chipToRemove) }));
  };

  const handleChipInputChange = (fieldName: keyof InputValues, value: string) => {
    setInputValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleChipInputKeyPress = (fieldName: keyof InputValues, event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddChip(fieldName, inputValues[fieldName]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Match the original API payload structure from Register.jsx
      const registrationData = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.replace(/\D/g, ''),
        password: formData.password,
        role: formData.role,
        college: formData.organization.trim(),
        // Demographic information
        age: parseInt(formData.age),
        gender: formData.gender.toLowerCase(),
        native: formData.nativePlace.trim(),
        // Language information
        language: formData.languages,
        dialects: formData.dialects,
        accent: formData.accents,
      };

      const response = await register(registrationData as any);

      if (response.success && response.data) {
        setRegistrationSuccess(true);
        onRegister?.(response.data as User);
        setTimeout(() => navigate('/auth/login'), 1500);
      } else {
        setError(response.error || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <AuthLayout>
        <Container maxWidth="sm">
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
            <PersonAdd sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Registration Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your student account has been created successfully. Please wait
              for admin approval to activate your account and start using the
              platform.
            </Typography>
            <Button variant="contained" size="large" onClick={() => navigate('/auth/login')} sx={{ mt: 2 }}>
              Go to Login
            </Button>
          </Paper>
        </Container>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Box textAlign="center" mb={4}>
            <PersonAdd sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Create Student Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join the OpenBhasha platform as a student to manage language data
              collection
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>Personal Information</Typography>

            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <TextField fullWidth id="firstName" name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} error={!!formErrors.firstName} helperText={formErrors.firstName} autoFocus InputProps={{ startAdornment: (<InputAdornment position="start"><Person color="action"/></InputAdornment>) }} />

              <TextField fullWidth id="lastName" name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} error={!!formErrors.lastName} helperText={formErrors.lastName} InputProps={{ startAdornment: (<InputAdornment position="start"><Person color="action"/></InputAdornment>) }} />
            </Box>

            <TextField fullWidth id="email" name="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} error={!!formErrors.email} helperText={formErrors.email} margin="normal" autoComplete="email" InputProps={{ startAdornment: (<InputAdornment position="start"><Email color="action"/></InputAdornment>) }} />

            <TextField fullWidth id="phone" name="phone" label="Phone Number" value={formData.phone} onChange={handleChange} error={!!formErrors.phone} helperText={formErrors.phone} margin="normal" InputProps={{ startAdornment: (<InputAdornment position="start"><Phone color="action"/></InputAdornment>) }} />

            <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>Demographic Information</Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <TextField fullWidth id="age" name="age" label="Age" type="number" value={formData.age} onChange={handleChange} error={!!formErrors.age} helperText={formErrors.age} inputProps={{ min: 13, max: 100 }} InputProps={{ startAdornment: (<InputAdornment position="start"><Cake color="action"/></InputAdornment>) }} />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth error={!!formErrors.gender}>
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Select labelId="gender-label" id="gender" name="gender" value={formData.gender} onChange={handleChange} label="Gender">
                    {GENDER_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                  {formErrors.gender && <FormHelperText>{formErrors.gender}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField fullWidth id="nativePlace" name="nativePlace" label="Native Place" value={formData.nativePlace} onChange={handleChange} error={!!formErrors.nativePlace} helperText={formErrors.nativePlace} InputProps={{ startAdornment: (<InputAdornment position="start"><LocationOn color="action"/></InputAdornment>) }} />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>Language Information</Typography>

            <Autocomplete multiple id="languages" options={INDIAN_LANGUAGES} value={formData.languages} onChange={(_, v) => handleArrayChange('languages', v ?? [])} renderTags={(value, getTagProps) => value.map((option, index) => { const { key, ...tagProps } = getTagProps({ index }); return <Chip key={key} variant="outlined" label={option} {...tagProps} />; })} renderInput={(params) => (
              <TextField
                {...params}
                label="Languages You Speak"
                placeholder="Select languages..."
                error={!!formErrors.languages}
                helperText={formErrors.languages || 'Select all languages you can speak fluently'}
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
            )} sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <TextField fullWidth id="dialects" label="Dialects (Optional)" value={inputValues.dialects} onChange={(e) => handleChipInputChange('dialects', e.target.value)} onKeyPress={(e) => handleChipInputKeyPress('dialects', e)} placeholder="Type dialect and press Enter (e.g., Mumbai Hindi, Kolkata Bengali)" helperText="Type each dialect and press Enter to add. Specify any regional variations you speak" margin="normal" InputProps={{ startAdornment: (<InputAdornment position="start"><RecordVoiceOver color="action"/></InputAdornment>) }} />
              {formData.dialects.length > 0 && <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>{formData.dialects.map((dialect, index) => (<Chip key={index} label={dialect} onDelete={() => handleRemoveChip('dialects', dialect)} variant="outlined" size="small" />))}</Box>}
            </Box>

            <Box sx={{ mb: 2 }}>
              <TextField fullWidth id="accents" label="Accent Types (Optional)" value={inputValues.accents} onChange={(e) => handleChipInputChange('accents', e.target.value)} onKeyPress={(e) => handleChipInputKeyPress('accents', e)} placeholder="Type accent type and press Enter (e.g., Native speaker, British accent)" helperText="Type each accent type and press Enter to add. Describe your speaking accent or proficiency level" margin="normal" InputProps={{ startAdornment: (<InputAdornment position="start"><RecordVoiceOver color="action"/></InputAdornment>) }} />
              {formData.accents.length > 0 && <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>{formData.accents.map((accent, index) => (<Chip key={index} label={accent} onDelete={() => handleRemoveChip('accents', accent)} variant="outlined" size="small" />))}</Box>}
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>Account Information</Typography>

            <TextField fullWidth id="organization" name="organization" label="Organization/Institution" value={formData.organization} onChange={handleChange} error={!!formErrors.organization} helperText={formErrors.organization || 'Enter your school, university, or organization name'} margin="normal" InputProps={{ startAdornment: (<InputAdornment position="start"><School color="action"/></InputAdornment>) }} />

            <TextField fullWidth id="password" name="password" label="Password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} error={!!formErrors.password} helperText={formErrors.password} margin="normal" autoComplete="new-password" InputProps={{ startAdornment: (<InputAdornment position="start"><Lock color="action"/></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton aria-label="toggle password visibility" onClick={() => setShowPassword((s) => !s)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />

            <TextField fullWidth id="confirmPassword" name="confirmPassword" label="Confirm Password" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} error={!!formErrors.confirmPassword} helperText={formErrors.confirmPassword} margin="normal" autoComplete="new-password" InputProps={{ startAdornment: (<InputAdornment position="start"><Lock color="action"/></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton aria-label="toggle confirm password visibility" onClick={() => setShowConfirmPassword((s) => !s)} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />

            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading || authLoading} sx={{ mt: 3, mb: 2, py: 1.5 }}>{loading || authLoading ? (<Box display="flex" alignItems="center" gap={1}><CircularProgress size={20} />Creating Account...</Box>) : ('Create Account')}</Button>

            <Divider sx={{ my: 3 }}><Typography variant="body2" color="text.secondary">Already have an account?</Typography></Divider>

            <Button fullWidth variant="outlined" size="large" component={Link as any} to="/auth/login" sx={{ py: 1.5 }}>Sign In</Button>
          </Box>
        </Paper>
      </Container>
    </AuthLayout>
  );
};

export default RegisterPage;
