import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Alert,
  IconButton,
  Card,
  CardContent,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  ArrowBack,
  Language,
  Headset,
  PlayArrow,
  CheckCircle,
  SkipNext,
} from "@mui/icons-material";
import AudioRecorder from "../components/AudioRecorder";
import { fetchTaskById } from "../features/tasks/taskSlice";

const TaskRecording = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedTask, loading, error } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);

  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [completedPrompts, setCompletedPrompts] = useState(0);
  const [skippedPrompts, setSkippedPrompts] = useState(0);

  // Mock prompts data - in real app, this would come from the task
  const mockPrompts = [
    {
      id: 1,
      sequence: 1,
      text: "राम एक अच्छा लड़का है।",
      language: "Hindi",
      type: "reading",
      instruction: "Read the following text clearly and naturally",
    },
    {
      id: 2,
      sequence: 2,
      text: "वह रोज़ाना स्कूल जाता है।",
      language: "Hindi",
      type: "reading",
      instruction: "Read the following text clearly and naturally",
    },
    {
      id: 3,
      sequence: 3,
      text: "उसके पास एक नीली किताब है।",
      language: "Hindi",
      type: "reading",
      instruction: "Read the following text clearly and naturally",
    },
    {
      id: 4,
      sequence: 4,
      text: "आज मौसम बहुत अच्छा है।",
      language: "Hindi",
      type: "reading",
      instruction: "Read the following text clearly and naturally",
    },
    {
      id: 5,
      sequence: 5,
      text: "बच्चे पार्क में खेल रहे हैं।",
      language: "Hindi",
      type: "reading",
      instruction: "Read the following text clearly and naturally",
    },
  ];

  // Get task-specific prompts
  const getPromptsForTask = (taskId) => {
    const taskIdNum = parseInt(taskId);
    switch (taskIdNum) {
      case 1:
        return mockPrompts; // Hindi prompts
      case 2:
        return [
          {
            id: 1,
            sequence: 1,
            text: "আমি বাংলা ভাষা ভালোবাসি।",
            language: "Bengali",
            type: "reading",
            instruction: "Read the following Bengali text clearly",
          },
          {
            id: 2,
            sequence: 2,
            text: "আজ আবহাওয়া খুব সুন্দর।",
            language: "Bengali",
            type: "reading",
            instruction: "Read the following Bengali text clearly",
          },
          {
            id: 3,
            sequence: 3,
            text: "আমি স্কুলে যাই প্রতিদিন।",
            language: "Bengali",
            type: "reading",
            instruction: "Read the following Bengali text clearly",
          },
        ];
      case 3:
        return [
          {
            id: 1,
            sequence: 1,
            text: "मी मराठी भाषा बोलतो।",
            language: "Marathi",
            type: "reading",
            instruction: "Read the following Marathi text clearly",
          },
          {
            id: 2,
            sequence: 2,
            text: "आज हवामान खूप छान आहे।",
            language: "Marathi",
            type: "reading",
            instruction: "Read the following Marathi text clearly",
          },
          {
            id: 3,
            sequence: 3,
            text: "मी शाळेत जातो दररोज।",
            language: "Marathi",
            type: "reading",
            instruction: "Read the following Marathi text clearly",
          },
        ];
      default:
        return mockPrompts; // Default to Hindi
    }
  };

  const taskPrompts = getPromptsForTask(taskId);

  // Mock task data
  const getTaskInfo = (taskId) => {
    const taskIdNum = parseInt(taskId);
    switch (taskIdNum) {
      case 1:
        return {
          id: taskIdNum,
          title: "Hindi Story Reading",
          language: "Hindi",
          description: "Read short Hindi stories with clear pronunciation",
        };
      case 2:
        return {
          id: taskIdNum,
          title: "Bengali Conversation",
          language: "Bengali",
          description: "Practice conversational Bengali phrases",
        };
      case 3:
        return {
          id: taskIdNum,
          title: "Marathi Pronunciation",
          language: "Marathi",
          description: "Master Marathi phonetic sounds",
        };
      default:
        return {
          id: taskIdNum,
          title: "Language Learning Task",
          language: "Hindi",
          description: "Practice reading text clearly",
        };
    }
  };

  const taskInfo = getTaskInfo(taskId);
  const mockTask = {
    ...taskInfo,
    totalPrompts: taskPrompts.length,
    completed: 0,
    status: "in_progress",
  };

  const currentTask = selectedTask || mockTask;
  const currentPrompt = taskPrompts[currentPromptIndex];
  const totalPrompts = taskPrompts.length;

  useEffect(() => {
    if (taskId) {
      console.log("TaskRecording: Loading task", taskId);
      // In a real app, fetch the task details
      dispatch(fetchTaskById(taskId));
    }
  }, [taskId, dispatch]);

  const handleBack = () => {
    navigate("/student/dashboard");
  };

  const handleComplete = (recordingData) => {
    console.log("Recording completed:", recordingData);
    setCompletedPrompts((prev) => prev + 1);

    // Show success message
    alert(`Great! Recording ${currentPromptIndex + 1} completed successfully!`);

    // Move to next prompt or finish
    if (currentPromptIndex < totalPrompts - 1) {
      setCurrentPromptIndex((prev) => prev + 1);
    } else {
      handleTaskComplete();
    }
  };

  const handleSkip = () => {
    setSkippedPrompts((prev) => prev + 1);

    // Move to next prompt or finish
    if (currentPromptIndex < totalPrompts - 1) {
      setCurrentPromptIndex((prev) => prev + 1);
    } else {
      handleTaskComplete();
    }
  };

  const handleTaskComplete = () => {
    // Show completion dialog or redirect
    alert(
      `Task completed! You completed ${completedPrompts} prompts and skipped ${skippedPrompts} prompts.`
    );
    navigate("/student/dashboard");
  };

  const progressPercentage = ((currentPromptIndex + 1) / totalPrompts) * 100;

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <LinearProgress sx={{ width: "50%" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={handleBack} startIcon={<ArrowBack />}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      {/* Top App Bar */}
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: "primary.main" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h1">
              {currentTask.title}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Prompt {currentPromptIndex + 1} of {totalPrompts}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Language sx={{ fontSize: 20 }} />
            <Chip
              label={currentTask.language}
              size="small"
              sx={{ bgcolor: "primary.light", color: "white" }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Progress Section */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6" color="primary.main">
                Task Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(progressPercentage)}% Complete
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                mb: 2,
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                },
              }}
            />

            <Box display="flex" justifyContent="space-between" gap={2}>
              <Box textAlign="center">
                <Typography variant="h6" color="success.main">
                  {completedPrompts}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Completed
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" color="warning.main">
                  {skippedPrompts}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Skipped
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" color="info.main">
                  {totalPrompts - currentPromptIndex - 1}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Remaining
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Current Prompt Section */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Headset color="primary" />
              <Typography variant="h6" color="primary.main">
                Current Prompt
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" mb={2}>
              {currentPrompt.instruction}
            </Typography>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "grey.100",
                border: "2px dashed",
                borderColor: "primary.main",
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Typography
                variant="h5"
                component="p"
                sx={{
                  fontFamily: "serif",
                  lineHeight: 1.6,
                  color: "text.primary",
                  mb: 1,
                }}
              >
                {currentPrompt.text}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Language: {currentPrompt.language} | Type: {currentPrompt.type}
              </Typography>
            </Paper>
          </CardContent>
        </Card>

        {/* Audio Recorder Section */}
        <Card elevation={2}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <PlayArrow color="primary" />
              <Typography variant="h6" color="primary.main">
                Record Your Audio
              </Typography>
            </Box>

            <AudioRecorder
              prompt={currentPrompt}
              taskId={taskId}
              onComplete={handleComplete}
              onSkip={handleSkip}
              userRole={user?.role || "student"}
              showQualityControls={false}
            />
          </CardContent>
        </Card>

        {/* Instructions */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Instructions:</strong> Read the text clearly and naturally.
            Make sure you're in a quiet environment for the best recording
            quality. You can re-record if you're not satisfied with your first
            attempt.
          </Typography>
        </Alert>
      </Container>
    </Box>
  );
};

export default TaskRecording;
