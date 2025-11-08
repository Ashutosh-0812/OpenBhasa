import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  IconButton,
  Alert,
  Paper,
  List,
  ListItem,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { Project, User } from '@/types';
import { projectService } from '@/services/projectService';
import { userService } from '@/services/userService';

interface ProjectUserAssignPageProps {
  onUsersAssigned?: (projectId: string, userIds: string[]) => void;
}

export const ProjectUserAssignPage: React.FC<ProjectUserAssignPageProps> = ({
  onUsersAssigned,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  const [project, setProject] = useState<Project | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Load project and user data on mount
  useEffect(() => {
    const loadData = async () => {
      if (!projectId) {
        setError('No project ID provided');
        setLoadingData(false);
        return;
      }

      try {
        console.log('🔄 USER ASSIGN: Loading data for project ID:', projectId);
        
        // Try to get data from location state first
        const stateProject = location.state?.project;
        const stateUsers = location.state?.availableUsers;
        
        let projectData = stateProject;
        let usersData = stateUsers;

        // Fetch project data if not available in state
        if (!projectData) {
          console.log('🔄 USER ASSIGN: Fetching project from API...');
          const projectResponse = await projectService.getProject(projectId);
          if (projectResponse.success && projectResponse.data) {
            projectData = projectResponse.data.project || projectResponse.data;
            console.log('✅ USER ASSIGN: Project loaded from API:', projectData);
          } else {
            setError(projectResponse.error || 'Failed to load project');
            setLoadingData(false);
            return;
          }
        }

        // Fetch users data if not available in state
        if (!usersData || !Array.isArray(usersData) || usersData.length === 0) {
          console.log('🔄 USER ASSIGN: Fetching users from API...');
          const usersResponse = await userService.getAllUsers();
          if (usersResponse.success && usersResponse.data) {
            usersData = usersResponse.data.users || usersResponse.data || [];
            console.log('✅ USER ASSIGN: Users loaded from API:', usersData);
          } else {
            console.warn('❌ USER ASSIGN: Failed to load users, using empty array');
            usersData = [];
          }
        }

        setProject(projectData);
        setAvailableUsers(Array.isArray(usersData) ? usersData : []);
        
        // Set currently assigned users as selected
        const currentAssignedIds = projectData.assignedUsers || [];
        setSelectedUserIds(currentAssignedIds);
        
        console.log('📋 USER ASSIGN: Current assigned users:', currentAssignedIds);
        
      } catch (error: any) {
        console.error('❌ USER ASSIGN: Error loading data:', error);
        setError('Failed to load data');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [projectId, location.state]);

  const handleUserToggle = (userId: string) => {
    setSelectedUserIds(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === availableUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(availableUsers.map(user => user.id || (user as any)._id));
    }
  };

  const handleSubmit = async () => {
    if (!projectId) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('👥 USER ASSIGN: Starting user assignment...');
      console.log('👥 USER ASSIGN: Selected user IDs:', selectedUserIds);

      const response = await projectService.assignUsersToProject(projectId, selectedUserIds);

      if (response.success) {
        console.log('✅ USER ASSIGN: Users assigned successfully');
        setSuccess('Users assigned successfully!');
        
        // Call callback if provided
        if (onUsersAssigned) {
          onUsersAssigned(projectId, selectedUserIds);
        }

        // Navigate back to project detail page after a short delay
        setTimeout(() => {
          navigate(`/projects/${projectId}`, {
            state: { message: 'Users assigned successfully' }
          });
        }, 1500);
      } else {
        console.error('❌ USER ASSIGN: Assignment failed:', response.error);
        setError(response.error || 'Failed to assign users');
      }
    } catch (error: any) {
      console.error('❌ USER ASSIGN: Assignment error:', error);
      setError('Failed to assign users');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography>Loading project and user data...</Typography>
        </Box>
      </Container>
    );
  }

  if (!project && !loadingData) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Project not found'}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/projects')}
          >
            Back to Projects
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton
            onClick={() => navigate(`/projects/${projectId}`)}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Assign Users
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Select users to assign to: {project?.name || project?.title}
        </Typography>
      </Box>

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Project Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            {project?.name || project?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {project?.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={project?.language || 'Unknown Language'}
              size="small"
              color="primary"
            />
            <Chip
              label={`Currently ${selectedUserIds.length} users assigned`}
              size="small"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {/* User Selection */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Available Users ({availableUsers.length})
          </Typography>
          <Button
            variant="outlined"
            onClick={handleSelectAll}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            {selectedUserIds.length === availableUsers.length ? 'Deselect All' : 'Select All'}
          </Button>
        </Box>

        {availableUsers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No users available for assignment
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {availableUsers.map((user, index) => {
              const userId = user.id || (user as any)._id;
              const isSelected = selectedUserIds.includes(userId);
              
              return (
                <React.Fragment key={userId}>
                  <ListItem
                    sx={{
                      px: 0,
                      py: 2,
                      cursor: 'pointer',
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'background.default' },
                    }}
                    onClick={() => handleUserToggle(userId)}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleUserToggle(userId)}
                        />
                      }
                      label=""
                      sx={{ mr: 2 }}
                    />
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {user.name || 'Unknown User'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email || 'No email'}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={user.role || 'student'}
                          size="small"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </Box>
                    </Box>
                  </ListItem>
                  {index < availableUsers.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/projects/${projectId}`)}
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={loading || availableUsers.length === 0}
            sx={{
              borderRadius: 2,
              px: 3,
            }}
          >
            {loading ? 'Assigning...' : `Assign ${selectedUserIds.length} Users`}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};