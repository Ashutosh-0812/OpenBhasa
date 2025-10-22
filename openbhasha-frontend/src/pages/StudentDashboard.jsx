import React, { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  CircularProgress,
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
  Link,
  CheckCircleOutline,
  PendingActions,
  AccessTimeOutlined,
  Share,
  RefreshOutlined,
} from "@mui/icons-material";
import { fetchTasks } from "../features/tasks/taskSlice";
import ParticipantInviteDialog from "../components/ParticipantInviteDialog";
import { participantInviteAPI } from "../api/apiClient";

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

  // Participant Invite State
  const [participantInvites, setParticipantInvites] = useState([]);
  const [invitesLoading, setInvitesLoading] = useState(false);

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
    fetchParticipantInvites();
  }, [dispatch]);

  // Fetch participant invites
  const fetchParticipantInvites = async () => {
    try {
      setInvitesLoading(true);
      const response = await participantInviteAPI.getMyInvites();
      setParticipantInvites(response.data.invites || []);
    } catch (error) {
      console.error("Failed to fetch invites:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch participant invites",
        type: "error",
      });
      setParticipantInvites([]); // Set empty array on error
    } finally {
      setInvitesLoading(false);
    }
  };

  // Handle participant invite creation
  const handleInviteCreated = (newInvite) => {
    setParticipantInvites((prev) => [newInvite.invite, ...prev]);
    setInviteDialog(false);
    setSnackbar({
      open: true,
      message: `Invite created for ${newInvite.invite.participantName}`,
      type: "success",
    });
  };

  // Handle copying invite link
  const handleCopyInviteLink = async (inviteLink, participantName) => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setSnackbar({
        open: true,
        message: `Link copied for ${participantName}`,
        type: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to copy link",
        type: "error",
      });
    }
  };

  // Get status color and icon
  const getStatusDisplay = (status) => {
    switch (status) {
      case "pending":
        return {
          color: "warning",
          icon: <PendingActions />,
          text: "Pending",
        };
      case "accepted":
        return {
          color: "success",
          icon: <CheckCircleOutline />,
          text: "Registered",
        };
      case "expired":
        return {
          color: "error",
          icon: <AccessTimeOutlined />,
          text: "Expired",
        };
      default:
        return {
          color: "default",
          icon: <PendingActions />,
          text: status,
        };
    }
  };

  // Mock achievements and rewards data
  const mockAchievements = [
    {
      id: 1,
      title: "First Recording",
      description: "Complete your first audio recording",
      coins: 50,
      icon: "??",
      earned: true,
      earnedDate: "2024-01-10",
    },
    {
      id: 2,
      title: "Week Warrior",
      description: "Complete recordings for 7 consecutive days",
      coins: 200,
      icon: "??",
      earned: true,
      earnedDate: "2024-01-16",
    },
    {
      id: 3,
      title: "Language Explorer",
      description: "Record in 3 different languages",
      coins: 300,
      icon: "??",
      earned: true,
      earnedDate: "2024-01-15",
    },
    {
      id: 4,
      title: "Quality Champion",
      description: "Get 10 recordings verified in a row",
      coins: 500,
      icon: "?",
      earned: false,
      progress: "8/10",
    },
    {
      id: 5,
      title: "Team Builder",
      description: "Invite 5 participants to join",
      coins: 400,
      icon: "??",
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
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Mic />}
              onClick={() => setActiveTab(2)}
              sx={{ py: 1.5 }}
            >
              My Recordings
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<People />}
              onClick={() => setActiveTab(3)}
              sx={{ py: 1.5 }}
            >
              Manage Participants
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Assignment />}
              onClick={() => setActiveTab(4)}
              sx={{ py: 1.5 }}
            >
              View All Tasks
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
            <Grid size={{ xs: 12, md: 6 }} key={task.id}>
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
        ?? Rewards & Achievements
      </Typography>

      {/* Rewards Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
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

        <Grid size={{ xs: 12, md: 6 }}>
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
                    {userRewards.streak} Day Streak ??
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
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={achievement.id}>
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
          <Grid size={{ xs: 12, md: 6 }}>
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

          <Grid size={{ xs: 12, md: 6 }}>
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
                    secondary={`${recording.taskName} � ${recording.duration} � ${recording.uploadDate}`}
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
          component="h2"
          color="primary.main"
          fontWeight="bold"
        >
          Participant Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshOutlined />}
            onClick={fetchParticipantInvites}
            disabled={invitesLoading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setInviteDialog(true)}
            sx={{
              backgroundColor: "primary.main",
              "&:hover": { backgroundColor: "primary.dark" },
              borderRadius: 2,
            }}
          >
            Invite Participant
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Invitation History
              </Typography>
              {invitesLoading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  p={4}
                >
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  <Typography>Loading invitations...</Typography>
                </Box>
              ) : participantInvites.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Participant</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {participantInvites.map((invite) => {
                        const statusDisplay = getStatusDisplay(invite.status);
                        const inviteLink = invite.inviteLink;
                        const isExpired =
                          new Date(invite.expiresAt) < new Date();

                        return (
                          <TableRow key={invite.id} hover>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {invite.participantName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {invite.institute}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {invite.participantEmail}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Phone: {invite.participantPhone}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={statusDisplay.icon}
                                label={
                                  isExpired && invite.status === "pending"
                                    ? "Expired"
                                    : statusDisplay.text
                                }
                                color={
                                  isExpired && invite.status === "pending"
                                    ? "error"
                                    : statusDisplay.color
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(
                                  invite.createdAt
                                ).toLocaleDateString()}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Expires:{" "}
                                {new Date(
                                  invite.expiresAt
                                ).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" gap={1}>
                                <Tooltip title="Copy Invite Link">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleCopyInviteLink(
                                        inviteLink,
                                        invite.participantName
                                      )
                                    }
                                    disabled={
                                      !inviteLink ||
                                      (isExpired && invite.status === "pending")
                                    }
                                  >
                                    <Link fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Share Link">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      if (navigator.share) {
                                        navigator.share({
                                          title: `Registration Invite - ${invite.participantName}`,
                                          text: `You've been invited to participate in OpenBhasha audio collection`,
                                          url: inviteLink,
                                        });
                                      } else {
                                        handleCopyInviteLink(
                                          inviteLink,
                                          invite.participantName
                                        );
                                      }
                                    }}
                                    disabled={
                                      !inviteLink ||
                                      (isExpired && invite.status === "pending")
                                    }
                                  >
                                    <Share fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" p={4}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    No invitations sent yet.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click "Invite Participant" to create your first invitation.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2">Total Invites:</Typography>
                  <Chip
                    label={participantInvites.length}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2">Registered:</Typography>
                  <Chip
                    label={
                      participantInvites.filter(
                        (invite) => invite.status === "accepted"
                      ).length
                    }
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2">Pending:</Typography>
                  <Chip
                    label={
                      participantInvites.filter(
                        (invite) =>
                          invite.status === "pending" &&
                          new Date(invite.expiresAt) > new Date()
                      ).length
                    }
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2">Expired:</Typography>
                  <Chip
                    label={
                      participantInvites.filter(
                        (invite) =>
                          invite.status === "pending" &&
                          new Date(invite.expiresAt) < new Date()
                      ).length
                    }
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Add />}
                  onClick={() => setInviteDialog(true)}
                >
                  New Invite
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<RefreshOutlined />}
                  onClick={fetchParticipantInvites}
                  disabled={invitesLoading}
                >
                  Refresh Data
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ParticipantInviteDialog
        open={inviteDialog}
        onClose={() => setInviteDialog(false)}
        onInviteCreated={handleInviteCreated}
      />
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
          <Grid size={{ xs: 12, md: 6 }} key={task.id}>
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
                    � {task.assignedParticipants} participants
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

      {/* Participant Invite Dialog */}
      <ParticipantInviteDialog
        open={inviteDialog}
        onClose={() => setInviteDialog(false)}
        onInviteCreated={handleInviteCreated}
      />

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
