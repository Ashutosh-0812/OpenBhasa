import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  IconButton,
  Tab,
  Tabs,
  LinearProgress,
  List,
  ListItem,
  ListItemSecondaryAction,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PlayArrow as StartIcon,
  Group as GroupIcon,
  Assignment as TaskIcon,
  Language as LanguageIcon,
  Schedule as ScheduleIcon,
  TrendingUp as ProgressIcon,
  Person as PersonIcon,
  CheckCircle as CompletedIcon,
  RadioButtonUnchecked as NotStartedIcon,
  PlayCircle as InProgressIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { Project, Task, User, TaskStatus } from '@/types';

interface ProjectDetailPageProps {}

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
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

/*
// Legacy mock data - now using fully dynamic APIs
const mockProject: Project = {
  id: '#124',
  name: 'Hindi Sentence Reading Project',
  description: 'A comprehensive project for collecting Hindi speech data through sentence reading tasks. This project aims to build a robust dataset for speech recognition and language processing applications.',
  language: 'Hindi',
  languageCode: 'hi',
  status: 'active',
  totalTasks: 15,
  completedTasks: 8,
  assignedUsers: ['1', '2', '3'],
  createdBy: 'admin',
  createdAt: '2025-10-20T00:00:00Z',
  updatedAt: '2025-11-06T10:30:00Z',
  dueDate: '2025-12-31T23:59:59Z',
};

const mockTasks: Task[] = [
  {
    id: 'task1',
    projectId: '#124',
    title: 'Basic Hindi Sentences',
    type: 'read-only',
    description: 'Read simple Hindi sentences for beginners',
    prompts: [],
    assignedTo: ['1', '2'],
    status: 'completed',
    estimatedDuration: 10,
    completedAt: '2025-11-01T09:00:00Z',
    createdAt: '2025-10-20T00:00:00Z',
    updatedAt: '2025-11-01T09:00:00Z',
  },
  {
    id: 'task2',
    projectId: '#124',
    title: 'Conversational Hindi',
    type: 'conversational',
    description: 'Engage in Hindi conversations',
    prompts: [],
    assignedTo: ['1', '3'],
    status: 'in-progress',
    estimatedDuration: 15,
    createdAt: '2025-10-21T00:00:00Z',
    updatedAt: '2025-11-05T14:20:00Z',
  },
  {
    id: 'task3',
    projectId: '#124',
    title: 'Technical Hindi Terms',
    type: 'read-only',
    description: 'Read technical and scientific terms in Hindi',
    prompts: [],
    assignedTo: ['2'],
    status: 'not-started',
    estimatedDuration: 8,
    createdAt: '2025-10-22T00:00:00Z',
    updatedAt: '2025-10-22T00:00:00Z',
  },
];

const mockUsers = [
  {
    id: '1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'student',
    isActive: true,
    createdAt: '2025-10-15T00:00:00Z',
    updatedAt: '2025-11-06T08:30:00Z',
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    role: 'participant',
    isActive: true,
    createdAt: '2025-10-18T00:00:00Z',
    updatedAt: '2025-11-05T16:45:00Z',
  },
  {
    id: '3',
    email: 'mike.wilson@example.com',
    name: 'Mike Wilson',
    role: 'participant',
    isActive: true,
    createdAt: '2025-10-10T00:00:00Z',
    updatedAt: '2025-11-04T12:20:00Z',
  },
] as User[];
*/

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    const loadProjectData = async () => {
      try {
        console.log('🔄 PROJECT DETAIL: Loading project data for ID:', projectId);
        
        if (!projectId) {
          console.log('❌ PROJECT DETAIL: No project ID provided');
          setError('No project ID provided');
          return;
        }

        // Load real project data from API
        const { projectService } = await import('@/services/projectService');
        const { taskService } = await import('@/services/taskService');
        const { userService } = await import('@/services/userService');
        
        const response = await projectService.getProject(projectId);
        
        console.log('📥 PROJECT DETAIL: API Response:', response);
        
        if (response.success && response.data) {
          const rawProjectData = response.data.project || response.data;
          console.log('✅ PROJECT DETAIL: Project loaded:', rawProjectData);
          
          // Normalize project data to ensure all required fields exist
          const normalizedProject = {
            ...rawProjectData,
            id: rawProjectData.id || rawProjectData._id,
            name: rawProjectData.name || rawProjectData.title || 'Untitled Project',
            assignedUsers: rawProjectData.assignedUsers || [],
            totalTasks: rawProjectData.totalTasks || 0,
            completedTasks: rawProjectData.completedTasks || 0,
            status: rawProjectData.status || 'active',
            language: rawProjectData.language || 'Unknown',
            languageCode: rawProjectData.languageCode || rawProjectData.language?.toLowerCase().slice(0, 2) || 'en',
            description: rawProjectData.description || 'No description available',
            createdBy: rawProjectData.createdBy || 'Unknown',
            createdAt: rawProjectData.createdAt || new Date().toISOString(),
            updatedAt: rawProjectData.updatedAt || new Date().toISOString()
          };
          
          console.log('🔧 PROJECT DETAIL: Normalized project data:', normalizedProject);
          setProject(normalizedProject);
          
          // Load real tasks for this project
          console.log('📋 PROJECT DETAIL: Loading tasks for project...');
          try {
            const tasksResponse = await taskService.getProjectTasks(projectId);
            if (tasksResponse.success && tasksResponse.data) {
              const tasksData = tasksResponse.data.tasks || [];
              console.log('✅ PROJECT DETAIL: Tasks loaded:', tasksData);
              
              // Normalize tasks data
              const normalizedTasks = Array.isArray(tasksData) ? tasksData.map((task: any) => ({
                ...task,
                id: task.id || task._id,
                projectId: task.projectId || task.project || projectId,
                title: task.title || 'Untitled Task',
                type: task.type || 'read-only',
                description: task.description || '',
                prompts: task.prompts || [],
                assignedTo: task.assignedTo || [],
                status: task.status || 'not-started',
                estimatedDuration: task.estimatedDuration || 0,
                createdAt: task.createdAt || new Date().toISOString(),
                updatedAt: task.updatedAt || new Date().toISOString()
              })) : [];
              
              setTasks(normalizedTasks);
            } else {
              console.log('❌ PROJECT DETAIL: Failed to load tasks, using empty array');
              setTasks([]);
            }
          } catch (tasksError) {
            console.error('❌ PROJECT DETAIL: Tasks loading error:', tasksError);
            setTasks([]);
          }
          
          // Load users for assignment (only for admin/student roles)
          if (currentUser && ['admin', 'student'].includes(currentUser.role)) {
            console.log('👥 PROJECT DETAIL: Loading users for assignment (admin/student)...');
            try {
              const usersResponse = await userService.getAllUsers();
              if (usersResponse.success && usersResponse.data) {
                const usersData = usersResponse.data.users || usersResponse.data || [];
                console.log('✅ PROJECT DETAIL: Users loaded:', usersData);
                
                // Normalize users data
                const normalizedUsers = Array.isArray(usersData) ? usersData.map((user: any) => ({
                  ...user,
                  id: user.id || user._id,
                  name: user.name || 'Unknown User',
                  email: user.email || '',
                  role: user.role || 'student'
                })) : [];
                
                setUsers(normalizedUsers);
              } else {
                console.log('❌ PROJECT DETAIL: Failed to load users from API');
                setUsers([]);
              }
            } catch (usersError) {
              console.error('❌ PROJECT DETAIL: Users loading error:', usersError);
              setUsers([]);
              // Don't set error for participants who can't access users
            }
          } else {
            console.log('👤 PROJECT DETAIL: Participant role - skipping user loading');
            setUsers([]);
          }
        } else {
          console.log('❌ PROJECT DETAIL: Failed to load project:', response.error);
          setProject(null);
          setTasks([]);
          setUsers([]);
          setError('Failed to load project data');
        }
      } catch (error: any) {
        console.error('❌ PROJECT DETAIL: Error loading project:', error);
        setError('Failed to load project details');
        setProject(null);
        setTasks([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [projectId]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon sx={{ color: 'success.main' }} />;
      case 'in-progress':
        return <InProgressIcon sx={{ color: 'warning.main' }} />;
      case 'not-started':
        return <NotStartedIcon sx={{ color: 'text.disabled' }} />;
      default:
        return <NotStartedIcon sx={{ color: 'text.disabled' }} />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'not-started':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleEditProject = () => {
    // Navigate to project edit page with current project data
    console.log('Edit project clicked');
    if (project && projectId) {
      navigate(`/projects/${projectId}/edit`, { 
        state: { project } 
      });
    } else {
      console.error('No project data available for editing');
    }
  };

  const handleDeleteProject = () => {
    setDeleteDialog(true);
  };

  const confirmDeleteProject = async () => {
    try {
      setLoading(true);
      console.log('🗑️ FRONTEND: Starting project deletion...');
      
      const { projectService } = await import('@/services/projectService');
      const projectId = project?.id || project?._id;
      
      if (!projectId) {
        console.error('❌ No project ID available for deletion');
        setError('Cannot delete project: No ID found');
        return;
      }

      console.log('🗑️ FRONTEND: Deleting project with ID:', projectId);
      const response = await projectService.deleteProject(projectId);
      
      console.log('📥 FRONTEND: Delete response:', response);
      
      if (response.success) {
        console.log('✅ FRONTEND: Project deleted successfully');
        setDeleteDialog(false);
        navigate('/projects', { 
          state: { 
            message: `Project "${project?.name || project?.title || 'Untitled'}" deleted successfully` 
          }
        });
      } else {
        console.error('❌ FRONTEND: Failed to delete project:', response.error);
        setError(response.error || 'Failed to delete project');
      }
    } catch (error: any) {
      console.error('❌ FRONTEND: Exception during project deletion:', error);
      setError('Failed to delete project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUser = () => {
    // Navigate to user assignment page for this project
    console.log('Assign user clicked');
    if (project && projectId) {
      navigate(`/projects/${projectId}/assign-users`, { 
        state: { 
          project,
          availableUsers: users 
        } 
      });
    } else {
      console.error('No project data available for user assignment');
    }
  };



  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading project details...
        </Typography>
      </Container>
    );
  }

  if (error || !project) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Project not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects')}
        >
          Back to Projects
        </Button>
      </Container>
    );
  }

  const progressPercentage = project.totalTasks > 0 
    ? Math.round((project.completedTasks / project.totalTasks) * 100) 
    : 0;

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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: { xs: 3, sm: 4 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => navigate('/projects')}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'background.default' },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: '1.5rem', sm: '2rem' },
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {project.name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Project {project.id}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditProject}
            sx={{
              borderRadius: { xs: 2, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteProject}
            sx={{
              borderRadius: { xs: 2, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Project Overview Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: { xs: 2, sm: 2 },
              background: 'linear-gradient(145deg, #e3f2fd 0%, #bbdefb 100%)',
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
              <TaskIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  fontWeight: 700,
                  color: '#1976d2',
                }}
              >
                {project.totalTasks}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Total Tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: { xs: 2, sm: 2 },
              background: 'linear-gradient(145deg, #e8f5e8 0%, #c8e6c9 100%)',
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
              <CompletedIcon sx={{ fontSize: 40, color: '#388e3c', mb: 1 }} />
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  fontWeight: 700,
                  color: '#388e3c',
                }}
              >
                {project.completedTasks}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: { xs: 2, sm: 2 },
              background: 'linear-gradient(145deg, #fff3e0 0%, #ffe0b2 100%)',
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
              <ProgressIcon sx={{ fontSize: 40, color: '#f57c00', mb: 1 }} />
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  fontWeight: 700,
                  color: '#f57c00',
                }}
              >
                {progressPercentage}%
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: { xs: 2, sm: 2 },
              background: 'linear-gradient(145deg, #fce4ec 0%, #f8bbd9 100%)',
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
              <GroupIcon sx={{ fontSize: 40, color: '#c2185b', mb: 1 }} />
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  fontWeight: 700,
                  color: '#c2185b',
                }}
              >
                {project.assignedUsers?.length || 0}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Assigned Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progress Bar */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: { xs: 2, sm: 2 },
          mb: 4,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Overall Progress
          </Typography>
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
            {progressPercentage}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressPercentage}
          sx={{
            height: 12,
            borderRadius: 6,
            backgroundColor: 'rgba(0,0,0,0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 6,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {project.completedTasks} of {project.totalTasks} tasks completed
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {project.totalTasks - project.completedTasks} remaining
          </Typography>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper
        sx={{
          borderRadius: { xs: 2, sm: 2 },
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
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
            <Tab label="Overview" />
            <Tab label="Tasks" />
            {currentUser && ['admin', 'student'].includes(currentUser.role) && (
              <>
                <Tab label="Team" />
                <Tab label="Settings" />
              </>
            )}
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {/* Overview Tab */}
          <Box sx={{ px: { xs: 2, sm: 3 } }}>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12} md={8}>
                <Card
                  sx={{
                    borderRadius: { xs: 2, sm: 2 },
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      📋 Project Details
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 3,
                        lineHeight: 1.6,
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                      }}
                    >
                      {project.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LanguageIcon color="action" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Language
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              {project.language}
                            </Typography>
                            <Chip
                              label={project.languageCode.toUpperCase()}
                              size="small"
                              sx={{ fontSize: '0.75rem', height: 20 }}
                            />
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <ScheduleIcon color="action" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Created
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>

                      {project.dueDate && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <ScheduleIcon color="action" />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Due Date
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(project.dueDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <PersonIcon color="action" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Status
                          </Typography>
                          <Chip
                            label={project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            size="small"
                            color={project.status === 'active' ? 'success' : 'default'}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    borderRadius: { xs: 2, sm: 2 },
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      📊 Task Statistics
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Completed Tasks</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                          {tasks.filter(t => t.status === 'completed').length}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">In Progress</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>
                          {tasks.filter(t => t.status === 'in-progress').length}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Not Started</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                          {tasks.filter(t => t.status === 'not-started').length}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Total Estimated Time
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {tasks.reduce((sum, task) => sum + task.estimatedDuration, 0)} min
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {/* Tasks Tab */}
          <Box sx={{ px: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
              >
                Project Tasks ({tasks.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/projects/${projectId}/tasks/create`)}
                sx={{
                  borderRadius: { xs: 2, sm: 1.5 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                Add Task
              </Button>
            </Box>

            <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
              {tasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  <ListItem
                    sx={{
                      py: 2,
                      px: 3,
                      '&:hover': { bgcolor: 'background.default' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
                      {getStatusIcon(task.status)}
                    </Box>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        }}
                      >
                        {task.title}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            mb: 1,
                          }}
                        >
                          {task.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={task.type}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                          <Chip
                            label={`${task.estimatedDuration} min`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                          <Chip
                            label={task.status}
                            size="small"
                            color={getStatusColor(task.status) as any}
                            sx={{ fontSize: '0.75rem' }}
                          />
                          <Chip
                            label={`${task.assignedTo.length} assigned`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        <StartIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < tasks.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {tasks.length === 0 && (
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: 'background.default',
                  borderRadius: 2,
                }}
              >
                <TaskIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Tasks Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Add tasks to organize your project work
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate(`/projects/${projectId}/tasks/create`)}
                >
                  Create First Task
                </Button>
              </Paper>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {/* Team Tab */}
          {currentUser && ['admin', 'student'].includes(currentUser.role) ? (
          <Box sx={{ px: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
              >
                Assigned Team ({project.assignedUsers?.length || 0})
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAssignUser}
                sx={{
                  borderRadius: { xs: 2, sm: 1.5 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                Assign User
              </Button>
            </Box>

            <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
              {(project.assignedUsers || []).map((userId, index) => {
                const user = users.find(u => u.id === userId);
                if (!user) return null;

                return (
                  <React.Fragment key={userId}>
                    <ListItem sx={{ py: 2, px: 3 }}>
                      <Avatar
                        sx={{
                          mr: 2,
                          bgcolor: 'primary.main',
                          width: 40,
                          height: 40,
                        }}
                      >
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                          }}
                        >
                          {user.name}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            {user.email}
                          </Typography>
                          <Chip
                            label={user.role}
                            size="small"
                            sx={{ mt: 0.5, fontSize: '0.75rem' }}
                          />
                        </Box>
                      </Box>
                      
                      <ListItemSecondaryAction>
                        <IconButton edge="end" size="small">
                          <MoreIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < (project.assignedUsers?.length || 0) - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>

            {(project.assignedUsers?.length || 0) === 0 && (
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: 'background.default',
                  borderRadius: 2,
                }}
              >
                <GroupIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Users Assigned
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Assign users to collaborate on this project
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAssignUser}
                >
                  Assign Users
                </Button>
              </Paper>
            )}
          </Box>
          ) : (
            <Box sx={{ px: { xs: 2, sm: 3 }, textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Team Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Team assignment is only available for administrators and project creators.
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {/* Settings Tab */}
          <Box sx={{ px: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: 600, fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
            >
              Project Settings
            </Typography>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              Project settings functionality coming soon...
            </Alert>
          </Box>
        </TabPanel>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the project "{project.name}"? 
            This action cannot be undone and will permanently remove all tasks and data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={confirmDeleteProject}
            color="error"
            variant="contained"
          >
            Delete Project
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};