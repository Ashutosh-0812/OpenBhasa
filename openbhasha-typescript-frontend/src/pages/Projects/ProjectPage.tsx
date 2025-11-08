import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { 
  Language as LanguageIcon,
} from '@mui/icons-material';
import '@fontsource/poppins/700.css'; // Import Poppins Bold
import { Project } from '@/types';
import { ProjectCard } from '@/components/projects/ProjectCard';

interface ProjectPageProps {
  projectId?: string;
  projectName?: string;
}



export const ProjectPage: React.FC<ProjectPageProps> = ({
  projectId: propProjectId,
  projectName: propProjectName
}) => {
  const navigate = useNavigate();
  const { projectId: routeProjectId } = useParams<{ projectId: string }>();
  
  // State for loading real data
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Use route parameter first, then props, then URL params
  const actualProjectId = routeProjectId || propProjectId || new URLSearchParams(window.location.search).get('projectId') || '';
  const actualProjectName = propProjectName || new URLSearchParams(window.location.search).get('projectName') || 'Project';

  // Load project and tasks data
  useEffect(() => {
    const loadProjectData = async () => {
      if (!actualProjectId) {
        setError('No project ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Dynamically import services to avoid issues
        const { projectService } = await import('@/services/projectService');
        const { taskService } = await import('@/services/taskService');

        console.log('🔄 PROJECT PAGE: Loading project data for ID:', actualProjectId);
        
        // Load project details
        const projectResponse = await projectService.getProject(actualProjectId);
        if (projectResponse.success && projectResponse.data) {
          const projectData = projectResponse.data.project || projectResponse.data;
          setProject(projectData);
          console.log('✅ PROJECT PAGE: Project loaded:', projectData);
        } else {
          setError('Failed to load project data');
          return;
        }

        // Load project tasks
        const tasksResponse = await taskService.getProjectTasks(actualProjectId);
        if (tasksResponse.success && tasksResponse.data) {
          const tasksData = tasksResponse.data.tasks || tasksResponse.data || [];
          setTasks(tasksData);
          console.log('✅ PROJECT PAGE: Tasks loaded:', tasksData);
        } else {
          console.log('⚠️ PROJECT PAGE: No tasks found for project');
          setTasks([]);
        }
      } catch (error) {
        console.error('❌ PROJECT PAGE: Error loading data:', error);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [actualProjectId]);
  
  const handleTaskClick = (taskId: string, taskName: string) => {
    console.log(`Navigate to task: ${taskId} - ${taskName}`);
    // Navigate to TaskPage with query parameters including project ID for back navigation
    const taskUrl = `/task?taskId=${taskId}&taskName=${encodeURIComponent(taskName)}&projectName=${encodeURIComponent(actualProjectName)}&projectId=${encodeURIComponent(actualProjectId)}`;
    navigate(taskUrl);
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ 
        maxWidth: 390, 
        mx: 'auto', 
        bgcolor: '#FFFFFF',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ 
        maxWidth: 390, 
        mx: 'auto', 
        bgcolor: '#FFFFFF',
        minHeight: '100vh',
        px: 2,
        pt: 2
      }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  // Show message if no project data
  if (!project) {
    return (
      <Box sx={{ 
        maxWidth: 390, 
        mx: 'auto', 
        bgcolor: '#FFFFFF',
        minHeight: '100vh',
        px: 2,
        pt: 2
      }}>
        <Alert severity="info">
          No project data found
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: 390, 
      mx: 'auto', 
      bgcolor: '#FFFFFF', // White background
      minHeight: '100vh',
      px: 2, // Increased padding: 16px
      pb: 10, // Bottom padding for fixed navigation
      pt: 2, // Add top padding since we removed the header
    }}>
      {/* Project ID - Project Name */}
      <Typography sx={{
        fontSize: '18px', // Increased font size
        fontWeight: 700, // Made bolder
        color: 'text.primary',
        mb: 3,
      }}>
        {actualProjectId.slice(-8)} - {project.title || project.name || actualProjectName}
      </Typography>

      {/* Project Details Section */}
      <Box sx={{
        bgcolor: '#E5EFE5', // Light green background
        borderRadius: '8px', // Consistent border radius
        border: '1.5px solid rgba(0,0,0,0.1)', 
        p: 4, // Increased padding for height
        mb: 3,
        position: 'relative',
        minHeight: '120px', // Increased card height
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', // Subtle drop shadow
      }}>
        {/* Language Chip */}
        <Box sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          height: 26,
          borderRadius: '9999px',
          px: 1.5,
          bgcolor: '#136E1B', // Deep green
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          fontSize: '12px',
          fontWeight: 700,
        }}>
          <LanguageIcon sx={{ fontSize: 14, color: '#fff' }} />
          {project.language || 'Unknown'}
        </Box>

        <Typography sx={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'text.primary',
          textAlign: 'center', // Center horizontally and vertically
        }}>
          {project.description || 'Project details'}
        </Typography>
      </Box>

      {/* All tasks Section */}
      <Typography sx={{
        fontSize: '16px', // Slightly smaller size
        fontWeight: 600, // Semibold
        color: 'text.primary',
        mb: 2,
        pb: 1,
        borderBottom: '1px solid #ddd', // Horizontal divider line
      }}>
        All tasks
      </Typography>

      {/* Task Cards */}
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <ProjectCard
            key={task._id || task.id}
            project={{
              id: task._id || task.id,
              name: task.title || task.name,
              description: task.description,
              language: project.language,
              languageCode: project.languageCode || project.language?.toLowerCase(),
              status: task.status || 'active',
              totalTasks: 1, // Each task is one unit
              completedTasks: task.completed ? 1 : 0,
              assignedUsers: task.assignedUsers || [],
              createdBy: task.createdBy || project.createdBy,
              createdAt: task.createdAt || new Date().toISOString(),
              updatedAt: task.updatedAt || new Date().toISOString(),
            }}
            onStartClick={(taskId) => handleTaskClick(taskId, task.title || task.name)}
            onContinueClick={(taskId) => handleTaskClick(taskId, task.title || task.name)}
            showProgress={true}
          />
        ))
      ) : (
        <Box sx={{
          textAlign: 'center',
          py: 4,
          px: 2,
          bgcolor: '#f5f5f5',
          borderRadius: 2,
          border: '1px solid #ddd'
        }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Tasks Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No tasks have been created for this project yet.
          </Typography>
        </Box>
      )}
    </Box>
  );
};