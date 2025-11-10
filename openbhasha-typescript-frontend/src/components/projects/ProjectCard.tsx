import React from 'react';
import { 
  Box, 
  Typography, 
  Button,
} from '@mui/material';
import '@fontsource/poppins/700.css'; // Import Poppins Bold
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onStartClick?: (projectId: string) => void;
  onContinueClick?: (projectId: string) => void;
  showProgress?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onStartClick,
  onContinueClick,
  showProgress = true,
}) => {
  // Debug: Log actual project structure
  console.log('🎯 PROJECT CARD: Project data:', project);
  const isStarted = project.completedTasks > 0;
  const progressPercentage = project.totalTasks > 0 
    ? Math.round((project.completedTasks / project.totalTasks) * 100) 
    : 0;

  const handleActionClick = () => {
    const projectId = project.id || project._id;
    if (!projectId) {
      console.error('Project ID not found:', project);
      return;
    }
    
    if (isStarted && onContinueClick) {
      onContinueClick(projectId);
    } else if (!isStarted && onStartClick) {
      onStartClick(projectId);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: 'rgba(215, 232, 213, 1)', // Updated background color
        borderRadius: '20px', // 20px radius
        p: 3, // 24px padding for more spaciousness
        border: '1.5px solid rgba(0,0,0,0.17)', // Light gray border
        boxShadow: 2, // Soft shadow
        mb: 1.5, // Card spacing: 12px between cards
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
        },
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

          <Box
            sx={{
              height: 26,
              borderRadius: '9999px',
              px: 1.5,
              bgcolor: '#126801',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '12px',
              fontWeight: 700,
              minWidth: 60,
            }}
          >
            <Box
              component="img"
              src="/language (1).svg" 
              alt="Language"
              sx={{
                width: '14px',
                height: '14px',
                filter: 'invert(1)',
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
        {showProgress && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 1,
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
        )}

        {/* Continue button: variant='contained', fullWidth, sx={{ mt: 1.5, height: 44, borderRadius: 9999 }} */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleActionClick}
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
};