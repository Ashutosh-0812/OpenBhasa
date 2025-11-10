import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { 
  ArrowBack as BackIcon,
  Info as InfoIcon 
} from '@mui/icons-material';

interface TaskHeaderProps {
  taskId: string;
  projectName: string;
  onBack: () => void;
  onInfo: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({
  taskId,
  projectName,
  onBack,
  onInfo,
  onSkip,
  showSkip = true,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Left: Back Button */}
      <IconButton
        onClick={onBack}
        sx={{ 
          minWidth: 44,
          minHeight: 44,
          mr: 1,
        }}
        aria-label="Go back"
      >
        <BackIcon />
      </IconButton>

      {/* Center: Task Info */}
      <Box sx={{ flex: 1, textAlign: 'center' }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: 'text.primary',
            mb: 0.5,
          }}
        >
          #{taskId}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.875rem',
          }}
        >
          {projectName}
        </Typography>
      </Box>

      {/* Right: Action Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={onInfo}
          sx={{ 
            minWidth: 44,
            minHeight: 44,
          }}
          aria-label="Task information"
        >
          <InfoIcon />
        </IconButton>

        {showSkip && onSkip && (
          <Box
            sx={{
              backgroundColor: 'primary.main',
              borderRadius: 2,
              px: 2,
              py: 1,
              minHeight: 36,
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={onSkip}
            role="button"
            tabIndex={0}
            aria-label="Skip current prompt"
            style={{ cursor: 'pointer' }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'white',
                fontWeight: 500,
                fontSize: '0.875rem',
              }}
            >
              Skip ≫
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};