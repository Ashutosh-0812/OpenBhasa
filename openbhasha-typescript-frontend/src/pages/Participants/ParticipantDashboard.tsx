import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { 
  Mic as RecordingIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Assignment as TaskIcon,
} from '@mui/icons-material';
import '@fontsource/poppins/700.css'; // Import Poppins Bold
import { User } from '@/types';
import { useDashboard } from '@/hooks/useDashboard';

interface ParticipantDashboardProps {
  user: User;
}

export const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({ user }) => {
  // Use the dashboard hook to get real data
  const { stats, projects, loading, error, refresh } = useDashboard();
  const navigate = useNavigate();

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" action={
          <Button onClick={refresh} size="small">
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }
  
  // Handle stat card clicks
  const handleStatClick = (statType: string) => {
    console.log(`Participant ${user.name} clicked ${statType} stat`);
  };

  const handleTaskAction = (taskId: string) => {
    console.log(`Action on task ${taskId}`);
    // Navigate to task detail page
    navigate(`/tasks/${taskId}`);
  };

  const handleViewAllTasks = () => {
    console.log('View all tasks clicked');
    navigate('/tasks');
  };

  return (
    <Box sx={{ 
      maxWidth: 390, 
      mx: 'auto', 
      bgcolor: '#FFFFFF', // White background
      minHeight: '100vh',
      px: 2, // Content padding: 16px
    }}>
      {/* Section header */}
      <Box sx={{ pt: 1.5 }}> {/* 12px top spacing */}
        <Typography
          sx={{
            fontSize: '24px', // Poppins SemiBold 24px
            fontWeight: 600, // SemiBold = 600
            color: '#0A2E0E', // color: '#0A2E0E'
            mb: '8px', // mb: 8px
          }}
        >
          My Progress
        </Typography>
      </Box>

      {/* Stats boxes - Two vertical boxes with spacing */}
      <Box sx={{ mb: 2 }}> {/* Statistics section bottom margin */}
        {/* First Statistics Box - Recording & Completed */}
        <Box
          onClick={() => handleStatClick('recording')}
          sx={{
            minHeight: 112,
            p: 2,
            borderRadius: '20px',
            bgcolor: '#D7E8D5', // Statistics box color
            border: '1.5px solid rgba(0,0,0,0.17)', // Very light gray border
            boxShadow: '0 6px 18px rgba(19,110,27,0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            cursor: 'pointer',
            mb: 6, // Vertical spacing between boxes
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <RecordingIcon sx={{ fontSize: 24, color: 'primary.main' }} />
            <Typography sx={{ 
              fontSize: 32,
              fontWeight: 800, 
              color: 'primary.main',
              mt: 0.5,
              lineHeight: 1,
            }}>
              {stats?.completedRecordings || 0}
            </Typography>
            <Typography sx={{ 
              fontSize: 14,
              fontWeight: 600,
              color: 'primary.main',
              mt: 0.25,
            }}>
              Recordings
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CompletedIcon sx={{ fontSize: 24, color: 'primary.main' }} />
            <Typography sx={{ 
              fontSize: 32,
              fontWeight: 800,
              color: 'primary.main',
              mt: 0.5,
              lineHeight: 1,
            }}>
              {stats?.approvedRecordings || 0}
            </Typography>
            <Typography sx={{ 
              fontSize: 14,
              fontWeight: 600,
              color: 'primary.main',
              mt: 0.25,
            }}>
              Completed
            </Typography>
          </Box>
        </Box>

        {/* Second Statistics Box - Tasks & Pending */}
        <Box
          onClick={() => handleStatClick('tasks')}
          sx={{
            minHeight: 112,
            p: 2,
            borderRadius: '20px',
            bgcolor: '#D7E8D5', // Statistics box color
            border: '1.5px solid rgba(0,0,0,0.17)', // Very light gray border
            boxShadow: '0 6px 18px rgba(19,110,27,0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <TaskIcon sx={{ fontSize: 24, color: 'primary.main' }} />
            <Typography sx={{ 
              fontSize: 32,
              fontWeight: 800,
              color: 'primary.main',
              mt: 0.5,
              lineHeight: 1,
            }}>
              {stats?.totalTasks || 0}
            </Typography>
            <Typography sx={{ 
              fontSize: 14,
              fontWeight: 600,
              color: 'primary.main',
              mt: 0.25,
            }}>
              Tasks
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PendingIcon sx={{ fontSize: 24, color: 'primary.main' }} />
            <Typography sx={{ 
              fontSize: 32,
              fontWeight: 800,
              color: 'primary.main',
              mt: 0.5,
              lineHeight: 1,
            }}>
              {stats?.pendingReviews || 0}
            </Typography>
            <Typography sx={{ 
              fontSize: 14,
              fontWeight: 600,
              color: 'primary.main',
              mt: 0.25,
            }}>
              Pending
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Greeting message */}
      <Typography
        sx={{
          fontSize: '26px', // Poppins Bold 26px
          fontWeight: 700, // Bold weight
          color: '#126801', // Color: #126801
          textAlign: 'center',
          mt: '40px', // Increased top vertical margin
          mb: '25px',
        }}
      >
        ಶುಭ ಸ್ವಾಗತಮ್ ಅಭಿವೃದ್ಧಿ!!
      </Typography>

      {/* "Available Tasks" header row */}
      <Box sx={{ mb: 1.5 }}> {/* "Tasks" → first card: 12px */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1.5, // Header to first card: 12px
          }}
        >
          {/* Left Typography: variant='h6' */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontSize: '24px', // h6: 18px, weight 700
                fontWeight: 600,
                color: 'text.primary',
              }}
            >
              Available Tasks
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: '12px',
                color: 'text.secondary',
                fontWeight: 400,
              }}
            >
              Your latest tasks to complete
            </Typography>
          </Box>
          {/* Right "View All": fontSize 14, fontWeight 700, color primary.main */}
          <Button
            variant="text"
            size="small"
            onClick={handleViewAllTasks}
            sx={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#126801',
              textTransform: 'none',
              p: 0,
              minWidth: 'auto',
            }}
          >
            View All
          </Button>
        </Box>

        {/* Gray divider line below Tasks heading */}
        <Box
          sx={{
            height: '2px',
            bgcolor: 'rgba(0,0,0,0.20)',
            mb: 4, // 12px spacing below the line
          }}
        />

        {/* Task Cards - showing available tasks */}
        {(projects || []).length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              px: 2,
              bgcolor: 'rgba(0,0,0,0.02)',
              borderRadius: '12px',
              border: '1px dashed rgba(0,0,0,0.2)',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                mb: 1,
                fontWeight: 500,
              }}
            >
              No tasks available
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '12px',
              }}
            >
              Check back later for new recording tasks
            </Typography>
          </Box>
        ) : (
          (projects || [])
            .sort((a, b) => {
              // Sort by updatedAt first, then createdAt, most recent first
              const dateA = new Date(a.updatedAt || a.createdAt || 0);
              const dateB = new Date(b.updatedAt || b.createdAt || 0);
              return dateB.getTime() - dateA.getTime();
            })
            .slice(0, 3) // Show only first 3 tasks
            .map((project, index) => (
              <Box
                key={project.id || index}
                onClick={() => handleTaskAction(project.id || '')}
                sx={{
                  bgcolor: '#FFFFFF',
                  border: '1.5px solid rgba(0,0,0,0.15)',
                  borderRadius: '16px',
                  p: 2.5,
                  mb: 2.5, // 20px spacing between cards
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                  },
                }}
              >
                {/* Project header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'text.primary',
                      lineHeight: 1.2,
                    }}
                  >
                    {project.title || 'Recording Task'}
                  </Typography>
                  
                  <Box
                    sx={{
                      bgcolor: project.status === 'active' ? '#E8F5E8' : '#FFF3E0',
                      color: project.status === 'active' ? '#2E7D32' : '#F57C00',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {project.status || 'Available'}
                  </Box>
                </Box>

                {/* Project description */}
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: 'text.secondary',
                    mb: 1.5,
                    lineHeight: 1.4,
                  }}
                >
                  {project.description || 'Complete audio recording task in your native language'}
                </Typography>

                {/* Project details */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography
                    sx={{
                      fontSize: '12px',
                      color: 'text.secondary',
                      fontWeight: 500,
                    }}
                  >
                    Language: {project.language || 'Multiple'}
                  </Typography>
                  
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'primary.main',
                    }}
                  >
                    Start Recording →
                  </Typography>
                </Box>
              </Box>
            ))
        )}
      </Box>
    </Box>
  );
};
