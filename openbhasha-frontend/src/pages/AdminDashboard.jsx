import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Paper,
} from "@mui/material";
import {
  People,
  Assignment,
  Analytics,
  Settings,
  Add,
} from "@mui/icons-material";
import Header from "../components/Header";

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [selectedTab, setSelectedTab] = useState(0);

  // Basic admin statistics
  const stats = {
    totalUsers: 2847,
    activeUsers: 1623,
    totalTasks: 156,
    activeTasks: 89,
    totalRecordings: 45623,
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleCreateTask = () => {
    // Navigate to task creation
  };

  const handleCreateUser = () => {
    // Navigate to user creation
  };

  const handleViewAnalytics = () => {
    // Navigate to analytics
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Header userRole="admin" />

      <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h1" component="h1" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.name || "Admin"} 👋
          </Typography>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0}>
              <CardContent sx={{ textAlign: "center" }}>
                <People sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
                <Typography variant="h4" color="primary.main">
                  {stats.totalUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0}>
              <CardContent sx={{ textAlign: "center" }}>
                <Assignment
                  sx={{ fontSize: 48, color: "secondary.main", mb: 1 }}
                />
                <Typography variant="h4" color="secondary.main">
                  {stats.totalTasks}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tasks
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0}>
              <CardContent sx={{ textAlign: "center" }}>
                <Analytics
                  sx={{ fontSize: 48, color: "success.main", mb: 1 }}
                />
                <Typography variant="h4" color="success.main">
                  {stats.totalRecordings}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Recordings
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0}>
              <CardContent sx={{ textAlign: "center" }}>
                <Settings sx={{ fontSize: 48, color: "warning.main", mb: 1 }} />
                <Typography variant="h4" color="warning.main">
                  {stats.activeTasks}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Tasks
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card elevation={0} sx={{ mb: 4, p: 3 }}>
          <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
            Quick Actions
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateTask}
            >
              Create Task
            </Button>
            <Button
              variant="outlined"
              startIcon={<People />}
              onClick={handleCreateUser}
            >
              Manage Users
            </Button>
            <Button
              variant="outlined"
              startIcon={<Analytics />}
              onClick={handleViewAnalytics}
            >
              View Analytics
            </Button>
          </Box>
        </Card>

        {/* Recent Activity Placeholder */}
        <Card elevation={0}>
          <CardContent>
            <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
              Recent Activity
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Activity feed will be implemented here
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
