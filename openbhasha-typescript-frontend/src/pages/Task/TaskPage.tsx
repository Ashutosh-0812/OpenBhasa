import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Alert, Snackbar } from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  Mic as MicIcon,
  Headphones as HeadphonesIcon,
  FastForward as FastForwardIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import '@fontsource/poppins/700.css';
import { EnhancedAudioRecorder } from '@/components/recording/EnhancedAudioRecorder';

interface TaskPageProps {
  taskId?: string;
  taskName?: string;
  projectName?: string;
}

export const TaskPage: React.FC<TaskPageProps> = ({
  taskId = '#Taskid',
  projectName = 'Project Name',
}) => {
  const navigate = useNavigate();

  // Get URL parameters if available
  const urlParams = new URLSearchParams(window.location.search);
  const urlTaskId = urlParams.get('taskId') || taskId;
  const urlProjectName = urlParams.get('projectName') || projectName;
  const urlProjectId = urlParams.get('projectId') || '#124';

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(30); // percent
  const [recordingSubmitted, setRecordingSubmitted] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);

  // Mock task data
  const taskStats = {
    completed: 0,
    minutes: 2,
    skipped: 0,
    remaining: 2,
  };

  const currentPrompt = 'Read the following text carefully';
  const promptText = 'Text';

  const handleBack = () => {
    navigate(-1);
  };

  const handleInfo = () => {
    const projectUrl = `/project?projectId=${encodeURIComponent(
      urlProjectId
    )}&projectName=${encodeURIComponent(urlProjectName)}`;
    navigate(projectUrl);
  };

  const handleSkip = () => {
    console.log('Skip task');
  };

  const handleRecord = () => {
    setShowRecorder(true);
  };

  const handleRecordingComplete = (audioBlob: Blob, duration: number) => {
    // Here you would typically upload the audio to your server
    console.log('Recording completed:', { audioBlob, duration });
    
    // Simulate API call
    setTimeout(() => {
      setRecordingSubmitted(true);
      setShowSuccessMessage(true);
      setShowRecorder(false);
      
      // Update task stats
      taskStats.completed += 1;
      taskStats.remaining -= 1;
    }, 1000);
  };

  const handleRecordingError = (error: string) => {
    console.error('Recording error:', error);
  };

  const handlePrevious = () => {
    console.log('Previous task');
  };

  const handleNext = () => {
    console.log('Next task');
  };

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
    console.log(isPlaying ? 'Pausing playback' : 'Starting playback');
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const pct = (clickX / rect.width) * 100;
    const clamped = Math.min(Math.max(pct, 0), 100);
    setPlaybackProgress(clamped);
  };

  return (
    <Box
      sx={{
        background: '#fff',
        maxWidth: '375px',
        margin: '0 auto',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Sticky Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: '#fff',
          padding: '8px 16px 0',
          marginX: '-16px',
        }}
      >
        {/* Top bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '48px',
          }}
        >
          <IconButton onClick={handleBack} sx={{ color: '#0F6B1E', p: 1 }}>
            <ArrowBackIcon />
          </IconButton>

          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '18px',
              lineHeight: 1.2,
              color: '#000',
            }}
          >
            {urlTaskId}
          </Typography>

          <IconButton onClick={handleInfo} sx={{ color: '#0F6B1E', p: 1 }}>
            <InfoIcon />
          </IconButton>
        </Box>

        {/* Project row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '6px',
            paddingBottom: '10px',
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '16px',
              color: '#000',
            }}
          >
            Projects ID - Project Name
          </Typography>

          <Button
            variant="contained"
            onClick={handleSkip}
            startIcon={<FastForwardIcon sx={{ fontSize: 14 }} />}
            sx={{
              background: '#0F6B1E',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '13px',
              lineHeight: 1,
              textTransform: 'none',
              '&:hover': {
                background: '#0D5A1A',
              },
            }}
          >
            Skip
          </Button>
        </Box>
      </Box>

      {/* Fixed Content Area - No Scrolling */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          padding: '0 16px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Stats card */}
        <Box
          sx={{
            background: '#D7E8D5',
            borderRadius: '12px',
            padding: '10px 12px 14px',
            marginTop: '10px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: '16px',
                  color: '#000',
                }}
              >
                {taskStats.completed}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#4B4B4B' }}>
                Completed
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: '16px',
                  color: '#000',
                }}
              >
                {taskStats.minutes}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#4B4B4B' }}>
                Minutes
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: '16px',
                  color: '#FF9800',
                }}
              >
                {taskStats.skipped}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#4B4B4B' }}>
                Skipped
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: '16px',
                  color: '#000',
                }}
              >
                {taskStats.remaining}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#4B4B4B' }}>
                Remaining
              </Typography>
            </Box>
          </Box>

          {/* Progress bar */}
          <Box
            sx={{
              height: '6px',
              background: '#D9D9D9',
              borderRadius: '9999px',
              marginTop: '10px',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: '55%',
                background: '#2F80ED',
                borderRadius: '9999px',
              }}
            />
          </Box>
        </Box>

        {/* Spacer */}
        <Box sx={{ height: '6px' }} />

        {/* Current Prompt card */}
        <Box
          sx={{
            background: '#DDEAD7',
            borderRadius: '14px',
            padding: '10px 12px 14px',
            marginTop: '14px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
            {/* Header row */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                <HeadphonesIcon sx={{ fontSize: 16, color: 'text.primary' }} />
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#000',
                  }}
                >
                  Current Prompt
                </Typography>
              </Box>
              <SettingsIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            </Box>

            {/* Subtitle */}
            <Typography sx={{ fontSize: '11px', color: '#5A5A5A', mt: 1 }}>
              {currentPrompt}
            </Typography>

            {/* Inner dashed box - Only this scrolls */}
            <Box
              sx={{
                background: '#F5F9F4',
                border: '1px dashed #447B47',
                borderRadius: '10px',
                flex: 1,
                mt: 1.5,
                overflowY: 'auto',
                p: 3,
                minHeight: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#242424',
                  textAlign: 'center',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {promptText}
              </Typography>
            </Box>

            {/* Enhanced Audio Recorder */}
            {showRecorder && (
              <Box sx={{ mt: 2 }}>
                <EnhancedAudioRecorder
                  onRecordingComplete={handleRecordingComplete}
                  onRecordingError={handleRecordingError}
                  maxDuration={180} // 3 minutes max
                />
              </Box>
            )}
        </Box>

        {/* give space so footer doesn't overlap */}
        {/* <Box sx={{ height: '90px' }} /> */}
      </Box>

      {/* Sticky Footer (global bottom) */}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 1000,
          background: '#fff',
          padding: '16px',
          borderTop: '1px solid #f0f0f0',
        }}
      >
        {/* Player strip */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            mb: 1.5,
          }}
        >
          {/* Play/Pause Button */}
          <IconButton
            onClick={handlePlayPause}
            sx={{
              color: '#000',
              p: 0,
              '&:hover': { bgcolor: 'transparent', color: '#333' },
            }}
          >
            {isPlaying ? (
              <PauseIcon sx={{ fontSize: 40 }} />
            ) : (
              <PlayArrowIcon sx={{ fontSize: 40 }} />
            )}
          </IconButton>

          {/* Player bar */}
          <Box
            onClick={handleProgressClick}
            sx={{
              flex: 1,
              height: '4px',
              background: '#DFDFDF',
              borderRadius: '9999px',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '4px',
                background: '#136E1B',
                borderRadius: '9999px',
                width: `${playbackProgress}%`,
                transition: 'width 0.1s ease',
              }}
            />
          </Box>

          {/* Timer */}
          <Typography
            sx={{
              fontSize: '0.8rem',
              fontWeight: 500,
              color: '#707070',
              textAlign: 'center',
            }}
          >
            0:00
          </Typography>
        </Box>

        {/* Record control bar */}
        <Box
          sx={{
            background: '#136E1B',
            borderRadius: '16px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
          }}
        >
          <IconButton onClick={handlePrevious} sx={{ color: '#fff', p: 1 }}>
            <SkipPreviousIcon sx={{ fontSize: 22 }} />
          </IconButton>

          <IconButton
            onClick={handleRecord}
            disabled={recordingSubmitted}
            sx={{
              width: '48px',
              height: '48px',
              background: recordingSubmitted 
                ? '#4CAF50' 
                : showRecorder 
                  ? '#FF9800' 
                  : '#D43131',
              borderRadius: '50%',
              color: '#fff',
              '&:hover': { 
                background: recordingSubmitted 
                  ? '#45a049' 
                  : showRecorder 
                    ? '#F57C00' 
                    : '#C12929' 
              },
              '&:disabled': {
                background: '#4CAF50',
                color: '#fff',
              },
            }}
          >
            {recordingSubmitted ? (
              <HeadphonesIcon sx={{ fontSize: 24 }} />
            ) : (
              <MicIcon sx={{ fontSize: 24 }} />
            )}
          </IconButton>

          <IconButton onClick={handleNext} sx={{ color: '#fff', p: 1 }}>
            <SkipNextIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Success Message */}
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={4000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccessMessage(false)}
          severity="success"
          sx={{ width: '100%', borderRadius: '8px' }}
        >
          Recording submitted successfully! 🎉
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaskPage;