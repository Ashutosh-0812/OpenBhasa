import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Alert,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
} from "@mui/material";
import {
  Mic,
  Stop,
  PlayArrow,
  Pause,
  Delete,
  Send,
  VolumeUp,
  GraphicEq,
  Timer,
  Warning,
  CheckCircle,
  SkipNext,
  Replay,
} from "@mui/icons-material";
import {
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
  uploadRecording,
  clearRecording,
  setPlaybackStatus,
  updateRecordingTime,
  setError,
  clearError,
} from "../features/audio/audioSlice";

const AudioRecorder = ({
  prompt,
  taskId,
  onComplete,
  onSkip,
  userRole = "student",
  showQualityControls = false,
}) => {
  const dispatch = useDispatch();
  const {
    isRecording: recording,
    playbackStatus,
    audioBlob,
    audioUrl,
    uploadStatus,
    recordingTime: duration,
    error: uploadError,
    loading: uploading,
  } = useSelector((state) => state.audio);

  // Derived states
  const playing = playbackStatus === "playing";
  const currentTime = 0; // This would come from audio element currentTime
  const quality = 5; // Default quality rating

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [notes, setNotes] = useState("");
  const [accent, setAccent] = useState("");
  const [dialect, setDialect] = useState("");
  const [recordingQuality, setRecordingQuality] = useState(quality || 5);
  const [retryCount, setRetryCount] = useState(0);

  // Audio visualization and recording refs
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const maxRetries = 3;
  const maxDuration = 300; // 5 minutes
  const minDuration = 1; // 1 second

  useEffect(() => {
    if (recording && analyserRef.current && canvasRef.current) {
      visualizeAudio();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [recording]);

  const visualizeAudio = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const analyser = analyserRef.current;

    if (!analyser || !canvas) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#f5f5f5";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

        const hue = (i / bufferLength) * 120 + 120; // Green to blue spectrum
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;

        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, {
          type: "audio/webm;codecs=opus",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        dispatch(stopRecording({ audioBlob, audioUrl }));
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      streamRef.current = stream;
      dispatch(startRecording({ mediaRecorder, stream }));

      // Set up audio visualization
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;
      microphone.connect(analyser);
      analyserRef.current = analyser;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      dispatch(setError("Failed to access microphone"));
    }
  };

  const handleStopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handlePlayRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
      dispatch(setPlaybackStatus("playing"));

      audio.onended = () => {
        dispatch(setPlaybackStatus("idle"));
      };
    }
  };

  const handlePausePlayback = () => {
    dispatch(setPlaybackStatus("paused"));
  };

  const handleDeleteRecording = () => {
    dispatch(clearRecording());
    setNotes("");
    setAccent("");
    setDialect("");
    setRecordingQuality(5);
  };

  const handleSubmit = () => {
    if (audioBlob && duration >= minDuration) {
      const recordingData = {
        audioBlob,
        taskId,
        promptId: prompt?.id,
        notes,
        accent,
        dialect,
        quality: recordingQuality,
        duration,
        retryCount,
      };

      dispatch(uploadRecording(recordingData))
        .then(() => {
          setShowSubmitDialog(false);
          onComplete?.(recordingData);
          handleDeleteRecording();
        })
        .catch((error) => {
          console.error("Upload failed:", error);
        });
    }
  };

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount((prev) => prev + 1);
      handleDeleteRecording();
    }
  };

  const handleSkip = () => {
    setShowSubmitDialog(false);
    onSkip?.(prompt);
    handleDeleteRecording();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getRecordingStatus = () => {
    if (!audioBlob) return null;

    if (duration < minDuration) {
      return { type: "warning", message: "Recording too short" };
    }

    if (duration > maxDuration) {
      return { type: "error", message: "Recording too long" };
    }

    return { type: "success", message: "Recording ready" };
  };

  const recordingStatus = getRecordingStatus();
  const canSubmit =
    audioBlob && duration >= minDuration && duration <= maxDuration;

  return (
    <Card elevation={3}>
      <CardContent>
        {/* Prompt Display */}
        {prompt && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              backgroundColor: "primary.light",
              color: "primary.contrastText",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Prompt {prompt.sequence || 1}
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
            >
              "{prompt.text}"
            </Typography>
            {prompt.phonetic && (
              <Typography
                variant="body2"
                sx={{ mt: 1, fontStyle: "italic", opacity: 0.9 }}
              >
                Phonetic: {prompt.phonetic}
              </Typography>
            )}
          </Paper>
        )}

        {/* Recording Controls */}
        <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            {!recording ? (
              <Tooltip title="Start Recording">
                <IconButton
                  onClick={handleStartRecording}
                  disabled={uploading}
                  sx={{
                    backgroundColor: "error.main",
                    color: "white",
                    width: 64,
                    height: 64,
                    "&:hover": { backgroundColor: "error.dark" },
                  }}
                >
                  <Mic sx={{ fontSize: 32 }} />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Stop Recording">
                <IconButton
                  onClick={handleStopRecording}
                  sx={{
                    backgroundColor: "grey.600",
                    color: "white",
                    width: 64,
                    height: 64,
                    "&:hover": { backgroundColor: "grey.700" },
                  }}
                >
                  <Stop sx={{ fontSize: 32 }} />
                </IconButton>
              </Tooltip>
            )}

            {audioUrl && (
              <>
                {!playing ? (
                  <Tooltip title="Play Recording">
                    <IconButton
                      onClick={handlePlayRecording}
                      disabled={recording || uploading}
                      sx={{
                        backgroundColor: "success.main",
                        color: "white",
                        width: 48,
                        height: 48,
                        "&:hover": { backgroundColor: "success.dark" },
                      }}
                    >
                      <PlayArrow />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Pause Playback">
                    <IconButton
                      onClick={handlePausePlayback}
                      sx={{
                        backgroundColor: "warning.main",
                        color: "white",
                        width: 48,
                        height: 48,
                        "&:hover": { backgroundColor: "warning.dark" },
                      }}
                    >
                      <Pause />
                    </IconButton>
                  </Tooltip>
                )}

                <Tooltip title="Delete Recording">
                  <IconButton
                    onClick={handleDeleteRecording}
                    disabled={recording || uploading}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>

        {/* Recording Status */}
        <Box mb={3}>
          {recording && (
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <GraphicEq color="error" />
                <Typography color="error.main" fontWeight="medium">
                  Recording...
                </Typography>
              </Box>
              <Chip
                icon={<Timer />}
                label={formatTime(duration)}
                color="error"
              />
            </Box>
          )}

          {recordingStatus && (
            <Alert
              severity={recordingStatus.type}
              sx={{ mb: 2 }}
              icon={
                recordingStatus.type === "success" ? (
                  <CheckCircle />
                ) : (
                  <Warning />
                )
              }
            >
              {recordingStatus.message}
            </Alert>
          )}

          {audioBlob && (
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Chip
                icon={<VolumeUp />}
                label={`Duration: ${formatTime(duration)}`}
                color={canSubmit ? "success" : "warning"}
              />
              <Chip
                label={`Attempt ${retryCount + 1}/${maxRetries + 1}`}
                variant="outlined"
              />
            </Box>
          )}
        </Box>

        {/* Audio Visualization */}
        {recording && (
          <Box mb={3}>
            <canvas
              ref={canvasRef}
              width={400}
              height={100}
              style={{
                width: "100%",
                height: "80px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </Box>
        )}

        {/* Progress Bar for Playback */}
        {playing && audioUrl && (
          <Box mb={3}>
            <LinearProgress
              variant="determinate"
              value={(currentTime / duration) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="caption">
                {formatTime(currentTime)}
              </Typography>
              <Typography variant="caption">{formatTime(duration)}</Typography>
            </Box>
          </Box>
        )}

        {/* Upload Progress */}
        {uploading && (
          <Box mb={3}>
            <LinearProgress />
            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              Uploading recording...
            </Typography>
          </Box>
        )}

        {/* Upload Error */}
        {uploadError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {uploadError}
          </Alert>
        )}

        {/* Action Buttons */}
        <Box display="flex" gap={2} justifyContent="center">
          {audioBlob && canSubmit && (
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={() => setShowSubmitDialog(true)}
              disabled={uploading}
            >
              Submit Recording
            </Button>
          )}

          {audioBlob && !canSubmit && retryCount < maxRetries && (
            <Button
              variant="outlined"
              startIcon={<Replay />}
              onClick={handleRetry}
              disabled={recording || uploading}
            >
              Try Again
            </Button>
          )}

          <Button
            variant="outlined"
            startIcon={<SkipNext />}
            onClick={handleSkip}
            disabled={recording || uploading}
          >
            Skip
          </Button>
        </Box>

        {/* Submit Dialog */}
        <Dialog
          open={showSubmitDialog}
          onClose={() => setShowSubmitDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Submit Recording</DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes about this recording..."
                />
              </Grid>

              {userRole === "participant" && (
                <>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Accent"
                      value={accent}
                      onChange={(e) => setAccent(e.target.value)}
                      placeholder="e.g., Northern, Southern"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Dialect"
                      value={dialect}
                      onChange={(e) => setDialect(e.target.value)}
                      placeholder="e.g., Urban, Rural"
                    />
                  </Grid>
                </>
              )}

              {showQualityControls && (
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <InputLabel>Recording Quality</InputLabel>
                    <Select
                      value={recordingQuality}
                      label="Recording Quality"
                      onChange={(e) => setRecordingQuality(e.target.value)}
                    >
                      <MenuItem value={1}>1 - Poor</MenuItem>
                      <MenuItem value={2}>2 - Fair</MenuItem>
                      <MenuItem value={3}>3 - Good</MenuItem>
                      <MenuItem value={4}>4 - Very Good</MenuItem>
                      <MenuItem value={5}>5 - Excellent</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Submit"}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AudioRecorder;
