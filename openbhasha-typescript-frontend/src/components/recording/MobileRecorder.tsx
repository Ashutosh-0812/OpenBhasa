import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, Button, LinearProgress, Alert } from '@mui/material';
import { 
  Mic as MicIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  SkipNext as SkipIcon,
  CheckCircle as FinishIcon,
} from '@mui/icons-material';
import { RecordingSession, TaskType, RecordingState } from '@/types';

interface MobileRecorderProps {
  session: RecordingSession;
  onRecordingComplete: (recordingId: string) => void;
  onSessionUpdate: (session: RecordingSession) => void;
  taskType: TaskType;
}

export const MobileRecorder: React.FC<MobileRecorderProps> = ({
  session,
  onRecordingComplete,
  onSessionUpdate,
}) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [amplitude, setAmplitude] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize audio context and request microphone permission
  useEffect(() => {
    initializeRecorder();
    return () => {
      cleanup();
    };
  }, []);

  const initializeRecorder = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      streamRef.current = stream;

      // Create MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      // Set up audio analysis for waveform visualization
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      analyser.fftSize = 256;

      // Set up event handlers
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        // Recording stopped - will be handled in stop function
      };

      setMediaRecorder(recorder);
      setPermissionError(null);

      // Announce success for accessibility
      announceToScreenReader('Microphone ready for recording');

    } catch (error) {
      console.error('Failed to initialize recorder:', error);
      setPermissionError('Microphone access is required for recording. Please allow microphone access and try again.');
      
      // Announce error for accessibility
      announceToScreenReader('Microphone access denied. Please check your permissions.');
    }
  };

  const startRecording = () => {
    if (!mediaRecorder || mediaRecorder.state === 'recording') return;

    setAudioChunks([]);
    setRecordingTime(0);
    setHasRecording(false);

    mediaRecorder.start(100); // Collect data every 100ms

    // Update session state
    const updatedSession = {
      ...session,
      state: 'recording' as RecordingState,
      startTime: Date.now(),
    };
    onSessionUpdate(updatedSession);

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    // Start amplitude monitoring for visual feedback
    startAmplitudeMonitoring();

    // Announce for accessibility
    announceToScreenReader('Recording started');
  };

  // Removed pauseRecording function - not currently used in the component

  const resumeRecording = () => {
    if (!mediaRecorder || mediaRecorder.state !== 'paused') return;

    mediaRecorder.resume();

    // Update session state
    const updatedSession = {
      ...session,
      state: 'recording' as RecordingState,
    };
    onSessionUpdate(updatedSession);

    // Resume timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    startAmplitudeMonitoring();

    // Announce for accessibility
    announceToScreenReader('Recording resumed');
  };

  const stopRecording = () => {
    if (!mediaRecorder || (mediaRecorder.state !== 'recording' && mediaRecorder.state !== 'paused')) return;

    mediaRecorder.stop();

    // Update session state
    const updatedSession = {
      ...session,
      state: 'done' as RecordingState,
      totalDuration: session.totalDuration + recordingTime,
    };
    onSessionUpdate(updatedSession);

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    stopAmplitudeMonitoring();
    setHasRecording(true);

    // Announce for accessibility
    announceToScreenReader('Recording stopped. Ready to submit or record again.');
  };

  const finishAndSubmit = () => {
    if (audioChunks.length === 0) return;

    // Create audio blob
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
    
    // Create mock recording object
    const recordingId = `recording-${Date.now()}`;
    
    // Update session with recording
    const updatedSession = {
      ...session,
      state: 'submitted' as RecordingState,
      recordings: [
        ...session.recordings,
        {
          id: recordingId,
          taskId: session.taskId,
          promptId: session.currentPromptId,
          userId: 'current-user',
          audioBlob,
          duration: recordingTime,
          quality: 'high' as const,
          createdAt: new Date().toISOString(),
          reviewStatus: 'pending' as const,
        }
      ],
    };
    onSessionUpdate(updatedSession);

    // Reset state for next prompt
    setAudioChunks([]);
    setRecordingTime(0);
    setHasRecording(false);

    // Announce success
    announceToScreenReader('Recording submitted successfully');

    // Notify parent component
    onRecordingComplete(recordingId);
  };

  const startAmplitudeMonitoring = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateAmplitude = () => {
      if (session.state === 'recording') {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setAmplitude(average / 255); // Normalize to 0-1

        requestAnimationFrame(updateAmplitude);
      }
    };

    updateAmplitude();
  };

  const stopAmplitudeMonitoring = () => {
    setAmplitude(0);
  };

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const announceToScreenReader = (message: string) => {
    // Create a temporary element for screen reader announcements
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Error state
  if (permissionError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {permissionError}
        </Alert>
        <Button
          variant="contained"
          fullWidth
          onClick={initializeRecorder}
          sx={{ minHeight: 44 }}
        >
          Retry Microphone Access
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Progress Bar (time-based visual) */}
      <Box sx={{ mb: 3 }}>
        <LinearProgress
          variant="determinate"
          value={amplitude * 100}
          sx={{
            height: 4,
            borderRadius: 2,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              backgroundColor: session.state === 'recording' ? 'success.main' : 'grey.400',
              transition: 'none',
            },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.875rem',
            }}
          >
            {formatTime(recordingTime)}
          </Typography>
        </Box>
      </Box>

      {/* Transport Controls */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          backgroundColor: 'success.main',
          borderRadius: 3,
          p: 2,
          minHeight: 80,
        }}
      >
        {/* Skip Button (Left) */}
        <IconButton
          sx={{
            minWidth: 48,
            minHeight: 48,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            },
          }}
          disabled={session.state === 'recording'}
          aria-label="Skip current prompt"
        >
          <SkipIcon sx={{ fontSize: 24 }} />
        </IconButton>

        {/* Main Record Button (Center) */}
        <IconButton
          sx={{
            minWidth: 80,
            minHeight: 80,
            backgroundColor: 'error.main',
            color: 'white',
            border: session.state === 'recording' ? '4px solid rgba(255, 255, 255, 0.5)' : 'none',
            '&:hover': {
              backgroundColor: 'error.dark',
            },
            animation: session.state === 'recording' ? 'pulse 1.5s infinite' : 'none',
          }}
          onClick={() => {
            switch (session.state) {
              case 'idle':
                startRecording();
                break;
              case 'recording':
                stopRecording();
                break;
              case 'paused':
                resumeRecording();
                break;
              case 'done':
                startRecording(); // Start new recording
                break;
            }
          }}
          disabled={!mediaRecorder}
          aria-label={
            session.state === 'idle' ? 'Start recording' :
            session.state === 'recording' ? 'Stop recording' :
            session.state === 'paused' ? 'Resume recording' :
            'Record again'
          }
        >
          {session.state === 'recording' ? (
            <StopIcon sx={{ fontSize: 36 }} />
          ) : session.state === 'paused' ? (
            <PlayIcon sx={{ fontSize: 36 }} />
          ) : (
            <MicIcon sx={{ fontSize: 36 }} />
          )}
        </IconButton>

        {/* Finish Button (Right) */}
        <IconButton
          sx={{
            minWidth: 48,
            minHeight: 48,
            backgroundColor: hasRecording ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            '&:hover': {
              backgroundColor: hasRecording ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
            },
          }}
          disabled={!hasRecording || session.state === 'recording'}
          onClick={finishAndSubmit}
          aria-label="Finish and submit recording"
        >
          <FinishIcon sx={{ fontSize: 24 }} />
        </IconButton>
      </Box>

      {/* Recording State Indicator */}
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: session.state === 'recording' ? 'error.main' : 'text.secondary',
            fontWeight: session.state === 'recording' ? 600 : 400,
            fontSize: '0.875rem',
          }}
        >
          {session.state === 'idle' && 'Tap microphone to start recording'}
          {session.state === 'recording' && 'Recording... Tap to stop'}
          {session.state === 'paused' && 'Recording paused. Tap to resume'}
          {session.state === 'done' && hasRecording && 'Ready to submit or record again'}
        </Typography>
      </Box>

      {/* Pulse animation for recording state */}
      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
          }
        }
      `}</style>
    </Box>
  );
};