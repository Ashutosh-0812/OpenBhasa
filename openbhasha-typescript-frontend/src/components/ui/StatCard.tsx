import React from 'react';
import { Card as MuiCard, CardContent, Box, Typography } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'error';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  onClick,
}) => {
  const colorMap = {
    primary: 'primary.main',
    success: 'success.main',
    warning: 'warning.main',
    info: 'info.main',
    error: 'error.main',
  };

  return (
    <MuiCard
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 2,
        } : {},
        minHeight: 112, // Exact specification: min-height 112px
        height: 112,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#E6F1E6', // Exact card color
        border: 'none', // No visible border as specified
        borderRadius: '20px', // Exact 20px radius
        padding: 0, // Remove default padding
        boxShadow: '0 6px 20px rgba(19, 110, 27, 0.10)', // Exact soft shadow
        '&:focus': {
          outline: '2px solid rgba(19, 110, 27, 0.4)',
          outlineOffset: '2px',
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ 
        textAlign: 'center', 
        padding: '16px 20px !important', // Exact padding specification, override MUI default
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 0, // No gap, controlled spacing via margins
      }}>
        {/* Icon positioned at top - exact 24px specification */}
        {icon && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 24, // Exact specification: 24px icons
              height: 24,
              color: '#136E1B', // Exact dark green color
              mb: '4px', // Minimal spacing between icon and number
              '& > svg': {
                width: 24,
                height: 24,
                fontSize: 24,
              },
            }}
          >
            {icon}
          </Box>
        )}
        
        {/* Large number - exact 32px specification */}
        <Typography
          variant="h2"
          sx={{
            fontSize: '32px', // Exact specification: 32px numbers
            fontWeight: 800, // Exact specification: 800 weight
            color: '#136E1B', // Exact dark green color
            lineHeight: 1,
            mb: '2px', // Minimal spacing between number and label
          }}
        >
          {value}
        </Typography>
        
        {/* Label at bottom - exact 14px specification */}
        <Typography
          variant="body2"
          sx={{
            color: '#136E1B', // Exact dark green color
            fontWeight: 600, // Exact specification: 600 weight for labels
            fontSize: '14px', // Exact specification: 14px labels
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        
        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </MuiCard>
  );
};