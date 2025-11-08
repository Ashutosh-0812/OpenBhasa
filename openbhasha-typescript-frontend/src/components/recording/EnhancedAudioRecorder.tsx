import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  LinearProgress,
  Alert,
  Card,
  CardContent,

  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  VolumeUp as VolumeIcon,

} from '@mui/icons-material';

interface RecordingControlsProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onRecordingError?: (error: string) => void;
  maxDuration?: number; // in seconds
  className?: string;
}

interface RecordingState {
  status: 'idle' | 'recording' | 'paused' | 'stopped' | 'playing';
  duration: number;
  audioBlob: Blob | null;
  error: string | null;
  amplitude: number;
  audioUrl: string | null;
}

export const EnhancedAudioRecorder: React.FC<RecordingControlsProps> = ({
  onRecordingComplete,
  onRecordingError,
  maxDuration = 300, // 5 minutes default
}) => {
  const [state, setState] = useState<RecordingState>({
    status: 'idle',
    duration: 0,
    audioBlob: null,
    error: null,
    amplitude: 0,
    audioUrl: null,
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Refs for audio handling
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio permissions on mount
  useEffect(() => {
    requestMicrophonePermission();
    return cleanup;
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      setupAudioAnalyzer(stream);
      setPermissionGranted(true);
      setState(prev => ({ ...prev, error: null }));

      // Stop the stream for now - will restart when recording
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      const errorMessage = 'Microphone access denied. Please allow microphone access to record audio.';
      setState(prev => ({ ...prev, error: errorMessage }));
      onRecordingError?.(errorMessage);
      setPermissionGranted(false);
    }
  };

  const setupAudioAnalyzer = (stream: MediaStream) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 256;
    source.connect(analyser);
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
  };

  const startAmplitudeMonitoring = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateAmplitude = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const amplitude = Math.min(average / 128, 1);
      
      setState(prev => ({ ...prev, amplitude }));
      
      if (state.status === 'recording') {
        animationRef.current = requestAnimationFrame(updateAmplitude);
      }
    };

    updateAmplitude();
  };

  const stopAmplitudeMonitoring = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setState(prev => ({ ...prev, amplitude: 0 }));
  };

  const startRecording = async () => {
    if (!permissionGranted) {
      await requestMicrophonePermission();
      if (!permissionGranted) return;
    }

    try {
      // Get fresh stream for recording
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      setupAudioAnalyzer(stream);

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
        
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setState(prev => ({
          ...prev,
          status: 'stopped',
          audioBlob,
          audioUrl,
        }));

        // Stop the stream
        stream.getTracks().forEach(track => track.stop());
        stopAmplitudeMonitoring();
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setState(prev => ({
        ...prev,
        status: 'recording',
        duration: 0,
        error: null,
      }));

      // Start timer
      timerRef.current = setInterval(() => {
        setState(prev => {
          const newDuration = prev.duration + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return { ...prev, duration: newDuration };
        });
      }, 1000);

      startAmplitudeMonitoring();

    } catch (error) {
      const errorMessage = 'Failed to start recording. Please check your microphone.';
      setState(prev => ({ ...prev, error: errorMessage }));
      onRecordingError?.(errorMessage);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    stopAmplitudeMonitoring();
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setState(prev => ({ ...prev, status: 'paused' }));
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      stopAmplitudeMonitoring();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setState(prev => ({ ...prev, status: 'recording' }));
      
      // Restart timer
      timerRef.current = setInterval(() => {
        setState(prev => {
          const newDuration = prev.duration + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return { ...prev, duration: newDuration };
        });
      }, 1000);
      
      startAmplitudeMonitoring();
    }
  };

  const playRecording = () => {
    if (!state.audioUrl) return;

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }

    const audio = new Audio(state.audioUrl);
    audioElementRef.current = audio;

    audio.onplay = () => setState(prev => ({ ...prev, status: 'playing' }));
    audio.onended = () => setState(prev => ({ ...prev, status: 'stopped' }));
    audio.onerror = () => setState(prev => ({ ...prev, status: 'stopped' }));

    audio.play();
  };

  const pausePlayback = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setState(prev => ({ ...prev, status: 'stopped' }));
    }
  };

  const deleteRecording = () => {
    setShowConfirmDialog(true);
  };

  const confirmDelete = () => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }
    
    setState({
      status: 'idle',
      duration: 0,
      audioBlob: null,
      error: null,
      amplitude: 0,
      audioUrl: null,
    });
    
    setShowConfirmDialog(false);
  };

  const submitRecording = () => {
    if (state.audioBlob) {
      onRecordingComplete(state.audioBlob, state.duration);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }
  };

  const getRecordButtonColor = () => {
    if (state.status === 'recording') return '#F44336';
    if (state.status === 'paused') return '#FF9800';
    return '#2196F3';
  };

  const getRecordButtonSize = () => {
    return state.status === 'recording' ? 80 : 72;
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '375px',
        mx: 'auto',
        p: 2,
      }}
    >
      {/* Error Display */}
      {state.error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2, borderRadius: '12px' }}
          action={
            <Button size="small" onClick={requestMicrophonePermission}>
              Retry
            </Button>
          }
        >
          {state.error}
        </Alert>
      )}

      {/* Recording Visualization */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: '2px solid #E0E0E0',
          mb: 3,
          overflow: 'hidden',
          background: state.status === 'recording' 
            ? 'linear-gradient(45deg, #FFEBEE 30%, #FFCDD2 90%)'
            : '#FAFAFA',
        }}
      >
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          {/* Waveform Visualization */}
          <Box sx={{ mb: 2, height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {state.status === 'recording' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {[...Array(20)].map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: '3px',
                      height: `${Math.max(8, state.amplitude * 40 + Math.random() * 20)}px`,
                      bgcolor: '#F44336',
                      borderRadius: '2px',
                      animation: 'pulse 1s ease-in-out infinite',
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VolumeIcon sx={{ fontSize: '40px', color: '#666' }} />
                <Typography sx={{ fontSize: '14px', color: '#666' }}>
                  {state.audioBlob ? 'Recording ready' : 'Ready to record'}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Recording Status */}
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: '24px',
                fontWeight: 700,
                color: state.status === 'recording' ? '#F44336' : '#000',
                mb: 0.5,
              }}
            >
              {formatTime(state.duration)}
            </Typography>
            <Typography
              sx={{
                fontSize: '12px',
                color: '#666',
              }}
            >
              {state.status === 'idle' && 'Tap record to start'}
              {state.status === 'recording' && 'Recording in progress...'}
              {state.status === 'paused' && 'Recording paused'}
              {state.status === 'stopped' && 'Recording complete'}
              {state.status === 'playing' && 'Playing back...'}
            </Typography>
            
            {maxDuration > 0 && (
              <LinearProgress
                variant="determinate"
                value={(state.duration / maxDuration) * 100}
                sx={{
                  mt: 1,
                  height: 4,
                  borderRadius: 2,
                  bgcolor: '#E0E0E0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: state.duration > maxDuration * 0.8 ? '#FF9800' : '#4CAF50',
                  },
                }}
              />
            )}
          </Box>

          {/* Recording Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            {/* Delete Button */}
            {state.audioBlob && state.status !== 'recording' && (
              <IconButton
                onClick={deleteRecording}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: '#FFEBEE',
                  color: '#F44336',
                  '&:hover': { bgcolor: '#FFCDD2' },
                }}
              >
                <DeleteIcon />
              </IconButton>
            )}

            {/* Main Record Button */}
            <IconButton
              onClick={() => {
                if (state.status === 'idle') startRecording();
                else if (state.status === 'recording') stopRecording();
                else if (state.status === 'paused') resumeRecording();
              }}
              disabled={!permissionGranted}
              sx={{
                width: getRecordButtonSize(),
                height: getRecordButtonSize(),
                bgcolor: getRecordButtonColor(),
                color: 'white',
                '&:hover': {
                  bgcolor: getRecordButtonColor(),
                  transform: 'scale(1.05)',
                },
                '&:disabled': {
                  bgcolor: '#CCCCCC',
                  color: '#666',
                },
                transition: 'all 0.2s ease-in-out',
                ...(state.status === 'recording' && {
                  animation: 'pulse 2s ease-in-out infinite',
                }),
              }}
            >
              {state.status === 'recording' ? (
                <StopIcon sx={{ fontSize: 36 }} />
              ) : state.status === 'paused' ? (
                <PlayIcon sx={{ fontSize: 36 }} />
              ) : (
                <MicIcon sx={{ fontSize: 36 }} />
              )}
            </IconButton>

            {/* Pause/Play Button */}
            {state.status === 'recording' && (
              <IconButton
                onClick={pauseRecording}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: '#FFF3E0',
                  color: '#FF9800',
                  '&:hover': { bgcolor: '#FFE0B2' },
                }}
              >
                <PauseIcon />
              </IconButton>
            )}

            {/* Play Button for finished recordings */}
            {state.audioBlob && (state.status === 'stopped' || state.status === 'playing') && (
              <IconButton
                onClick={state.status === 'playing' ? pausePlayback : playRecording}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: '#E8F5E8',
                  color: '#4CAF50',
                  '&:hover': { bgcolor: '#C8E6C9' },
                }}
              >
                {state.status === 'playing' ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
            )}
          </Box>

          {/* Submit Button */}
          {state.audioBlob && (
            <Button
              variant="contained"
              startIcon={<CheckIcon />}
              onClick={submitRecording}
              disabled={state.status === 'recording'}
              fullWidth
              sx={{
                mt: 2,
                py: 1.5,
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Submit Recording ({formatTime(state.duration)})
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Recording Tips */}
      <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #E0E0E0' }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <VolumeIcon sx={{ fontSize: '16px', color: '#2196F3' }} />
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#000' }}>
              Recording Tips
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '11px', color: '#666', lineHeight: 1.4 }}>
            • Hold device 6-8 inches from your mouth
            • Speak clearly and at normal pace
            • Record in a quiet environment
            • Maximum recording time: {Math.floor(maxDuration / 60)} minutes
          </Typography>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        PaperProps={{
          sx: { borderRadius: '12px', maxWidth: '320px' }
        }}
      >
        <DialogTitle sx={{ fontSize: '16px', fontWeight: 600 }}>
          Delete Recording?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '14px', color: '#666' }}>
            This will permanently delete your recording. You'll need to record again.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSS for animations */}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); }
          70% { box-shadow: 0 0 0 20px rgba(244, 67, 54, 0); }
          100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
        }
      `}</style>
    </Box>
  );
};

export default EnhancedAudioRecorder;