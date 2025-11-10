import React from 'react';
import { Box, Typography, Grid } from '@mui/material';

interface TaskStatsData {
  completed: number;
  minutes: number;
  skipped: number;
  remaining: number;
}

interface TaskProgressProps {
  stats: TaskStatsData;
}

export const TaskProgress: React.FC<TaskProgressProps> = ({ stats }) => {
  const statItems = [
    {
      label: 'Completed',
      value: stats.completed,
      color: 'success.main',
    },
    {
      label: 'Minutes',
      value: stats.minutes,
      color: 'info.main',
    },
    {
      label: 'Skipped',
      value: stats.skipped,
      color: 'warning.main',
    },
    {
      label: 'Remaining',
      value: stats.remaining,
      color: 'text.secondary',
    },
  ];

  return (
    <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
      <Grid container spacing={1}>
        {statItems.map((item, index) => (
          <Grid item xs={3} key={item.label}>
            <Box
              sx={{
                textAlign: 'center',
                py: 1.5,
                backgroundColor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: item.color,
                  mb: 0.5,
                }}
              >
                {item.value}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
              >
                {item.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};