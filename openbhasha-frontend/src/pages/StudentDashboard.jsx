﻿import React, { useState, useEffect } from "react";
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
  AppBar,
  Toolbar,
  Tab,
  Tabs,
  Avatar,
  IconButton,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  PlayArrow,
  CheckCircle,
  Language,
  Headset,
  Home,
  Mic,
  People,
  Assignment,
  Logout,
  ContentCopy,
  Add,
  Visibility,
  Info,
  AudioFile,
  Schedule,
  VerifiedUser,
  Stars,
  TrendingUp,
  EmojiEvents,
  LocalFireDepartment,
} from "@mui/icons-material";
import { fetchTasks } from "../features/tasks/taskSlice";

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { tasks, loading, error } = useSelector((state) => state.tasks);

  const [activeTab, setActiveTab] = useState(0);
  const [inviteDialog, setInviteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });

  // Rewards System State
  const [userRewards, setUserRewards] = useState({
    totalCoins: 2450,
    dailyCoins: 150,
    weeklyCoins: 890,
    monthlyCoins: 2450,
    streak: 7,
    level: 12,
    nextLevelCoins: 2800,
    achievements: [],
    recentEarnings: [],
  });

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  // Mock achievements and rewards data
  const mockAchievements = [
    {
      id: 1,
      title: "First Recording",
      description: "Complete your first audio recording",
      coins: 50,
      icon: "🎤",
      earned: true,
      earnedDate: "2024-01-10",
    },
    {
      id: 2,
      title: "Week Warrior",
      description: "Complete recordings for 7 consecutive days",
      coins: 200,
      icon: "🔥",
      earned: true,
      earnedDate: "2024-01-16",
    },
    {
      id: 3,
      title: "Language Explorer",
      description: "Record in 3 different languages",
      coins: 300,
      icon: "🌍",
      earned: true,
      earnedDate: "2024-01-15",
    },
    {
      id: 4,
      title: "Quality Champion",
      description: "Get 10 recordings verified in a row",
      coins: 500,
      icon: "⭐",
      earned: false,
      progress: "8/10",
    },
    {
      id: 5,
      title: "Team Builder",
      description: "Invite 5 participants to join",
      coins: 400,
      icon: "👥",
      earned: false,
      progress: "3/5",
    },
  ];

  const mockRecentEarnings = [
    { activity: "Completed Bengali Story", coins: 25, time: "2 hours ago" },
    { activity: "Daily Login Bonus", coins: 10, time: "Today" },
    { activity: "Achievement: Week Warrior", coins: 200, time: "Today" },
    { activity: "Quality Recording Bonus", coins: 15, time: "Yesterday" },
    { activity: "Participant Joined (Priya)", coins: 50, time: "2 days ago" },
  ];

  // Mock data for comprehensive dashboard
  const mockTasks = [
    {
      id: 1,
      title: "Bengali Story Narration",
      language: "Bengali",
      completed: 10,
      totalPrompts: 20,
      status: "in_progress",
      description: "Narrate traditional Bengali stories with expression",
      assignedParticipants: 3,
      coinsPerRecording: 25,
      bonusCoins: 50,
      totalEarned: 250,
    },
    {
      id: 2,
      title: "Hindi Conversation Practice",
      language: "Hindi",
      completed: 0,
      totalPrompts: 25,
      status: "pending",
      description: "Practice daily conversation scenarios in Hindi",
      assignedParticipants: 5,
      coinsPerRecording: 20,
      bonusCoins: 100,
      totalEarned: 0,
    },
    {
      id: 3,
      title: "Marathi Poetry Reading",
      language: "Marathi",
      completed: 15,
      totalPrompts: 15,
      status: "completed",
      description: "Read classic Marathi poems with proper pronunciation",
      assignedParticipants: 2,
      coinsPerRecording: 30,
      bonusCoins: 200,
      totalEarned: 650,
    },
  ];

  const mockParticipants = [
    {
      id: 1,
      name: "Priya Sharma",
      status: "active",
      tasksAssigned: 2,
      recordingsCompleted: 25,
      totalRecordings: 35,
      joinedDate: "2024-01-15",
      coinsEarned: 625,
      level: 8,
      streak: 5,
      referralBonus: 50,
    },
    {
      id: 2,
      name: "Rahul Patel",
      status: "active",
      tasksAssigned: 1,
      recordingsCompleted: 18,
      totalRecordings: 20,
      joinedDate: "2024-01-20",
      coinsEarned: 450,
      level: 6,
      streak: 3,
      referralBonus: 50,
    },
    {
      id: 3,
      name: "Anita Roy",
      status: "completed",
      tasksAssigned: 3,
      recordingsCompleted: 40,
      totalRecordings: 40,
      joinedDate: "2024-01-10",
      coinsEarned: 1000,
      level: 15,
      streak: 12,
      referralBonus: 50,
    },
  ];

  const mockRecordings = [
    {
      id: 1,
      filename: "bengali_story_001.wav",
      taskName: "Bengali Story Narration",
      duration: "0:45",
      status: "verified",
      uploadDate: "2024-01-16",
    },
    {
      id: 2,
      filename: "hindi_conv_002.wav",
      taskName: "Hindi Conversation Practice",
      duration: "1:12",
      status: "pending_review",
      uploadDate: "2024-01-16",
    },
    {
      id: 3,
      filename: "marathi_poem_005.wav",
      taskName: "Marathi Poetry Reading",
      duration: "2:30",
      status: "verified",
      uploadDate: "2024-01-15",
    },
  ];

  const displayTasks = tasks.length > 0 ? tasks : mockTasks;

  // Calculate dashboard metrics
  const metrics = {
    recordingsDone: mockRecordings.length + 42, // 42 + 3 visible = 45
    pendingTasks: displayTasks.filter((task) => task.status !== "completed")
      .length,
    participants: mockParticipants.length + 9, // 3 + 9 = 12
    verifiedRecordings:
      mockRecordings.filter((r) => r.status === "verified").length + 25, // 2 + 25 = 27
  };

  const referralLink = `https://openbhasha.org/join?ref=${
    user?.id || "student123"
  }`;

  const handleStartTask = (task) => {
    console.log("Navigating to task recording:", task.id);
    navigate(`/student/tasks/${task.id}/record`);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setSnackbar({
      open: true,
      message: "Referral link copied!",
      type: "success",
    });
  };

  const handleLogout = () => {
    // Handle logout logic
    navigate("/login");
  };

  const getProgressPercentage = (completed, total) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "primary";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusText = (task) => {
    if (task.completed === task.totalPrompts) return "Completed";
    if (task.completed > 0) return "Continue Recording";
    return "Start Recording";
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Dashboard
        return renderDashboardContent();
      case 1: // Rewards
        return renderRewardsContent();
      case 2: // My Recordings
        return renderRecordingsContent();
      case 3: // My Participants
        return renderParticipantsContent();
      case 4: // Assigned Tasks
        return renderTasksContent();
      default:
        return renderDashboardContent();
    }
  };

  const renderDashboardContent = () => (
    <Box>
      {/* Dashboard Summary Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{ mb: 3, color: "primary.main", fontWeight: "medium" }}
        >
          Dashboard Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={2}
              sx={{
                bgcolor: "secondary.light",
                border: "1px solid",
                borderColor: "secondary.main",
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Headset sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {metrics.recordingsDone}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Recordings Done
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={2}
              sx={{
                bgcolor: "secondary.light",
                border: "1px solid",
                borderColor: "secondary.main",
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Schedule sx={{ fontSize: 40, color: "warning.main", mb: 1 }} />
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {metrics.pendingTasks}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Tasks
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={2}
              sx={{
                bgcolor: "secondary.light",
                border: "1px solid",
                borderColor: "secondary.main",
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <People sx={{ fontSize: 40, color: "info.main", mb: 1 }} />
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {metrics.participants}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Participants
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={2}
              sx={{
                bgcolor: "secondary.light",
                border: "1px solid",
                borderColor: "secondary.main",
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <VerifiedUser
                  sx={{ fontSize: 40, color: "success.main", mb: 1 }}
                />
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {metrics.verifiedRecordings}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Verified Recordings
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Rewards Overview Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{ mb: 3, color: "primary.main", fontWeight: "medium" }}
        >
          🪙 Rewards & Progress
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={2}
              sx={{
                bgcolor: "warning.light",
                border: "1px solid",
                borderColor: "warning.main",
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Stars sx={{ fontSize: 40, color: "warning.dark", mb: 1 }} />
                <Typography variant="h4" color="warning.dark" fontWeight="bold">
                  {userRewards.totalCoins}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Coins
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={2}
              sx={{
                bgcolor: "success.light",
                border: "1px solid",
                borderColor: "success.main",
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <LocalFireDepartment
                  sx={{ fontSize: 40, color: "error.main", mb: 1 }}
                />
                <Typography variant="h4" color="error.main" fontWeight="bold">
                  {userRewards.streak}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Day Streak
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={2}
              sx={{
                bgcolor: "info.light",
                border: "1px solid",
                borderColor: "info.main",
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <TrendingUp sx={{ fontSize: 40, color: "info.dark", mb: 1 }} />
                <Typography variant="h4" color="info.dark" fontWeight="bold">
                  {userRewards.level}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Level
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={2}
              sx={{
                bgcolor: "secondary.light",
                border: "1px solid",
                borderColor: "secondary.main",
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <EmojiEvents
                  sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
                />
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {mockAchievements.filter((a) => a.earned).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Achievements
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Level Progress Bar */}
        <Box
          sx={{
            mt: 3,
            p: 3,
            bgcolor: "background.paper",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" color="text.primary">
              Level {userRewards.level} Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userRewards.totalCoins} / {userRewards.nextLevelCoins} coins
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(userRewards.totalCoins / userRewards.nextLevelCoins) * 100}
            sx={{ height: 8, borderRadius: 4, bgcolor: "grey.200" }}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, textAlign: "center" }}
          >
            {userRewards.nextLevelCoins - userRewards.totalCoins} coins to level{" "}
            {userRewards.level + 1}
          </Typography>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Mic />}
              onClick={() => setActiveTab(1)}
              sx={{ py: 1.5 }}
            >
              My Recordings
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<People />}
              onClick={() => setActiveTab(2)}
              sx={{ py: 1.5 }}
            >
              Manage Participants
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Assignment />}
              onClick={() => setActiveTab(3)}
              sx={{ py: 1.5 }}
            >
              View All Tasks
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setInviteDialog(true)}
              sx={{ py: 1.5 }}
            >
              Invite Participant
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Recent Tasks Preview */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
          Recent Tasks
        </Typography>
        <Grid container spacing={2}>
          {displayTasks.slice(0, 2).map((task) => (
            <Grid item xs={12} md={6} key={task.id}>
              <Card elevation={2}>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="start"
                    mb={2}
                  >
                    <Typography variant="h6" color="primary.main">
                      {task.title}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Chip
                        label={`${task.coinsPerRecording} coins`}
                        size="small"
                        color="warning"
                        icon={<Stars />}
                      />
                      <Chip
                        label={task.language}
                        size="small"
                        color="primary"
                        variant="outlined"
                        icon={<Language />}
                      />
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getProgressPercentage(
                      task.completed,
                      task.totalPrompts
                    )}
                    sx={{ mb: 2, height: 8, borderRadius: 4 }}
                  />
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="text.secondary">
                      {task.completed} / {task.totalPrompts} completed
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => handleStartTask(task)}
                    >
                      {getStatusText(task)}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );

  const renderRewardsContent = () => (
    <Box>
      <Typography
        variant="h5"
        sx={{ mb: 3, color: "primary.main", fontWeight: "medium" }}
      >
        🏆 Rewards & Achievements
      </Typography>

      {/* Rewards Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card
            elevation={2}
            sx={{
              p: 2,
              bgcolor: "warning.light",
              border: "1px solid",
              borderColor: "warning.main",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Stars sx={{ fontSize: 32, color: "warning.dark", mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    color="warning.dark"
                    fontWeight="bold"
                  >
                    {userRewards.totalCoins} Coins
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Balance
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" color="warning.dark">
                    {userRewards.dailyCoins}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Today
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" color="warning.dark">
                    {userRewards.weeklyCoins}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    This Week
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" color="warning.dark">
                    {userRewards.monthlyCoins}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    This Month
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            elevation={2}
            sx={{
              p: 2,
              bgcolor: "info.light",
              border: "1px solid",
              borderColor: "info.main",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingUp sx={{ fontSize: 32, color: "info.dark", mr: 2 }} />
                <Box>
                  <Typography variant="h5" color="info.dark" fontWeight="bold">
                    Level {userRewards.level}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userRewards.streak} Day Streak 🔥
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Progress to Level {userRewards.level + 1}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userRewards.totalCoins}/{userRewards.nextLevelCoins}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={
                    (userRewards.totalCoins / userRewards.nextLevelCoins) * 100
                  }
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Earnings */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
          Recent Earnings
        </Typography>
        <Card
          elevation={2}
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <List>
            {mockRecentEarnings.map((earning, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemIcon>
                    <Stars sx={{ color: "warning.main" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={earning.activity}
                    secondary={earning.time}
                  />
                  <Chip
                    label={`+${earning.coins} coins`}
                    color="warning"
                    size="small"
                    sx={{ fontWeight: "bold" }}
                  />
                </ListItem>
                {index < mockRecentEarnings.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Card>
      </Box>

      {/* Achievements */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
          Achievements
        </Typography>
        <Grid container spacing={3}>
          {mockAchievements.map((achievement) => (
            <Grid item xs={12} sm={6} md={4} key={achievement.id}>
              <Card
                elevation={2}
                sx={{
                  bgcolor: achievement.earned ? "success.light" : "grey.100",
                  border: "1px solid",
                  borderColor: achievement.earned ? "success.main" : "grey.300",
                  opacity: achievement.earned ? 1 : 0.7,
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {achievement.icon}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.primary"
                    fontWeight="bold"
                  >
                    {achievement.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {achievement.description}
                  </Typography>
                  <Chip
                    label={`${achievement.coins} coins`}
                    color={achievement.earned ? "success" : "default"}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  {achievement.earned ? (
                    <Box>
                      <CheckCircle
                        sx={{ color: "success.main", fontSize: 20 }}
                      />
                      <Typography
                        variant="caption"
                        color="success.main"
                        display="block"
                      >
                        Earned {achievement.earnedDate}
                      </Typography>
                    </Box>
                  ) : achievement.progress ? (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Progress: {achievement.progress}
                    </Typography>
                  ) : (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Not yet earned
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Coin Earning Opportunities */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
          Earn More Coins
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card
              elevation={2}
              sx={{
                bgcolor: "primary.light",
                border: "1px solid",
                borderColor: "primary.main",
              }}
            >
              <CardContent>
                <Typography variant="h6" color="primary.dark" fontWeight="bold">
                  Complete Daily Tasks
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Earn bonus coins for completing recordings daily
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Chip
                    label="10-50 coins per recording"
                    color="primary"
                    size="small"
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setActiveTab(0)}
                  >
                    Start Recording
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              elevation={2}
              sx={{
                bgcolor: "secondary.light",
                border: "1px solid",
                borderColor: "secondary.main",
              }}
            >
              <CardContent>
                <Typography variant="h6" color="primary.dark" fontWeight="bold">
                  Invite Participants
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Get 50 coins for each participant you refer
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Chip
                    label="50 coins per referral"
                    color="secondary"
                    size="small"
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setActiveTab(3)}
                  >
                    Invite Now
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

  const renderRecordingsContent = () => (
    <Box>
      <Typography
        variant="h5"
        sx={{ mb: 3, color: "primary.main", fontWeight: "medium" }}
      >
        My Recordings
      </Typography>
      <Card elevation={2}>
        <CardContent>
          <List>
            {mockRecordings.map((recording, index) => (
              <React.Fragment key={recording.id}>
                <ListItem>
                  <ListItemIcon>
                    <AudioFile color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={recording.filename}
                    secondary={`${recording.taskName} • ${recording.duration} • ${recording.uploadDate}`}
                  />
                  <Chip
                    label={
                      recording.status === "verified"
                        ? "Verified"
                        : "Pending Review"
                    }
                    color={
                      recording.status === "verified" ? "success" : "warning"
                    }
                    size="small"
                  />
                </ListItem>
                {index < mockRecordings.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button variant="outlined" startIcon={<Visibility />}>
              View All Recordings ({metrics.recordingsDone} total)
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderParticipantsContent = () => (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography
          variant="h5"
          sx={{ color: "primary.main", fontWeight: "medium" }}
        >
          My Participants
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setInviteDialog(true)}
        >
          Invite New Participant
        </Button>
      </Box>

      {/* Referral Link Card */}
      <Card elevation={2} sx={{ mb: 3, bgcolor: "secondary.light" }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
            🔗 My Referral Link
          </Typography>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              size="small"
              value={referralLink}
              InputProps={{ readOnly: true }}
            />
            <IconButton onClick={handleCopyReferralLink} color="primary">
              <ContentCopy />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Participants List */}
      <Grid container spacing={3}>
        {mockParticipants.map((participant) => (
          <Grid item xs={12} md={6} key={participant.id}>
            <Card elevation={2}>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="start"
                  mb={2}
                >
                  <Box>
                    <Typography variant="h6" color="primary.main">
                      {participant.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Joined: {participant.joinedDate}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                        mt: 1,
                      }}
                    >
                      <Chip
                        label={`${participant.coinsEarned} coins`}
                        size="small"
                        color="warning"
                        icon={<Stars />}
                      />
                      <Chip
                        label={`Level ${participant.level}`}
                        size="small"
                        color="info"
                        icon={<TrendingUp />}
                      />
                    </Box>
                  </Box>
                  <Chip
                    label={participant.status}
                    color={
                      participant.status === "active" ? "success" : "default"
                    }
                    size="small"
                  />
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Tasks Assigned: {participant.tasksAssigned}
                </Typography>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="body2">
                    Progress: {participant.recordingsCompleted} /{" "}
                    {participant.totalRecordings}
                  </Typography>
                  <Typography variant="body2" color="primary.main">
                    {Math.round(
                      (participant.recordingsCompleted /
                        participant.totalRecordings) *
                        100
                    )}
                    %
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={
                    (participant.recordingsCompleted /
                      participant.totalRecordings) *
                    100
                  }
                  sx={{ mb: 2, height: 6, borderRadius: 3 }}
                />
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Visibility />}
                  size="small"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderTasksContent = () => (
    <Box>
      <Typography
        variant="h5"
        sx={{ mb: 3, color: "primary.main", fontWeight: "medium" }}
      >
        Assigned Tasks
      </Typography>
      <Grid container spacing={3}>
        {displayTasks.map((task) => (
          <Grid item xs={12} md={6} key={task.id}>
            <Card elevation={2}>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="start"
                  mb={2}
                >
                  <Typography variant="h6" color="primary.main">
                    {task.title}
                  </Typography>
                  <Chip
                    label={task.status}
                    color={getStatusColor(task.status)}
                    size="small"
                  />
                </Box>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Language sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Chip label={task.language} size="small" variant="outlined" />
                  <Typography variant="body2" color="text.secondary">
                    • {task.assignedParticipants} participants
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {task.description}
                </Typography>
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {task.completed} / {task.totalPrompts}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getProgressPercentage(
                      task.completed,
                      task.totalPrompts
                    )}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={() => handleStartTask(task)}
                    sx={{ flex: 1 }}
                  >
                    {getStatusText(task)}
                  </Button>
                  <Button variant="outlined" startIcon={<Info />}>
                    Details
                  </Button>
                  <Button variant="outlined" startIcon={<Visibility />}>
                    Participants
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header Bar */}
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: "primary.main" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            OpenBhasha
          </Typography>

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              minHeight: "auto",
              "& .MuiTab-root": {
                color: "rgba(255,255,255,0.7)",
                "&.Mui-selected": { color: "white" },
              },
              "& .MuiTabs-indicator": { backgroundColor: "secondary.main" },
            }}
          >
            <Tab icon={<Home />} label="Dashboard" />
            <Tab icon={<Stars />} label="Rewards" />
            <Tab icon={<Mic />} label="My Recordings" />
            <Tab icon={<People />} label="My Participants" />
            <Tab icon={<Assignment />} label="Assigned Tasks" />
          </Tabs>

          <Box sx={{ ml: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "secondary.main",
                color: "primary.main",
              }}
            >
              {user?.name?.charAt(0) || "S"}
            </Avatar>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
              Student
            </Typography>
            <IconButton color="inherit" onClick={handleLogout}>
              <Logout />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>{renderTabContent()}</Box>

      {/* Invite Dialog */}
      <Dialog
        open={inviteDialog}
        onClose={() => setInviteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Invite New Participant</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Share this link with people you want to invite as participants:
            </Typography>
            <Box display="flex" gap={1} mb={2}>
              <TextField
                fullWidth
                size="small"
                value={referralLink}
                InputProps={{ readOnly: true }}
              />
              <IconButton onClick={handleCopyReferralLink} color="primary">
                <ContentCopy />
              </IconButton>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            When someone joins using your referral link, they'll become your
            participant and you can assign tasks to them.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialog(false)}>Close</Button>
          <Button onClick={handleCopyReferralLink} variant="contained">
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.type}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentDashboard;