import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Chip,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Search,
  FilterList,
  ViewList,
  ViewModule,
  Language,
  CheckCircle,
  PlayArrow,
  Pause,
} from "@mui/icons-material";
import TaskCard from "./TaskCard";

const TaskList = ({
  tasks = [],
  loading = false,
  error = null,
  userRole = "student",
  onStartTask,
  onContinueTask,
  showFilters = true,
  compact = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState(compact ? "list" : "grid");

  // Get unique values for filters
  const languages = [...new Set(tasks.map((task) => task.language))];
  const types = [...new Set(tasks.map((task) => task.type))];

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLanguage =
      languageFilter === "all" || task.language === languageFilter;
    const matchesType = typeFilter === "all" || task.type === typeFilter;

    let matchesStatus = true;
    if (statusFilter === "not_started") {
      matchesStatus = (task.completed || 0) === 0 && (task.skipped || 0) === 0;
    } else if (statusFilter === "in_progress") {
      matchesStatus =
        (task.completed || 0) + (task.skipped || 0) > 0 &&
        (task.completed || 0) < (task.totalPrompts || 0);
    } else if (statusFilter === "completed") {
      matchesStatus = (task.completed || 0) === (task.totalPrompts || 0);
    }

    return matchesSearch && matchesLanguage && matchesType && matchesStatus;
  });

  const getStatusCounts = () => {
    const counts = {
      all: tasks.length,
      not_started: 0,
      in_progress: 0,
      completed: 0,
    };

    tasks.forEach((task) => {
      const completed = task.completed || 0;
      const skipped = task.skipped || 0;
      const totalPrompts = task.totalPrompts || 0;
      const totalAttempted = completed + skipped;

      if (totalAttempted === 0) {
        counts.not_started++;
      } else if (completed < totalPrompts) {
        counts.in_progress++;
      } else {
        counts.completed++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  const formatTaskType = (type) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading tasks...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Typography variant="h5" component="h2" color="primary.main">
          {userRole === "participant" ? "Available Tasks" : "Your Tasks"}
        </Typography>

        {!compact && (
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="grid">
              <ViewModule />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewList />
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>

      {/* Status Overview */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
        <Chip
          icon={<PlayArrow />}
          label={`All (${statusCounts.all})`}
          onClick={() => setStatusFilter("all")}
          color={statusFilter === "all" ? "primary" : "default"}
          variant={statusFilter === "all" ? "filled" : "outlined"}
        />
        <Chip
          icon={<PlayArrow />}
          label={`Not Started (${statusCounts.not_started})`}
          onClick={() => setStatusFilter("not_started")}
          color={statusFilter === "not_started" ? "primary" : "default"}
          variant={statusFilter === "not_started" ? "filled" : "outlined"}
        />
        <Chip
          icon={<Pause />}
          label={`In Progress (${statusCounts.in_progress})`}
          onClick={() => setStatusFilter("in_progress")}
          color={statusFilter === "in_progress" ? "primary" : "default"}
          variant={statusFilter === "in_progress" ? "filled" : "outlined"}
        />
        <Chip
          icon={<CheckCircle />}
          label={`Completed (${statusCounts.completed})`}
          onClick={() => setStatusFilter("completed")}
          color={statusFilter === "completed" ? "success" : "default"}
          variant={statusFilter === "completed" ? "filled" : "outlined"}
        />
      </Box>

      {/* Filters */}
      {showFilters && (
        <Paper
          elevation={0}
          sx={{ p: 2, mb: 3, border: "1px solid", borderColor: "divider" }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Language</InputLabel>
                <Select
                  value={languageFilter}
                  label="Language"
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <Language />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Languages</MenuItem>
                  {languages.map((lang) => (
                    <MenuItem key={lang} value={lang}>
                      {lang}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  {types.map((type) => (
                    <MenuItem key={type} value={type}>
                      {formatTaskType(type)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary" align="center">
                {filteredTasks.length} of {tasks.length} tasks
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Task Grid/List */}
      {filteredTasks.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tasks found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tasks.length === 0
              ? "No tasks have been assigned to you yet."
              : "Try adjusting your search or filter criteria."}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={viewMode === "grid" ? 3 : 0}>
          {filteredTasks.map((task) => (
            <Grid
              item
              xs={12}
              md={viewMode === "grid" ? 6 : 12}
              lg={viewMode === "grid" ? 4 : 12}
              key={task.id}
            >
              <TaskCard
                task={task}
                userRole={userRole}
                onStartTask={onStartTask}
                onContinueTask={onContinueTask}
                compact={viewMode === "list"}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default TaskList;
