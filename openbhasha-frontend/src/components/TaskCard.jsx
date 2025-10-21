import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  CheckCircle,
  Warning,
  Language,
  Mic,
  Schedule,
  MoreVert,
} from "@mui/icons-material";

const TaskCard = ({
  task,
  userRole = "student",
  onStartTask,
  onContinueTask,
  showActions = true,
  compact = false,
}) => {
  const navigate = useNavigate();

  const {
    id,
    title,
    language,
    type,
    description,
    available = 0,
    completed = 0,
    verified = 0,
    skipped = 0,
    totalPrompts = 0,
    status = "active",
    createdAt,
  } = task;

  // Calculate progress percentages
  const totalAttempted = completed + skipped;
  const completionRate =
    totalPrompts > 0 ? (completed / totalPrompts) * 100 : 0;
  const verificationRate = completed > 0 ? (verified / completed) * 100 : 0;

  // Determine task status and colors
  const getStatusInfo = () => {
    if (available === 0 && completed === totalPrompts) {
      return {
        status: "completed",
        color: "success",
        icon: <CheckCircle />,
        text: "Completed",
      };
    }
    if (totalAttempted > 0) {
      return {
        status: "in_progress",
        color: "primary",
        icon: <PlayArrow />,
        text: "In Progress",
      };
    }
    return {
      status: "not_started",
      color: "default",
      icon: <PlayArrow />,
      text: "Start",
    };
  };

  const statusInfo = getStatusInfo();

  const handleActionClick = () => {
    if (statusInfo.status === "not_started" && onStartTask) {
      onStartTask(task);
    } else if (statusInfo.status === "in_progress" && onContinueTask) {
      onContinueTask(task);
    }

    // Navigate to recording page
    const basePath = userRole === "participant" ? "/participant" : "/student";
    navigate(`${basePath}/record/${id}`);
  };

  const formatTaskType = (type) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (compact) {
    return (
      <Card
        sx={{
          mb: 1,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          "&:hover": {
            borderColor: "primary.main",
            boxShadow: "0 4px 12px rgba(46, 68, 49, 0.15)",
          },
        }}
      >
        <CardContent sx={{ py: 2 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box flex={1}>
              <Typography variant="subtitle2" color="primary.main" gutterBottom>
                {title}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Chip
                  size="small"
                  label={language}
                  icon={<Language />}
                  variant="outlined"
                />
                <Typography variant="caption" color="text.secondary">
                  {formatTaskType(type)}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="caption">
                  {completed}/{totalPrompts} completed
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={completionRate}
                  sx={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "rgba(46, 68, 49, 0.1)",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "primary.main",
                    },
                  }}
                />
              </Box>
            </Box>

            {showActions && (
              <Button
                variant={
                  statusInfo.status === "not_started" ? "contained" : "outlined"
                }
                size="small"
                onClick={handleActionClick}
                startIcon={statusInfo.icon}
                sx={{ ml: 2 }}
              >
                {statusInfo.text}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.3s ease",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0 8px 24px rgba(46, 68, 49, 0.15)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        {/* Header */}
        <Box
          display="flex"
          alignItems="flex-start"
          justifyContent="space-between"
          mb={2}
        >
          <Box flex={1}>
            <Typography variant="h6" color="primary.main" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {description}
            </Typography>
          </Box>
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </Box>

        {/* Task Info Chips */}
        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          <Chip
            size="small"
            label={language}
            icon={<Language />}
            color="primary"
            variant="outlined"
          />
          <Chip
            size="small"
            label={formatTaskType(type)}
            icon={<Mic />}
            variant="outlined"
          />
          <Chip
            size="small"
            label={statusInfo.text}
            icon={statusInfo.icon}
            color={statusInfo.color}
            variant={statusInfo.status === "completed" ? "filled" : "outlined"}
          />
        </Box>

        {/* Progress Section */}
        <Box mb={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography variant="subtitle2">Progress</Typography>
            <Typography variant="caption" color="text.secondary">
              {completed}/{totalPrompts} completed ({Math.round(completionRate)}
              %)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={completionRate}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: "rgba(46, 68, 49, 0.1)",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "primary.main",
                borderRadius: 3,
              },
            }}
          />
        </Box>

        {/* Stats Grid */}
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
          <Box
            textAlign="center"
            p={1}
            bgcolor="success.light"
            borderRadius={2}
          >
            <Typography variant="h6" color="success.dark">
              {verified}
            </Typography>
            <Typography variant="caption" color="success.dark">
              Verified
            </Typography>
          </Box>
          <Box
            textAlign="center"
            p={1}
            bgcolor="warning.light"
            borderRadius={2}
          >
            <Typography variant="h6" color="warning.dark">
              {skipped}
            </Typography>
            <Typography variant="caption" color="warning.dark">
              Skipped
            </Typography>
          </Box>
        </Box>

        {/* Quality Indicator */}
        {verified > 0 && (
          <Box mb={2}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography variant="caption" color="text.secondary">
                Quality Rate
              </Typography>
              <Typography variant="caption" color="success.main">
                {Math.round(verificationRate)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={verificationRate}
              color="success"
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: "rgba(76, 175, 80, 0.1)",
              }}
            />
          </Box>
        )}

        {/* Additional Info */}
        <Box display="flex" alignItems="center" gap={1} color="text.secondary">
          <Schedule fontSize="small" />
          <Typography variant="caption">
            Created {new Date(createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>

      {showActions && (
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button
            fullWidth
            variant={
              statusInfo.status === "not_started" ? "contained" : "outlined"
            }
            size="large"
            onClick={handleActionClick}
            startIcon={statusInfo.icon}
            disabled={statusInfo.status === "completed"}
            sx={{
              py: 1.5,
              borderRadius: 2,
            }}
          >
            {statusInfo.status === "completed"
              ? "Task Completed"
              : statusInfo.text}
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default TaskCard;
