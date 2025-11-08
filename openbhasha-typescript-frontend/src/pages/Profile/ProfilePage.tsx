import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Avatar,
  Grid,
  Tab,
  Tabs,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Notifications as NotificationIcon,
  Security as SecurityIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PhotoCamera as CameraIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { User } from '@/types';

interface ProfilePageProps {
  user: User;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  languages: string[];
  timezone: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  taskReminders: boolean;
  projectUpdates: boolean;
  reviewNotifications: boolean;
  marketingEmails: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  downloadData: boolean;
}

const AVAILABLE_LANGUAGES = [
  'Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 
  'Urdu', 'Gujarati', 'Malayalam', 'Kannada', 'Odia', 'Punjabi'
];

const TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Mumbai',
  'Asia/Delhi',
  'Asia/Calcutta',
  'UTC',
  'America/New_York',
  'Europe/London',
];

export const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form state
  const [profileData, setProfileData] = useState<ProfileFormData>({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: '+91 98765 43210',
    location: 'Mumbai, India',
    bio: 'Passionate about speech technology and language preservation.',
    languages: ['Hindi', 'English'],
    timezone: 'Asia/Kolkata',
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    projectUpdates: true,
    reviewNotifications: false,
    marketingEmails: false,
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    downloadData: false,
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showMessage('success', 'Profile updated successfully!');
      setEditingProfile(false);
    } catch (error) {
      showMessage('error', 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSave = async () => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showMessage('success', 'Notification preferences saved!');
    } catch (error) {
      showMessage('error', 'Failed to save notification settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySave = async () => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showMessage('success', 'Security settings updated!');
    } catch (error) {
      showMessage('error', 'Failed to update security settings.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showMessage('success', 'Password changed successfully!');
      setShowPasswordDialog(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false,
      });
    } catch (error) {
      showMessage('error', 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      // Mock file upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      showMessage('success', 'Profile picture updated!');
    } catch (error) {
      showMessage('error', 'Failed to upload image.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDataDownload = async () => {
    setLoading(true);
    try {
      // Mock data export
      await new Promise(resolve => setTimeout(resolve, 2000));
      showMessage('success', 'Your data download has been initiated. Check your email for the download link.');
    } catch (error) {
      showMessage('error', 'Failed to export data.');
    } finally {
      setLoading(false);
    }
  };

  const renderProfileTab = () => (
    <Box sx={{ px: { xs: 2, sm: 3 } }}>
      {/* Profile Picture Section */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ textAlign: 'center', p: { xs: 3, sm: 4 } }}>
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
            <Avatar
              sx={{
                width: { xs: 80, sm: 120 },
                height: { xs: 80, sm: 120 },
                fontSize: { xs: '2rem', sm: '3rem' },
                bgcolor: 'primary.main',
              }}
            >
              {uploadingAvatar ? (
                <CircularProgress size={30} color="inherit" />
              ) : (
                `${user.firstName[0]}${user.lastName[0]}`
              )}
            </Avatar>
            <IconButton
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'primary.main',
                color: 'white',
                width: 32,
                height: 32,
                '&:hover': { bgcolor: 'primary.dark' },
              }}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              <CameraIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {user.firstName} {user.lastName}
          </Typography>
          <Chip
            label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            size="small"
            color="primary"
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            {profileData.bio}
          </Typography>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            style={{ display: 'none' }}
          />
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Personal Information
            </Typography>
            <Button
              variant={editingProfile ? 'outlined' : 'contained'}
              startIcon={editingProfile ? <CancelIcon /> : <EditIcon />}
              onClick={() => setEditingProfile(!editingProfile)}
              sx={{ borderRadius: 2 }}
            >
              {editingProfile ? 'Cancel' : 'Edit'}
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={profileData.firstName}
                onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                disabled={!editingProfile}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={profileData.lastName}
                onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={!editingProfile}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!editingProfile}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!editingProfile}
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={profileData.location}
                onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                disabled={!editingProfile}
                InputProps={{
                  startAdornment: <LocationIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!editingProfile}>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={profileData.timezone}
                  label="Timezone"
                  onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                >
                  {TIMEZONES.map((timezone) => (
                    <MenuItem key={timezone} value={timezone}>
                      {timezone}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth disabled={!editingProfile}>
                <InputLabel>Languages</InputLabel>
                <Select
                  multiple
                  value={profileData.languages}
                  onChange={(e) => setProfileData(prev => ({ ...prev, languages: e.target.value as string[] }))}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                >
                  {AVAILABLE_LANGUAGES.map((language) => (
                    <MenuItem key={language} value={language}>
                      {language}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Bio"
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                disabled={!editingProfile}
                placeholder="Tell us about yourself..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            {editingProfile && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setEditingProfile(false)}
                    sx={{ borderRadius: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleProfileSave}
                    disabled={loading}
                    sx={{ borderRadius: 2 }}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  const renderNotificationsTab = () => (
    <Box sx={{ px: { xs: 2, sm: 3 } }}>
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Notification Preferences
          </Typography>

          <List>
            <ListItem>
              <ListItemText
                primary="Email Notifications"
                secondary="Receive notifications via email"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    emailNotifications: e.target.checked
                  }))}
                />
              </ListItemSecondaryAction>
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemText
                primary="Push Notifications"
                secondary="Receive push notifications in browser"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    pushNotifications: e.target.checked
                  }))}
                />
              </ListItemSecondaryAction>
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemText
                primary="Task Reminders"
                secondary="Get reminded about pending tasks"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={notificationSettings.taskReminders}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    taskReminders: e.target.checked
                  }))}
                />
              </ListItemSecondaryAction>
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemText
                primary="Project Updates"
                secondary="Notifications about project changes"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={notificationSettings.projectUpdates}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    projectUpdates: e.target.checked
                  }))}
                />
              </ListItemSecondaryAction>
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemText
                primary="Review Notifications"
                secondary="Notifications about review status"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={notificationSettings.reviewNotifications}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    reviewNotifications: e.target.checked
                  }))}
                />
              </ListItemSecondaryAction>
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemText
                primary="Marketing Emails"
                secondary="Receive updates about new features"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={notificationSettings.marketingEmails}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    marketingEmails: e.target.checked
                  }))}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>

          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button
              variant="contained"
              onClick={handleNotificationSave}
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderSecurityTab = () => (
    <Box sx={{ px: { xs: 2, sm: 3 } }}>
      <Grid container spacing={3}>
        {/* Password Section */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Password & Authentication
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<SecurityIcon />}
                  onClick={() => setShowPasswordDialog(true)}
                  sx={{ borderRadius: 2, mr: 2, mb: 2 }}
                >
                  Change Password
                </Button>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      twoFactorAuth: e.target.checked
                    }))}
                  />
                }
                label="Enable Two-Factor Authentication"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Session Settings */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Session Settings
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Session Timeout</InputLabel>
                <Select
                  value={securitySettings.sessionTimeout}
                  label="Session Timeout"
                  onChange={(e) => setSecuritySettings(prev => ({
                    ...prev,
                    sessionTimeout: Number(e.target.value)
                  }))}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                >
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                  <MenuItem value={120}>2 hours</MenuItem>
                  <MenuItem value={480}>8 hours</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Data Management */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Data Management
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDataDownload}
                  disabled={loading}
                  sx={{ borderRadius: 2, mr: 2, mb: 2 }}
                >
                  {loading ? 'Processing...' : 'Download My Data'}
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setShowDeleteDialog(true)}
                  sx={{ borderRadius: 2, mb: 2 }}
                >
                  Delete Account
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Download all your data or permanently delete your account and all associated data.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              onClick={handleSecuritySave}
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              {loading ? 'Saving...' : 'Save Security Settings'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: '100vh',
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: '1.5rem', sm: '2rem' },
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Profile Settings
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Manage your account settings and preferences
        </Typography>
      </Box>

      {/* Success/Error Messages */}
      {message && (
        <Alert
          severity={message.type}
          onClose={() => setMessage(null)}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {message.text}
        </Alert>
      )}

      {/* Main Content */}
      <Paper
        sx={{
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: { xs: 1, sm: 2 },
              '& .MuiTab-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
                minHeight: { xs: 44, sm: 48 },
              },
            }}
          >
            <Tab
              label="Profile"
              icon={<PersonIcon />}
              iconPosition="start"
            />
            <Tab
              label="Notifications"
              icon={<NotificationIcon />}
              iconPosition="start"
            />
            <Tab
              label="Security"
              icon={<SecurityIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          {renderProfileTab()}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {renderNotificationsTab()}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {renderSecurityTab()}
        </TabPanel>
      </Paper>

      {/* Password Change Dialog */}
      <Dialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type={passwordForm.showCurrentPassword ? 'text' : 'password'}
                label="Current Password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({
                  ...prev,
                  currentPassword: e.target.value
                }))}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setPasswordForm(prev => ({
                        ...prev,
                        showCurrentPassword: !prev.showCurrentPassword
                      }))}
                    >
                      {passwordForm.showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type={passwordForm.showNewPassword ? 'text' : 'password'}
                label="New Password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({
                  ...prev,
                  newPassword: e.target.value
                }))}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setPasswordForm(prev => ({
                        ...prev,
                        showNewPassword: !prev.showNewPassword
                      }))}
                    >
                      {passwordForm.showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type={passwordForm.showConfirmPassword ? 'text' : 'password'}
                label="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setPasswordForm(prev => ({
                        ...prev,
                        showConfirmPassword: !prev.showConfirmPassword
                      }))}
                    >
                      {passwordForm.showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. All your data, recordings, and account information will be permanently deleted.
          </Alert>
          <Typography>
            Are you sure you want to permanently delete your account?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              showMessage('error', 'Account deletion feature is disabled in demo mode.');
              setShowDeleteDialog(false);
            }}
            color="error"
            variant="contained"
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};