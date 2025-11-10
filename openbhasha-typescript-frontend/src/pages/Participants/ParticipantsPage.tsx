import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Link as LinkIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  Info as InfoIcon,
  People as PeopleIcon,
  CheckCircleOutline,
  PendingActions,
  AccessTimeOutlined,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Language as LanguageIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { ParticipantInviteDialog } from '@/components/ParticipantInviteDialog';
import { participantService } from '@/services/participantService';

interface ParticipantInvite {
  id: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  institute: string;
  languages: string[];
  status: 'pending' | 'accepted' | 'expired';
  inviteLink: string;
  createdAt: string;
  expiresAt: string;
  participantData: any;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  institute: string;
  languages: string[];
  status: 'active' | 'inactive' | 'completed';
  tasksAssigned: number;
  recordingsCompleted: number;
  totalRecordings: number;
  joinedDate: string;
  coinsEarned: number;
  level: number;
  streak: number;
  referralBonus: number;
}

interface ParticipantsPageProps {}

export const ParticipantsPage: React.FC<ParticipantsPageProps> = () => {
  const [participantInvites, setParticipantInvites] = useState<ParticipantInvite[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [inviteDialog, setInviteDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState<ParticipantInvite | Participant | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Load participant invites from backend
  const fetchParticipantInvites = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching participant invites...');
      
      const response = await participantService.getMyInvites();
      
      if (response.success && response.data) {
        console.log('✅ Participant invites loaded:', response.data);
        setParticipantInvites(response.data.invites || []);
      } else {
        console.warn('⚠️ Failed to load invites, using empty array');
        setParticipantInvites([]);
        setSnackbar({
          open: true,
          message: response.error || 'Failed to load participant invites',
          type: 'warning',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching participant invites:', error);
      setParticipantInvites([]);
      setSnackbar({
        open: true,
        message: 'Backend unavailable - showing empty list',
        type: 'info',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load initial data when component mounts
  useEffect(() => {
    fetchParticipantInvites();
    
    // For now, participants will be empty since we don't have backend API for active participants yet
    // Active participants would come from accepted invites
    setParticipants([]);
  }, []);

  const refreshData = () => {
    fetchParticipantInvites();
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleInviteCreated = (newInvite: { invite: any }) => {
    // Refresh the entire list to get latest data from backend
    fetchParticipantInvites();
    setInviteDialog(false);
    setSnackbar({
      open: true,
      message: `Invite sent to ${newInvite.invite.participantName || 'participant'}`,
      type: 'success',
    });
  };

  const handleCopyInviteLink = async (inviteLink: string, participantName: string) => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setSnackbar({
        open: true,
        message: `Link copied for ${participantName}`,
        type: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to copy link',
        type: 'error',
      });
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'warning' as const,
          icon: <PendingActions />,
          text: 'Pending',
        };
      case 'accepted':
        return {
          color: 'success' as const,
          icon: <CheckCircleOutline />,
          text: 'Registered',
        };
      case 'expired':
        return {
          color: 'error' as const,
          icon: <AccessTimeOutlined />,
          text: 'Expired',
        };
      case 'active':
        return {
          color: 'success' as const,
          icon: <CheckCircleOutline />,
          text: 'Active',
        };
      case 'inactive':
        return {
          color: 'default' as const,
          icon: <PendingActions />,
          text: 'Inactive',
        };
      case 'completed':
        return {
          color: 'info' as const,
          icon: <CheckCircleOutline />,
          text: 'Completed',
        };
      default:
        return {
          color: 'default' as const,
          icon: <PendingActions />,
          text: status,
        };
    }
  };

  const renderDetailsDialog = () => {
    if (!detailsDialog) return null;

    const isInvite = 'inviteLink' in detailsDialog;
    const data = detailsDialog;

    return (
      <Dialog open={!!detailsDialog} onClose={() => setDetailsDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isInvite ? 'Invitation Details' : 'Participant Details'}
        </DialogTitle>
        <DialogContent dividers>
          <List>
            <ListItem>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText
                primary="Name"
                secondary={isInvite ? (data as ParticipantInvite).participantName : (data as Participant).name}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText
                primary="Email"
                secondary={isInvite ? (data as ParticipantInvite).participantEmail : (data as Participant).email}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <PhoneIcon />
              </ListItemIcon>
              <ListItemText
                primary="Phone"
                secondary={isInvite ? (data as ParticipantInvite).participantPhone : (data as Participant).phone}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SchoolIcon />
              </ListItemIcon>
              <ListItemText
                primary="Institute"
                secondary={data.institute}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <LanguageIcon />
              </ListItemIcon>
              <ListItemText
                primary="Languages"
                secondary={data.languages.join(', ')}
              />
            </ListItem>
            {!isInvite && (
              <>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Joined"
                    secondary={isInvite ? 'Not joined yet' : new Date((data as Participant).joinedDate).toLocaleDateString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Performance"
                    secondary={
                      <Box>
                        {!isInvite && (
                          <>
                            <Typography variant="body2">
                              Recordings: {(data as Participant).recordingsCompleted}/{(data as Participant).totalRecordings}
                            </Typography>
                            <Typography variant="body2">
                              Tasks Assigned: {(data as Participant).tasksAssigned}
                            </Typography>
                            <Typography variant="body2">
                              Level: {(data as Participant).level} | Streak: {(data as Participant).streak} days
                            </Typography>
                            <Typography variant="body2">
                              Coins Earned: {(data as Participant).coinsEarned}
                            </Typography>
                          </>
                        )}
                        {isInvite && (
                          <Typography variant="body2" color="text.secondary">
                            Invitation pending - participant has not joined yet
                          </Typography>
                        )}
                      </Box>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
              </>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ 
      background: '#fff',
      padding: '0 16px 16px',
      maxWidth: '375px',
      margin: '0 auto',
      minHeight: '100vh',
    }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
        <Typography variant="h5" component="h1" color="primary.main" fontWeight="bold" fontSize={{ xs: '1.25rem', sm: '1.5rem' }}>
          Participant Management
        </Typography>
        <Box display="flex" gap={1} flexDirection={{ xs: 'column', sm: 'row' }} width={{ xs: '100%', sm: 'auto' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshData}
            disabled={loading}
            size="small"
            sx={{ 
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setInviteDialog(true)}
            size="small"
            sx={{ 
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Invite Participant
          </Button>
        </Box>
      </Box>

      <Box mb={3}>
        {/* Statistics Cards */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h5" color="primary.main" fontSize="1.5rem">
                  {participantInvites.length}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                  Total Invites
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h5" color="success.main" fontSize="1.5rem">
                  {participantInvites.filter(invite => invite.status === 'accepted').length + participants.length}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                  Active Participants
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h5" color="warning.main" fontSize="1.5rem">
                  {participantInvites.filter(invite => invite.status === 'pending').length}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                  Pending Invites
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h5" color="info.main" fontSize="1.5rem">
                  {participants.reduce((sum, p) => sum + p.recordingsCompleted, 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                  Total Recordings
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Tab Navigation */}
      <Box mb={2}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              fontSize: '0.875rem',
              minHeight: 48,
            }
          }}
        >
          <Tab label="Invitation History" />
          <Tab label="Active Participants" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 ? (
        // Invitation History Tab
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontSize="1rem">
                Invitation History
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : participantInvites.length > 0 ? (
                <TableContainer 
                  component={Paper} 
                  variant="outlined"
                  sx={{ 
                    maxHeight: 400, 
                    overflow: 'auto',
                    fontSize: '0.875rem'
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.75rem', py: 1 }}>Participant</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', py: 1 }}>Status</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', py: 1, display: { xs: 'none', sm: 'table-cell' } }}>Created</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', py: 1 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {participantInvites.map((invite) => {
                        const statusDisplay = getStatusDisplay(invite.status);
                        const isExpired = new Date(invite.expiresAt) < new Date();

                        return (
                          <TableRow key={invite.id || invite.participantEmail} hover>
                            <TableCell sx={{ py: 1 }}>
                              <Box>
                                <Typography variant="body2" fontWeight="medium" fontSize="0.8rem">
                                  {invite.participantName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                                  {invite.participantEmail}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ py: 1 }}>
                              <Chip
                                icon={statusDisplay.icon}
                                label={isExpired && invite.status === 'pending' ? 'Expired' : statusDisplay.text}
                                color={isExpired && invite.status === 'pending' ? 'error' : statusDisplay.color}
                                size="small"
                                sx={{ fontSize: '0.7rem', height: '24px' }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 1, display: { xs: 'none', sm: 'table-cell' } }}>
                              <Typography variant="body2" fontSize="0.75rem">
                                {new Date(invite.createdAt).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 1 }}>
                              <Box display="flex" gap={0.5} justifyContent="center">
                                <Tooltip title="View Details">
                                  <IconButton
                                    size="small"
                                    onClick={() => setDetailsDialog(invite)}
                                  >
                                    <InfoIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Copy Invite Link">
                                  <span>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleCopyInviteLink(invite.inviteLink, invite.participantName)}
                                      disabled={isExpired && invite.status === 'pending'}
                                    >
                                      <LinkIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="Share Link">
                                  <span>
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        if (navigator.share) {
                                          navigator.share({
                                            title: `Registration Invite - ${invite.participantName}`,
                                            text: 'You\'ve been invited to participate in OpenBhasha audio collection',
                                            url: invite.inviteLink,
                                          });
                                        } else {
                                          handleCopyInviteLink(invite.inviteLink, invite.participantName);
                                        }
                                      }}
                                      disabled={isExpired && invite.status === 'pending'}
                                    >
                                      <ShareIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">
                    No invitations sent yet. Click "Invite Participant" to get started.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      ) : (
        // Active Participants Tab
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontSize="1rem">
                Active Participants
              </Typography>
              {participants.length > 0 ? (
                <List>
                  {participants.map((participant, index) => {
                    const statusDisplay = getStatusDisplay(participant.status);
                    return (
                      <React.Fragment key={participant.id}>
                        <ListItem>
                          <ListItemText
                            primary={participant.name}
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  {participant.institute}
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                  <Chip
                                    icon={statusDisplay.icon}
                                    label={statusDisplay.text}
                                    color={statusDisplay.color}
                                    size="small"
                                  />
                                  <Typography variant="caption">
                                    Level {participant.level}
                                  </Typography>
                                </Box>
                              </Box>
                            }
                            secondaryTypographyProps={{ component: 'div' }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => setDetailsDialog(participant)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </ListItem>
                        {index < participants.length - 1 && <Divider />}
                      </React.Fragment>
                    );
                  })}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                  No active participants yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Dialogs */}
      <ParticipantInviteDialog
        open={inviteDialog}
        onClose={() => setInviteDialog(false)}
        onInviteCreated={handleInviteCreated}
      />

      {renderDetailsDialog()}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.type}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};