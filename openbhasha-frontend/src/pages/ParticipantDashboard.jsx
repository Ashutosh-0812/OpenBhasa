import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Paper,
  Alert,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
  IconButton,
} from "@mui/material";
import Header from "../components/Header";
import {
  PlayArrow,
  CheckCircle,
  Language,
  Mic,
  Assignment,
  ViewList,
  EmojiEvents,
  Whatshot,
  MilitaryTech,
  MonetizationOn,
  TrendingUp,
  PlayCircle,
} from "@mui/icons-material";
import { fetchTasks } from "../features/tasks/taskSlice";

const ParticipantDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { tasks, loading, error } = useSelector((state) => state.tasks);

  // State for participant rewards data (would come from API in real application)
  const [rewardsData, setRewardsData] = useState({
    coins: 2450,
    coinsThisWeek: 150,
    streak: 7,
    level: {
      current: 12,
      next: 13,
      progress: 2450,
      required: 2800,
    },
    achievements: 3,
  });

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  // Mock tasks for demo
  const mockTasks = [
    {
      id: 1,
      title: "Hindi Story Narration",
      language: "Hindi",
      completed: 8,
      totalPrompts: 50,
      status: "in_progress",
      description: "Narrate traditional Hindi stories with expression",
      priority: "high",
      coins: 5,
    },
    {
      id: 2,
      title: "Bengali Poetry Reading",
      language: "Bengali",
      completed: 0,
      totalPrompts: 30,
      status: "not_started",
      description: "Read famous Bengali poems with proper rhythm",
      priority: "medium",
      coins: 3,
    },
    {
      id: 3,
      title: "Gujarati Conversation Dataset",
      language: "Gujarati",
      completed: 45,
      totalPrompts: 60,
      status: "in_progress",
      description: "Record natural conversational exchanges",
      priority: "high",
      coins: 4,
    },
    {
      id: 4,
      title: "Marathi Folk Tales",
      language: "Marathi",
      completed: 25,
      totalPrompts: 25,
      status: "completed",
      description: "Traditional Marathi storytelling collection",
      priority: "low",
      coins: 2,
    },
  ];

  const displayTasks = tasks.length > 0 ? tasks : mockTasks;
  const availableTasks = displayTasks.filter(
    (task) => task.completed < task.totalPrompts
  );

  const handleStartTask = (task) => {
    navigate(`/participant/tasks/${task.id}/record`);
  };

  const handleViewAllTasks = () => {
    navigate("/participant/tasks");
  };

  const handleViewRecordings = () => {
    navigate("/participant/recordings");
  };

  const getProgressPercentage = (completed, total) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusText = (task) => {
    if (task.completed === task.totalPrompts) return "Completed";
    if (task.completed > 0) return "Continue";
    return "Start Recording";
  };

  const getButtonIcon = (task) => {
    if (task.completed === task.totalPrompts) return <CheckCircle />;
    return <PlayArrow />;
  };

  // Calculate completion stats
  const completedTasks = displayTasks.filter(
    (task) => task.completed === task.totalPrompts
  ).length;

  const totalContributions = displayTasks.reduce(
    (sum, task) => sum + (task.completed || 0),
    0
  );

  // Calculate level progress percentage
  const levelProgressPercentage =
    ((rewardsData.level.progress - 0) / (rewardsData.level.required - 0)) * 100;

  return (
    <Box
      sx={{ p: 3, maxWidth: 1200, mx: "auto", bgcolor: "background.default" }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" component="h1" gutterBottom>
          Participant Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Welcome back, {user?.name || "Participant"} 👋
        </Typography>
      </Box>

      {/* Rewards Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Coins Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            className="reward-card coin-card"
            sx={{ boxShadow: "0 3px 8px rgba(0,0,0,0.05)" }}
          >
            <Box>
              <Typography variant="h4" component="div">
                {rewardsData.coins} coins
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +{rewardsData.coinsThisWeek} this week
              </Typography>
            </Box>
            <Avatar
              sx={{
                bgcolor: "gold.light",
                color: "gold.dark",
                width: 48,
                height: 48,
              }}
            >
              <MonetizationOn />
            </Avatar>
          </Box>
        </Grid>

        {/* Day Streak Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            className="reward-card streak-card"
            sx={{ boxShadow: "0 3px 8px rgba(0,0,0,0.05)" }}
          >
            <Box>
              <Typography variant="h4" component="div">
                {rewardsData.streak}-Day Streak
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Keep it going!
              </Typography>
            </Box>
            <Avatar
              sx={{
                bgcolor: "primary.light",
                color: "primary.main",
                width: 48,
                height: 48,
              }}
            >
              <Whatshot />
            </Avatar>
          </Box>
        </Grid>

        {/* Level Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            className="reward-card level-card"
            sx={{ boxShadow: "0 3px 8px rgba(0,0,0,0.05)" }}
          >
            <Box>
              <Typography variant="h4" component="div">
                Level {rewardsData.level.current}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {rewardsData.level.required - rewardsData.level.progress} to
                next level
              </Typography>
            </Box>
            <Avatar
              sx={{
                bgcolor: "secondary.light",
                color: "primary.main",
                width: 48,
                height: 48,
              }}
            >
              <MilitaryTech />
            </Avatar>
          </Box>
        </Grid>

        {/* Achievements Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            className="reward-card achievement-card"
            sx={{ boxShadow: "0 3px 8px rgba(0,0,0,0.05)" }}
          >
            <Box>
              <Typography variant="h4" component="div">
                {rewardsData.achievements} badges
              </Typography>
              <Typography variant="body2" color="text.secondary">
                unlocked
              </Typography>
            </Box>
            <Avatar
              sx={{
                bgcolor: "grey.100",
                color: "text.secondary",
                width: 48,
                height: 48,
              }}
            >
              <EmojiEvents />
            </Avatar>
          </Box>
        </Grid>
      </Grid>

      {/* Level Progress */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="h2" component="h2">
            Level {rewardsData.level.current} → {rewardsData.level.next}
          </Typography>
          <Chip
            size="small"
            label={`+${
              rewardsData.level.required - rewardsData.level.progress
            } to next level`}
            sx={{ bgcolor: "level.main", color: "primary.main" }}
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={levelProgressPercentage}
          sx={{ mb: 1, height: 14 }}
        />
        <Typography variant="caption" color="text.secondary">
          {rewardsData.level.progress} / {rewardsData.level.required} coins
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<Mic />}
            onClick={handleViewRecordings}
          >
            My Recordings
          </Button>
          <Button
            variant="outlined"
            startIcon={<ViewList />}
            onClick={handleViewAllTasks}
          >
            View All Tasks
          </Button>
        </Box>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tasks Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
          Assigned Tasks
        </Typography>
        <Grid container spacing={3}>
          {displayTasks.map((task) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={task.id}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  {/* Task Header */}
                  <Box sx={{ mb: 2 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      mb={1}
                    >
                      <Typography
                        variant="h4"
                        component="h3"
                        gutterBottom
                        sx={{ flexGrow: 1 }}
                      >
                        {task.title}
                      </Typography>
                      <Chip
                        icon={<MonetizationOn fontSize="small" />}
                        label={`${task.coins || 0} coins`}
                        sx={{ bgcolor: "gold.light", color: "gold.dark" }}
                      />
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Chip
                        icon={<Language fontSize="small" />}
                        label={task.language}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      {task.description}
                    </Typography>
                  </Box>

                  {/* Progress */}
                  <Box sx={{ mb: 3 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {task.completed} / {task.totalPrompts} completed (
                        {getProgressPercentage(
                          task.completed,
                          task.totalPrompts
                        )}
                        %)
                      </Typography>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={getProgressPercentage(
                        task.completed,
                        task.totalPrompts
                      )}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                      }}
                    />
                  </Box>

                  {/* Action Button */}
                  <Button
                    fullWidth
                    variant={
                      task.completed === task.totalPrompts
                        ? "outlined"
                        : "contained"
                    }
                    color={
                      task.completed === task.totalPrompts
                        ? "success"
                        : "primary"
                    }
                    startIcon={getButtonIcon(task)}
                    onClick={() => handleStartTask(task)}
                    disabled={task.completed === task.totalPrompts}
                  >
                    {getStatusText(task)}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Empty State */}
      {displayTasks.length === 0 && !loading && (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "grey.200",
            borderRadius: 2,
          }}
        >
          <Assignment sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tasks available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check back later for new contribution opportunities.
          </Typography>
        </Paper>
      )}

      {/* Weekly Summary */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          bgcolor: "level.main",
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <TrendingUp color="primary" />
          <Typography variant="h6" color="text.primary">
            This Week: +{rewardsData.coinsThisWeek} coins earned |{" "}
            {completedTasks} tasks completed | Streak maintained 🎯
          </Typography>
        </Box>
      </Paper>

      {/* Reward Redemption (Future Placeholder) */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          border: "1px dashed",
          borderColor: "secondary.main",
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <EmojiEvents color="secondary" sx={{ mb: 1 }} />
        <Typography variant="h6" color="text.primary" gutterBottom>
          Redeem your coins soon!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Rewards coming soon 🔒
        </Typography>
      </Paper>
    </Box>
  );
};

export default ParticipantDashboard;
