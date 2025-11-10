import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Box, 
  Grid, 
  Typography, 
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { User, Project } from '@/types';
import { projectService } from '@/services/projectService';
import { taskService } from '@/services/taskService';

interface ProjectsPageProps {
  user: User;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const [message, setMessage] = useState<string>('');
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  
  // Separate projects into two categories
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  
  // DEBUG: Force empty projects to check if hardcoded data comes from elsewhere
  console.log('🔍 PROJECTS STATE DEBUG:', { 
    allProjectsLength: allProjects.length,
    myProjectsLength: myProjects.length,
    assignedProjectsLength: assignedProjects.length,
    allProjects: allProjects 
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Load projects data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 PROJECTS PAGE: Fetching projects...');
        console.log('🔄 PROJECTS PAGE: Current all projects state:', allProjects);
        
        const response = await projectService.getAllProjects();
        console.log('📥 PROJECTS PAGE: Service response:', response);
        
        if (response.success && response.data) {
          console.log('✅ PROJECTS PAGE: Projects loaded successfully:', response.data);
          // Handle different response formats
          const projectsData = response.data.projects || response.data || [];
          console.log('📋 PROJECTS PAGE: Extracted projects data:', projectsData);
          console.log('📋 PROJECTS PAGE: Is array?', Array.isArray(projectsData));
          
          const validProjectsData = Array.isArray(projectsData) ? projectsData : [];
          setAllProjects(validProjectsData);
          
          // Categorize projects based on user relationship
          const myCreatedProjects = validProjectsData.filter((project: any) => {
            // Check if user created this project
            const createdByUser = project.createdBy === user.id || 
                                 project.createdBy === user.email ||
                                 project.createdBy === user.name ||
                                 (typeof project.createdBy === 'object' && 
                                  (project.createdBy?.id === user.id || 
                                   project.createdBy?.email === user.email));
            console.log('🔍 PROJECTS PAGE: Project created by user?', { 
              project: project.title || project.name, 
              createdBy: project.createdBy, 
              user: user.email, 
              isCreator: createdByUser 
            });
            return createdByUser;
          });
          
          let assignedToMeProjects = [];
          
          if (user.role === 'participant') {
            // For participants, the backend already filters to only show assigned projects
            // So all returned projects are "assigned" projects for participants
            console.log('🎯 PROJECTS PAGE: Participant - all returned projects are assigned projects');
            assignedToMeProjects = validProjectsData.filter((project: any) => {
              // Exclude projects created by this participant (if any)
              const isCreatedByMe = myCreatedProjects.some((myProject: any) => 
                (myProject._id || myProject.id) === (project._id || project.id)
              );
              console.log('🔍 PROJECTS PAGE: Participant project check:', {
                project: project.title || project.name,
                projectId: project._id || project.id,
                isCreatedByMe: isCreatedByMe,
                willBeAssigned: !isCreatedByMe
              });
              return !isCreatedByMe;
            });
          } else {
            // For other roles, check project assignment as before
            assignedToMeProjects = validProjectsData.filter((project: any) => {
              const assignedToUser = project.assignedUsers?.includes(user.id) ||
                                     project.assignedUsers?.includes(user.email) ||
                                     project.participants?.includes(user.id) ||
                                     project.participants?.includes(user.email);
              console.log('🔍 PROJECTS PAGE: Project assigned to user?', { 
                project: project.title || project.name, 
                assignedUsers: project.assignedUsers, 
                user: user.email, 
                isAssigned: assignedToUser 
              });
              return assignedToUser && !myCreatedProjects.includes(project); // Exclude owned projects
            });
          }
          
          console.log('📊 PROJECTS PAGE: Categorized projects:', {
            total: validProjectsData.length,
            myProjects: myCreatedProjects.length,
            assignedProjects: assignedToMeProjects.length
          });
          
          setMyProjects(myCreatedProjects);
          setAssignedProjects(assignedToMeProjects);
          console.log('✅ PROJECTS PAGE: Projects state updated with categorized data');
        } else {
          console.log('⚠️ PROJECTS PAGE: No projects data or failed response:', response);
          // Fallback to empty array - no error for empty state
          setAllProjects([]);
          setMyProjects([]);
          setAssignedProjects([]);
          console.log('📋 PROJECTS PAGE: Set empty projects arrays');
        }
      } catch (err: any) {
        console.error('❌ PROJECTS PAGE: Failed to load projects:', err);
        setError('Failed to load projects. Working in offline mode.');
        setAllProjects([]); // Fallback to empty array
        setMyProjects([]);
        setAssignedProjects([]);
        console.log('📋 PROJECTS PAGE: Set empty projects due to error');
      } finally {
        setLoading(false);
        console.log('🏁 PROJECTS PAGE: Loading finished');
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    // Check if there's a success message from navigation state
    if (location.state && (location.state as any).message) {
      setMessage((location.state as any).message);
      // Clear the message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    }
  }, [location.state]);

  const handleProjectAction = (projectId: string) => {
    console.log(`Action on project ${projectId}`);
    
    // Role-based navigation
    const userRole = currentUser?.role || user?.role;
    
    if (userRole === 'participant') {
      // Participants go to project page for tasks/recording
      console.log(`Participant navigating to project tasks page for: ${projectId}`);
      navigate(`/project/${projectId}`);
    } else {
      // Admin/Student go to project detail page for management
      console.log(`${userRole} navigating to project detail page for: ${projectId}`);
      navigate(`/projects/${projectId}`);
    }
  };

  const handleCreateProject = () => {
    navigate('/projects/create');
  };



  return (
    <Box sx={{ pb: 2 }}>
      {/* Success Message */}
      {message && (
        <Alert
          severity="success"
          onClose={() => setMessage('')}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {message}
        </Alert>
      )}

      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box sx={{ textAlign: 'left' }}>
            <Typography
              variant="h5"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                mb: 0.5,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
              }}
            >
              Projects
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              {user.role === 'participant' 
                ? 'View and work on available recording tasks' 
                : 'Manage and participate in speech recording projects'
              }
            </Typography>
          </Box>

          {/* Create Project Button - Only for admin/student roles */}
          {(user.role === 'admin' || user.role === 'student') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateProject}
              sx={{
                bgcolor: '#1976d2',
                color: 'white',
                borderRadius: '8px',
                fontWeight: 600,
                px: 3,
                py: 1,
                fontSize: '0.875rem',
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                '&:hover': {
                  bgcolor: '#1565c0',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                },
              }}
            >
              Create Project
            </Button>
          )}
        </Box>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert
          severity="warning"
          onClose={() => setError(null)}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 8,
          }}
        >
          <CircularProgress size={40} />
          <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>
            Loading projects...
          </Typography>
        </Box>
      ) : (
        <Box>
          {/* Project Tabs - Different view for participants */}
          {user.role === 'participant' ? (
            // Participants only see available tasks, no tabs needed
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Available Tasks ({assignedProjects.length})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Recording tasks available for you to complete
              </Typography>
            </Box>
          ) : (
            // Students/Admins see tabs for project management
            <Box sx={{ mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1rem',
                  },
                }}
              >
                <Tab
                  label={
                    <Badge badgeContent={myProjects.length} color="primary">
                      My Projects
                    </Badge>
                  }
                />
                <Tab
                  label={
                    <Badge badgeContent={assignedProjects.length} color="secondary">
                      Assigned Projects  
                    </Badge>
                  }
                />
              </Tabs>
            </Box>
          )}

          {/* Tab Content */}
          {user.role === 'participant' ? (
            // Participants only see available tasks
            <Grid container spacing={2}>
              {assignedProjects.length > 0 ? (
                assignedProjects.map((project, index) => {
                  console.log('🎨 PROJECTS PAGE: Rendering participant task:', project);
                  return (
                    <Grid item xs={12} key={`task-${project.id || project._id}-${index}`}>
                      <ProjectCard
                        project={project}
                        onStartClick={handleProjectAction}
                        onContinueClick={handleProjectAction}
                      />
                    </Grid>
                  );
                })
              ) : (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 6,
                      color: 'text.secondary',
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      border: '1px dashed',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      No Tasks Available
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Check back later for new recording tasks!
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          ) : (
            // Students/Admins see project management tabs
            <>
              {activeTab === 0 && (
                <>
                  {/* My Projects Section */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Projects I Created ({myProjects.length})
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Projects that you have created and manage
                    </Typography>
                  </Box>
              
                  <Grid container spacing={2}>
                    {myProjects.length > 0 ? (
                      myProjects.map((project, index) => {
                        console.log('🎨 PROJECTS PAGE: Rendering my project:', project);
                        return (
                          <Grid item xs={12} key={`my-${project.id || project._id}-${index}`}>
                            <ProjectCard
                              project={project}
                              onStartClick={handleProjectAction}
                              onContinueClick={handleProjectAction}
                            />
                          </Grid>
                        );
                      })
                    ) : (
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            textAlign: 'center',
                            py: 6,
                            color: 'text.secondary',
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            border: '1px dashed',
                            borderColor: 'divider',
                          }}
                        >
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            No Projects Created Yet
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            Create your first project to get started!
                          </Typography>
                          {(user.role === 'admin' || user.role === 'student') && (
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={handleCreateProject}
                              sx={{ mt: 1 }}
                            >
                              Create Project
                            </Button>
                          )}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}

              {activeTab === 1 && (
                <>
                  {/* Assigned Projects Section */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Assigned to Me ({assignedProjects.length})
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Projects that have been assigned to you for participation
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {assignedProjects.length > 0 ? (
                      assignedProjects.map((project, index) => {
                        console.log('🎨 PROJECTS PAGE: Rendering assigned project:', project);
                        return (
                          <Grid item xs={12} key={`assigned-${project.id || project._id}-${index}`}>
                            <ProjectCard
                              project={project}
                              onStartClick={handleProjectAction}
                              onContinueClick={handleProjectAction}
                            />
                          </Grid>
                        );
                      })
                    ) : (
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            textAlign: 'center',
                            py: 6,
                            color: 'text.secondary',
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            border: '1px dashed',
                            borderColor: 'divider',
                          }}
                        >
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            No Assigned Projects
                          </Typography>
                          <Typography variant="body2">
                            No projects have been assigned to you yet.
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
            </>
          )}
        </Box>
      )}
    </Box>
  );
};