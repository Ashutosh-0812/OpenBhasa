import React from 'react';
import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import { Prompt, TaskType } from '@/types';

interface PromptPanelProps {
  prompt: Prompt;
  taskType: TaskType;
  promptNumber: number;
  totalPrompts: number;
}

export const PromptPanel: React.FC<PromptPanelProps> = ({
  prompt,
  taskType,
  promptNumber,
  totalPrompts,
}) => {
  const renderPromptContent = () => {
    switch (taskType) {
      case 'read-only':
        return (
          <Box>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1.125rem',
                lineHeight: 1.6,
                color: 'text.primary',
                textAlign: 'center',
                fontWeight: 400,
              }}
            >
              {prompt.text}
            </Typography>
          </Box>
        );

      case 'conversational':
        return (
          <Box>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={prompt.speaker === 'user' ? 'Your turn' : 'System'}
                color={prompt.speaker === 'user' ? 'primary' : 'default'}
                size="small"
                sx={{ mb: 1 }}
              />
            </Box>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1rem',
                lineHeight: 1.5,
                color: 'text.primary',
                fontStyle: prompt.speaker === 'system' ? 'italic' : 'normal',
              }}
            >
              {prompt.text}
            </Typography>
          </Box>
        );

      case 'continuous':
        return (
          <Box>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1rem',
                lineHeight: 1.8,
                color: 'text.primary',
                textAlign: 'justify',
              }}
            >
              {prompt.text}
            </Typography>
          </Box>
        );

      default:
        return (
          <Typography variant="body1">
            {prompt.text}
          </Typography>
        );
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Current Prompt Indicator */}
      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          Current Prompt
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'primary.main',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          Read the following text carefully
        </Typography>
      </Box>

      {/* Prompt Content Card */}
      <Card
        sx={{
          backgroundColor: 'grey.50',
          border: '2px dashed',
          borderColor: 'grey.300',
          borderRadius: 3,
          minHeight: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CardContent sx={{ p: 3, textAlign: 'center', width: '100%' }}>
          {renderPromptContent()}

          {/* Prompt Progress */}
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
              }}
            >
              Prompt {promptNumber} of {totalPrompts}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Task Type Specific Instructions */}
      {taskType === 'continuous' && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              fontStyle: 'italic',
            }}
          >
            Read continuously without pausing
          </Typography>
        </Box>
      )}
    </Box>
  );
};