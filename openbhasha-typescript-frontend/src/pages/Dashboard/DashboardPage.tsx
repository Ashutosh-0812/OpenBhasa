import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { 
  Mic as RecordingIcon,
  CheckCircle as VerifiedIcon,
  PeopleAlt as ParticipantsIcon,
  AccessTime as PendingIcon,
} from '@mui/icons-material';
import '@fontsource/poppins/700.css'; // Import Poppins Bold
// Removed StatCard and ProjectCard imports - using custom components for exact design match
import { User } from '@/types';
import { AdminDashboard } from '@/pages/Admin';
import { ReviewerDashboard } from '@/pages/Reviewer';
import { ParticipantDashboard } from '@/pages/Participants';
import { useDashboard } from '@/hooks/useDashboard';

interface DashboardPageProps {
  user: User;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  // Use the dashboard hook to get real data
  const { stats, projects, loading, error, refresh } = useDashboard();

  // Dashboard data is automatically loaded by the useDashboard hook

  // Render AdminDashboard for admin users
  if (user.role === 'admin') {
    return <AdminDashboard user={user} />;
  }

  // Render ReviewerDashboard for reviewer users
  if (user.role === 'reviewer') {
    return <ReviewerDashboard user={user} />;
  }

  // Render ParticipantDashboard for participant users
  if (user.role === 'participant') {
    return <ParticipantDashboard user={user} />;
  }

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
    console.log(`User ${user.name} clicked ${statType} stat`);
  };

  const handleProjectAction = (projectId: string) => {
    console.log(`Action on project ${projectId}`);
    // Navigate to project detail page
    navigate(`/projects/${projectId}`);
  };

  const handleViewAllProjects = () => {
    console.log('View all projects clicked');
    navigate('/projects');
  };

  return (
    <Box sx={{ 
      maxWidth: 390, 
      mx: 'auto', 
      bgcolor: '#FFFFFF', // White background as requested
      minHeight: '100vh',
      px: 2, // Content padding: 16px
    }}>
      {/* B) Section header */}
      <Box sx={{ pt: 1.5 }}> {/* 12px top spacing */}
        <Typography
          sx={{
            fontSize: '24px', // Poppins SemiBold 24px
            fontWeight: 600, // SemiBold = 600
            color: '#0A2E0E', // color: '#0A2E0E'
            mb: '8px', // mb: 8px
          }}
        >
          Statistics
        </Typography>
      </Box>

      {/* Stats boxes - Two vertical boxes with spacing */}
      <Box sx={{ mb: 2 }}> {/* Statistics section bottom margin */}
        {/* First Statistics Box */}
        <Box
          onClick={() => handleStatClick('recording')}
          sx={{
            minHeight: 112,
            p: 2,
            borderRadius: '20px',
            bgcolor: '#D7E8D5', // Statistics box color as requested
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
              Recording
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <VerifiedIcon sx={{ fontSize: 24, color: 'primary.main' }} />
            <Typography sx={{ 
              fontSize: 32,
              fontWeight: 800,
              color: 'primary.main',
              mt: 0.5,
              lineHeight: 1,
            }}>
              {stats?.totalInvitesSent || 0}
            </Typography>
            <Typography sx={{ 
              fontSize: 14,
              fontWeight: 600,
              color: 'primary.main',
              mt: 0.25,
            }}>
              Verified
            </Typography>
          </Box>
        </Box>

        {/* Second Statistics Box */}
        <Box
          onClick={() => handleStatClick('participants')}
          sx={{
            minHeight: 112,
            p: 2,
            borderRadius: '20px',
            bgcolor: '#D7E8D5', // Statistics box color as requested
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
            <ParticipantsIcon sx={{ fontSize: 24, color: 'primary.main' }} />
            <Typography sx={{ 
              fontSize: 32,
              fontWeight: 800,
              color: 'primary.main',
              mt: 0.5,
              lineHeight: 1,
            }}>
              {stats?.activeParticipants || 0}
            </Typography>
            <Typography sx={{ 
              fontSize: 14,
              fontWeight: 600,
              color: 'primary.main',
              mt: 0.25,
            }}>
              Participants
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

      {/* D) Greeting message */}
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

      {/* "Projects" header row */}
      <Box sx={{ mb: 1.5 }}> {/* "Projects" → first card: 12px */}
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
              Recent Projects
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: '12px',
                color: 'text.secondary',
                fontWeight: 400,
              }}
            >
              Your latest 2 projects
            </Typography>
          </Box>
          {/* Right "View All": fontSize 14, fontWeight 700, color primary.main */}
          <Button
            variant="text"
            size="small"
            onClick={handleViewAllProjects}
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

        {/* Gray divider line below Projects heading */}
        <Box
          sx={{
            height: '2px',
            bgcolor: 'rgba(0,0,0,0.20)',
            mb: 4, // 12px spacing below the line
          }}
        />

        {/* Project Cards - showing 2 most recent projects */}
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
              No projects yet
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '12px',
              }}
            >
              Create or get assigned to projects to see them here
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
            .slice(0, 2)
            .map((project, index) => {
          const isStarted = project.completedTasks > 0;
          const progressPercentage = project.totalTasks > 0 
            ? Math.round((project.completedTasks / project.totalTasks) * 100) 
            : 0;
            
          return (
            <Box
              key={`${project.id}-${index}`}
              sx={{
                bgcolor: 'rgba(215, 232, 213, 1)', // Updated background color
                borderRadius: '20px', // 20px radius
                p: 3, // 24px padding for more spaciousness
                boxShadow: 2, // Soft shadow
                mb: 3, // Card spacing: 12px between cards
              }}
            >
              {/* Meta row */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2, // Increased gap after meta row
              }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: 'text.secondary', // subtitle2: 12px (project meta)
                    fontSize: '12px',
                  }}
                >
                  {project.id || project._id || 'No ID'}
                </Typography>
                {/* Language Chip: size='small', color='primary', variant='filled', sx={{ color: '#fff' }} */}
                <Box
                  sx={{
                    height: 26, // Chip: height 26, borderRadius 9999, paddingInline 12, fontWeight 700
                    borderRadius: '9999px',
                    px: 1.5, // 12px horizontal padding
                    bgcolor: '#126801',
                    color: '#fff', // White text as specified
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5, // 4px spacing between icon and text
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  <Box
                    component="img"
                    src="/language (1).svg" 
                    alt="Language"
                    sx={{
                      width: '14px',
                      height: '14px',
                      // filter: 'invert(1)', // Make SVG white to match text color
                    }}
                  />
                  {project.language}
                </Box>
              </Box>
              
              {/* Title: fontSize 18, fontWeight 700, lineHeight 1.25, mt 1 */}
              <Typography 
                sx={{ 
                  fontSize: '18px',
                  fontWeight: 700,
                  lineHeight: 1.25,
                  color: 'text.primary',
                  mb: 1.5, // Increased gap after title
                }}
              >
                {project.name || project.title || 'Untitled Project'}
              </Typography>
              
              {/* Gray divider line below project title */}
              <Box
                sx={{
                  height: '2px',
                  bgcolor: 'rgba(0,0,0,0.20)',
                  mb: 2, // Increased gap after divider line
                }}
              />
              
              {/* Progress row (on one line, percentage right) */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 2, // Increased gap after progress row
              }}>
                {/* Left label: fontSize 13, fontWeight 600 */}
                <Typography sx={{ 
                  fontSize: '13px', 
                  fontWeight: 600,
                  color: 'text.secondary',
                }}>
                  {project.completedTasks}/{project.totalTasks} Completed
                </Typography>
                {/* Right percent: fontSize 13, fontWeight 700, color primary.main */}
                <Typography sx={{ 
                  fontSize: '13px', 
                  fontWeight: 700, 
                  color: 'primary.main',
                }}>
                  {progressPercentage}%
                </Typography>
              </Box>
              
              {/* Continue button: variant='contained', color='primary', fullWidth, sx={{ mt: 1.5, height: 44, borderRadius: 9999 }} */}
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleProjectAction(project.id || project._id)}
                sx={{
                  mt: 1.5,
                  height: 44,
                  borderRadius: '9999px', // Pill shape
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  bgcolor: '#126801',
                  color: '#fff',
                  '&:hover': {
                    bgcolor: '#0F5815', // Darker shade for hover
                  },
                }}
              >
                {isStarted ? 'Continue' : 'Start'}
              </Button>
            </Box>
          );
        })
        )}
      </Box>
    </Box>
  );
};