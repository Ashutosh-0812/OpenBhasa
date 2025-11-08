import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as TasksIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  CheckCircle as CompletedIcon,
  Warning as IssuesIcon,
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import '@fontsource/poppins/700.css';
import { User } from '@/types';
import { useDashboard } from '@/hooks/useDashboard';

interface AdminDashboardProps {
  user: User;
}

interface RecentActivity {
  id: string;
  type: 'user_registered' | 'task_completed' | 'review_submitted' | 'system_alert';
  user: string;
  action: string;
  time: string;
  status?: 'success' | 'warning' | 'error';
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  onClick: () => void;
}

// Real data from backend via useDashboard hook

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  // Use the dashboard hook to get real data
  const { stats, loading, error, refresh } = useDashboard();

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Mock recent activity - to be replaced with real backend data later
  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'user_registered',
      user: 'New User',
      action: 'Student registered',
      time: '5 minutes ago',
      status: 'success',
    },
    {
      id: '2',
      type: 'task_completed',
      user: 'Participant',
      action: 'Task completed',
      time: '15 minutes ago',
      status: 'success',
    },
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'create-task',
      label: 'Create Task',
      icon: AddIcon,
      color: 'primary',
      onClick: () => console.log('Create task'),
    },
    {
      id: 'manage-users',
      label: 'Manage Users',
      icon: PeopleIcon,
      color: 'secondary',
      onClick: () => console.log('Manage users'),
    },
    {
      id: 'view-analytics',
      label: 'Analytics',
      icon: AnalyticsIcon,
      color: 'success',
      onClick: () => console.log('View analytics'),
    },
    {
      id: 'system-settings',
      label: 'Settings',
      icon: SettingsIcon,
      color: 'warning',
      onClick: () => console.log('System settings'),
    },
  ];

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registered':
        return <PeopleIcon />;
      case 'task_completed':
        return <CompletedIcon />;
      case 'review_submitted':
        return <AnalyticsIcon />;
      case 'system_alert':
        return <IssuesIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getActivityColor = (status?: string) => {
    switch (status) {
      case 'success':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'error':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" action={
          <Button onClick={refresh} size="small">
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: '390px',
        mx: 'auto',
        bgcolor: '#FFFFFF',
        minHeight: '100vh',
        px: 2,
        pb: 10, // Bottom padding for fixed navigation
        pt: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography
            sx={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#000',
            }}
          >
            👑 Admin Dashboard
          </Typography>
          <Tooltip title="Refresh data">
            <IconButton
              onClick={refresh}
              disabled={loading}
              size="small"
              sx={{ color: '#2196F3' }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography
          sx={{
            fontSize: '14px',
            color: '#666',
          }}
        >
          Welcome back, {user.name} 👋
        </Typography>
      </Box>

      {/* Overview Stats */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '12px',
              border: '1px solid #E0E0E0',
              bgcolor: '#F8F9FA',
            }}
          >
            <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 24, color: '#2196F3', mb: 0.5 }} />
              <Typography
                sx={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#000',
                  lineHeight: 1.2,
                }}
              >
                {(stats?.totalUsers || 0).toLocaleString()}
              </Typography>
              <Typography
                sx={{
                  fontSize: '10px',
                  color: '#666',
                }}
              >
                Total Users
              </Typography>
              <Chip
                label={`${stats?.activeUsers || 0} active`}
                size="small"
                sx={{
                  fontSize: '8px',
                  height: '16px',
                  mt: 0.5,
                  backgroundColor: '#E8F5E8',
                  color: '#2E7D32',
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '12px',
              border: '1px solid #E0E0E0',
              bgcolor: '#F8F9FA',
            }}
          >
            <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
              <TasksIcon sx={{ fontSize: 24, color: '#FF9800', mb: 0.5 }} />
              <Typography
                sx={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#000',
                  lineHeight: 1.2,
                }}
              >
                {stats?.totalTasks || 0}
              </Typography>
              <Typography
                sx={{
                  fontSize: '10px',
                  color: '#666',
                }}
              >
                Total Tasks
              </Typography>
              <Chip
                label={`${stats?.activeTasks || 0} active`}
                size="small"
                sx={{
                  fontSize: '8px',
                  height: '16px',
                  mt: 0.5,
                  backgroundColor: '#FFF3E0',
                  color: '#F57C00',
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '12px',
              border: '1px solid #E0E0E0',
              bgcolor: '#F8F9FA',
            }}
          >
            <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
              <AnalyticsIcon sx={{ fontSize: 24, color: '#4CAF50', mb: 0.5 }} />
              <Typography
                sx={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#000',
                  lineHeight: 1.2,
                }}
              >
                {((stats?.totalRecordings || 0) / 1000).toFixed(1)}k
              </Typography>
              <Typography
                sx={{
                  fontSize: '10px',
                  color: '#666',
                }}
              >
                Recordings
              </Typography>
              <Chip
                label={`${stats?.pendingReviews || 0} pending`}
                size="small"
                sx={{
                  fontSize: '8px',
                  height: '16px',
                  mt: 0.5,
                  backgroundColor: '#E3F2FD',
                  color: '#1976D2',
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '12px',
              border: '1px solid #E0E0E0',
              bgcolor: '#F8F9FA',
            }}
          >
            <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
              <SettingsIcon sx={{ fontSize: 24, color: '#9C27B0', mb: 0.5 }} />
              <Typography
                sx={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#000',
                  lineHeight: 1.2,
                }}
              >
                {stats?.systemIssues || 0}
              </Typography>
              <Typography
                sx={{
                  fontSize: '10px',
                  color: '#666',
                }}
              >
                System Issues
              </Typography>
              <Chip
                label={(stats?.systemIssues || 0) === 0 ? 'All good' : 'Check needed'}
                size="small"
                sx={{
                  fontSize: '8px',
                  height: '16px',
                  mt: 0.5,
                  backgroundColor: (stats?.systemIssues || 0) === 0 ? '#E8F5E8' : '#FFEBEE',
                  color: (stats?.systemIssues || 0) === 0 ? '#2E7D32' : '#D32F2F',
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Task Completion Progress */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid #E0E0E0',
          bgcolor: '#F8F9FA',
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#000',
              }}
            >
              Task Completion Rate
            </Typography>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#4CAF50',
              }}
            >
              {Math.round(((stats?.completedTasks || 0) / (stats?.totalTasks || 1)) * 100)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={((stats?.completedTasks || 0) / (stats?.totalTasks || 1)) * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#E0E0E0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#4CAF50',
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography
              sx={{
                fontSize: '12px',
                color: '#666',
              }}
            >
              {stats?.completedTasks || 0} completed
            </Typography>
            <Typography
              sx={{
                fontSize: '12px',
                color: '#666',
              }}
            >
              {(stats?.totalTasks || 0) - (stats?.completedTasks || 0)} remaining
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#000',
            mb: 1.5,
          }}
        >
          Quick Actions
        </Typography>
        <Grid container spacing={1.5}>
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Grid item xs={6} key={action.id}>
                <Button
                  variant="outlined"
                  onClick={action.onClick}
                  startIcon={<IconComponent />}
                  sx={{
                    width: '100%',
                    borderRadius: '12px',
                    borderColor: '#E0E0E0',
                    color: '#000',
                    fontSize: '12px',
                    fontWeight: 500,
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#2196F3',
                      backgroundColor: '#F5F5F5',
                    },
                  }}
                >
                  {action.label}
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Recent Activity */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography
            sx={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#000',
            }}
          >
            Recent Activity
          </Typography>
          <Tooltip title="Export activity log">
            <IconButton size="small" sx={{ color: '#666' }}>
              <ExportIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Card
          elevation={0}
          sx={{
            borderRadius: '12px',
            border: '1px solid #E0E0E0',
            bgcolor: '#FAFAFA',
          }}
        >
          <List sx={{ py: 0 }}>
            {recentActivity.slice(0, 5).map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem sx={{ py: 1.5, px: 2 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: getActivityColor(activity.status),
                        '& .MuiSvgIcon-root': {
                          fontSize: 16,
                        },
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#000',
                          lineHeight: 1.3,
                        }}
                      >
                        {activity.user}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography
                          sx={{
                            fontSize: '12px',
                            color: '#666',
                            lineHeight: 1.2,
                          }}
                        >
                          {activity.action}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '10px',
                            color: '#999',
                            mt: 0.2,
                          }}
                        >
                          {activity.time}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < 4 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Card>
      </Box>

      {/* System Health Status */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid #E0E0E0',
          bgcolor: (stats?.systemIssues || 0) === 0 ? '#E8F5E8' : '#FFEBEE',
          mb: 4,
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {(stats?.systemIssues || 0) === 0 ? (
              <CompletedIcon sx={{ fontSize: 20, color: '#4CAF50', mr: 1 }} />
            ) : (
              <IssuesIcon sx={{ fontSize: 20, color: '#F44336', mr: 1 }} />
            )}
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                color: (stats?.systemIssues || 0) === 0 ? '#2E7D32' : '#D32F2F',
              }}
            >
              System Status
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: '12px',
              color: (stats?.systemIssues || 0) === 0 ? '#2E7D32' : '#D32F2F',
            }}
          >
            {(stats?.systemIssues || 0) === 0
              ? 'All systems operational'
              : `${stats?.systemIssues || 0} issues detected - check system logs`}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;