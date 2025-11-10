import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { 
  Inbox as InboxIcon,
} from '@mui/icons-material';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
}) => {
  const defaultIcon = <InboxIcon sx={{ fontSize: 64, color: 'text.disabled' }} />;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 3,
        textAlign: 'center',
        minHeight: '300px',
      }}
    >
      {icon || defaultIcon}
      
      <Typography
        variant="h6"
        sx={{
          mt: 2,
          mb: 1,
          fontWeight: 600,
          color: 'text.primary',
        }}
      >
        {title}
      </Typography>
      
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 3,
          maxWidth: '400px',
          lineHeight: 1.6,
        }}
      >
        {description}
      </Typography>

      {action && (
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button
            variant={action.variant || 'contained'}
            onClick={action.onClick}
            sx={{
              bgcolor: action.variant === 'contained' ? '#1976d2' : 'transparent',
              '&:hover': {
                bgcolor: action.variant === 'contained' ? '#1565c0' : 'rgba(25, 118, 210, 0.04)',
              },
            }}
          >
            {action.label}
          </Button>
          
          {secondaryAction && (
            <Button
              variant="text"
              onClick={secondaryAction.onClick}
              sx={{ color: 'text.secondary' }}
            >
              {secondaryAction.label}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};