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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Badge,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  CheckCircle,
  Cancel,
  Flag,
  Search,
  FilterList,
  PlaylistPlay,
  Assignment,
  Schedule,
  TrendingUp,
  Star,
  Headset,
  Speed,
  Settings,
  Help,
  Download,
  Upload,
  VolumeUp,
  Comment,
  Refresh,
  Home,
  Queue,
  Analytics,
  Logout,
} from "@mui/icons-material";
import {
  fetchPendingAudios,
  submitReviewVerdict,
} from "../features/review/reviewSlice";

const ReviewerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { pendingAudios, loading, error, reviewStats } = useSelector(
    (state) => state.review
  );

  // Navigation state
  const [activeTab, setActiveTab] = useState(0);
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [filterLanguage, setFilterLanguage] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentAudio, setCurrentAudio] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [reviewDialog, setReviewDialog] = useState(null);
  const [batchAction, setBatchAction] = useState("");

  useEffect(() => {
    dispatch(fetchPendingAudios());
  }, [dispatch]);

  // Navigation handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Mock data for demo
  const mockPendingAudios = [
    {
      id: 1,
      fileName: "hindi_story_001.wav",
      language: "Hindi",
      contributor: "John Doe",
      uploadDate: "2024-01-15",
      duration: "00:02:45",
      status: "pending",
      taskTitle: "Hindi Folk Tales",
      priority: "high",
    },
    {
      id: 2,
      fileName: "bengali_poem_005.wav",
      language: "Bengali",
      contributor: "Jane Smith",
      uploadDate: "2024-01-15",
      duration: "00:01:30",
      status: "pending",
      taskTitle: "Bengali Poetry Collection",
      priority: "medium",
    },
    {
      id: 3,
      fileName: "gujarati_conv_012.wav",
      language: "Gujarati",
      contributor: "Raj Patel",
      uploadDate: "2024-01-14",
      duration: "00:03:20",
      status: "pending",
      taskTitle: "Gujarati Conversations",
      priority: "low",
    },
  ];

  const displayAudios =
    pendingAudios?.length > 0 ? pendingAudios : mockPendingAudios;

  // Calculate reviewer statistics
  const getReviewerStats = () => {
    return {
      todayReviews: 12,
      weeklyReviews: 89,
      totalReviews: 1543,
      averageRating: 4.2,
      pendingCount: displayAudios.filter((audio) => audio.status === "pending")
        .length,
      approvedToday: 8,
      rejectedToday: 2,
      flaggedToday: 2,
    };
  };

  const stats = getReviewerStats();

  const handleReviewSubmit = (audioId, verdict, rating, comments) => {
    dispatch(
      submitReviewVerdict({
        audioId,
        verdict,
        rating,
        comments,
      })
    );
    setReviewDialog(null);
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Dashboard
        return (
          <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h1" component="h1" gutterBottom>
                Reviewer Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome back, {user?.name || "Reviewer"} 👋 Review and approve
                audio submissions
              </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card elevation={0}>
                  <CardContent sx={{ textAlign: "center", p: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: "primary.light",
                        color: "primary.main",
                        width: 48,
                        height: 48,
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      <CheckCircle />
                    </Avatar>
                    <Typography variant="h4" component="div">
                      {stats.todayReviews}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reviews Today
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card elevation={0}>
                  <CardContent sx={{ textAlign: "center", p: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: "warning.light",
                        color: "warning.main",
                        width: 48,
                        height: 48,
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      <Schedule />
                    </Avatar>
                    <Typography variant="h4" component="div">
                      {stats.pendingCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Reviews
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card elevation={0}>
                  <CardContent sx={{ textAlign: "center", p: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: "success.light",
                        color: "success.main",
                        width: 48,
                        height: 48,
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      <Star />
                    </Avatar>
                    <Typography variant="h4" component="div">
                      {stats.averageRating}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Rating
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card elevation={0}>
                  <CardContent sx={{ textAlign: "center", p: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: "info.light",
                        color: "info.main",
                        width: 48,
                        height: 48,
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      <TrendingUp />
                    </Avatar>
                    <Typography variant="h4" component="div">
                      {stats.weeklyReviews}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This Week
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Quick Actions */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  startIcon={<Queue />}
                  onClick={() => setActiveTab(1)}
                >
                  Review Queue
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Analytics />}
                  onClick={() => setActiveTab(2)}
                >
                  View Analytics
                </Button>
              </Box>
            </Box>

            {/* Recent Activity */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
                Today's Activity
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{ p: 2, bgcolor: "success.light", borderRadius: 2 }}
                  >
                    <Typography variant="h6" color="success.main">
                      {stats.approvedToday} Approved
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Audio submissions approved today
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{ p: 2, bgcolor: "error.light", borderRadius: 2 }}
                  >
                    <Typography variant="h6" color="error.main">
                      {stats.rejectedToday} Rejected
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Audio submissions rejected today
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{ p: 2, bgcolor: "warning.light", borderRadius: 2 }}
                  >
                    <Typography variant="h6" color="warning.main">
                      {stats.flaggedToday} Flagged
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Audio submissions flagged today
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Box>
        );

      case 1: // Review Queue
        return (
          <Box>
            <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
              Audio Review Queue
            </Typography>

            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Filters */}
            <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="reviewed">Reviewed</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Language</InputLabel>
                <Select
                  value={filterLanguage}
                  onChange={(e) => setFilterLanguage(e.target.value)}
                >
                  <MenuItem value="all">All Languages</MenuItem>
                  <MenuItem value="Hindi">Hindi</MenuItem>
                  <MenuItem value="Bengali">Bengali</MenuItem>
                  <MenuItem value="Gujarati">Gujarati</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size="small"
                placeholder="Search by contributor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Search sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Box>

            {/* Audio List */}
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Audio File</TableCell>
                    <TableCell>Language</TableCell>
                    <TableCell>Contributor</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Upload Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayAudios.map((audio) => (
                    <TableRow key={audio.id} hover>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <VolumeUp fontSize="small" />
                          <Typography variant="body2">
                            {audio.fileName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={audio.language}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{audio.contributor}</TableCell>
                      <TableCell>{audio.duration}</TableCell>
                      <TableCell>
                        <Chip
                          label={audio.priority}
                          size="small"
                          color={getPriorityColor(audio.priority)}
                        />
                      </TableCell>
                      <TableCell>{audio.uploadDate}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="Play Audio">
                            <IconButton size="small" color="primary">
                              <PlayArrow />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Review">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => setReviewDialog(audio)}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton size="small" color="error">
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );

      case 2: // Analytics
        return (
          <Box>
            <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
              Review Analytics
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: "center",
                bgcolor: "grey.50",
                borderRadius: 2,
              }}
            >
              <Analytics
                sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Analytics Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Detailed analytics and reporting features coming soon.
              </Typography>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

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
            <Tab
              icon={
                <Badge badgeContent={stats.pendingCount} color="error">
                  <Queue />
                </Badge>
              }
              label="Review Queue"
            />
            <Tab icon={<Analytics />} label="Analytics" />
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
              {user?.name?.charAt(0) || "R"}
            </Avatar>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
              Reviewer
            </Typography>
            <IconButton color="inherit" onClick={handleLogout}>
              <Logout />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>{renderTabContent()}</Box>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog !== null}
        onClose={() => setReviewDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Review Audio Submission</DialogTitle>
        <DialogContent>
          {reviewDialog && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>File:</strong> {reviewDialog.fileName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Contributor:</strong> {reviewDialog.contributor}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Task:</strong> {reviewDialog.taskTitle}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Duration:</strong> {reviewDialog.duration}
              </Typography>

              <Typography variant="body2" gutterBottom>
                Quality Rating:
              </Typography>
              <Rating defaultValue={4} sx={{ mb: 2 }} />

              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Add comments (optional)"
                variant="outlined"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(null)}>Cancel</Button>
          <Button variant="outlined" color="error">
            Reject
          </Button>
          <Button variant="contained" color="success">
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewerDashboard;
