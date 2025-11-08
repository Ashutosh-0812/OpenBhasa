import React from 'react';
import { LinearProgress, Box, Typography } from '@mui/material';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
  height?: number;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercentage = true,
  color = 'primary',
  height = 6,
  animated = false,
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      {(label || showPercentage) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          {label && (
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          )}
          {showPercentage && (
            <Typography variant="body2" color="text.secondary">
              {Math.round(value)}%
            </Typography>
          )}
        </Box>
      )}
      
      <LinearProgress
        variant="determinate"
        value={Math.min(Math.max(value, 0), 100)}
        color={color}
        sx={{
          height,
          borderRadius: height / 2,
          backgroundColor: 'grey.200',
          '& .MuiLinearProgress-bar': {
            borderRadius: height / 2,
            transition: animated ? 'transform 0.5s ease-in-out' : 'none',
          },
        }}
      />
    </Box>
  );
};