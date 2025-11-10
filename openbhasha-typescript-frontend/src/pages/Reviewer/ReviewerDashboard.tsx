import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  List,
  ListItem,
  IconButton,
  Avatar,
  Grid,
  Divider,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
  Schedule as PendingIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  VolumeUp as AudioIcon,
  Timer as TimerIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { User } from '@/types';
import { useDashboard } from '@/hooks/useDashboard';

interface AudioTask {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  submittedBy: {
    id: string;
    name: string;
    role: string;
  };
  submittedAt: string;
  language: string;
  category: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  transcript?: string;
  reviewNotes?: string;
  rating?: number;
}

interface ReviewerDashboardProps {
  user: User;
}

// Mock data for audio tasks
const mockAudioTasks: AudioTask[] = [
  {
    id: '1',
    title: 'Bengali Pronunciation - Basic Vowels',
    audioUrl: '/mock-audio-1.wav',
    duration: 45,
    submittedBy: {
      id: 'user1',
      name: 'John Doe',
      role: 'student',
    },
    submittedAt: '2025-11-06T09:30:00Z',
    language: 'Bengali',
    category: 'Pronunciation',
    status: 'pending',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Hindi Reading - Children Story',
    audioUrl: '/mock-audio-2.wav',
    duration: 120,
    submittedBy: {
      id: 'user2',
      name: 'Jane Smith',
      role: 'participant',
    },
    submittedAt: '2025-11-06T08:15:00Z',
    language: 'Hindi',
    category: 'Reading',
    status: 'in_review',
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Tamil Conversation - Daily Routine',
    audioUrl: '/mock-audio-3.wav',
    duration: 90,
    submittedBy: {
      id: 'user3',
      name: 'Mike Wilson',
      role: 'student',
    },
    submittedAt: '2025-11-06T07:45:00Z',
    language: 'Tamil',
    category: 'Conversation',
    status: 'approved',
    priority: 'low',
    rating: 4,
    reviewNotes: 'Excellent pronunciation and fluency',
  },
  {
    id: '4',
    title: 'Marathi Numbers - 1 to 100',
    audioUrl: '/mock-audio-4.wav',
    duration: 60,
    submittedBy: {
      id: 'user4',
      name: 'Sarah Johnson',
      role: 'student',
    },
    submittedAt: '2025-11-05T16:30:00Z',
    language: 'Marathi',
    category: 'Numbers',
    status: 'rejected',
    priority: 'medium',
    rating: 2,
    reviewNotes: 'Please work on clarity in number pronunciation',
  },
];

export const ReviewerDashboard: React.FC<ReviewerDashboardProps> = () => {
  // Use the dashboard hook to get real data
  const { stats, loading, error, refresh } = useDashboard();
  
  const [tasks, setTasks] = useState<AudioTask[]>(mockAudioTasks);
  const [selectedTab, setSelectedTab] = useState(0);
  const [playingTask, setPlayingTask] = useState<string | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<AudioTask | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Filter tasks by status
  const getFilteredTasks = () => {
    const statusFilters = ['all', 'pending', 'in_review', 'approved', 'rejected'];
    const selectedStatus = statusFilters[selectedTab];
    
    if (selectedStatus === 'all') return tasks;
    return tasks.filter(task => task.status === selectedStatus);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'in_review': return '#2196F3';
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <PendingIcon fontSize="small" />;
      case 'in_review': return <TimerIcon fontSize="small" />;
      case 'approved': return <CheckIcon fontSize="small" />;
      case 'rejected': return <ErrorIcon fontSize="small" />;
      default: return <PendingIcon fontSize="small" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSubmittedTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const handlePlayPause = (taskId: string) => {
    if (playingTask === taskId) {
      setPlayingTask(null);
    } else {
      setPlayingTask(taskId);
      // In real app, would integrate with audio player
      setTimeout(() => setPlayingTask(null), 3000); // Mock auto-stop
    }
  };

  const handleStartReview = (task: AudioTask) => {
    setSelectedTask(task);
    setReviewNotes(task.reviewNotes || '');
    setRating(task.rating || null);
    setReviewDialog(true);
    
    // Update task status to in_review
    setTasks(tasks.map(t => 
      t.id === task.id ? { ...t, status: 'in_review' } : t
    ));
  };

  const handleSubmitReview = (approved: boolean) => {
    if (selectedTask) {
      const newStatus = approved ? 'approved' : 'rejected';
      setTasks(tasks.map(t => 
        t.id === selectedTask.id 
          ? { 
              ...t, 
              status: newStatus,
              rating: rating || undefined,
              reviewNotes: reviewNotes || undefined,
            }
          : t
      ));
    }
    setReviewDialog(false);
    setSelectedTask(null);
    setReviewNotes('');
    setRating(null);
  };

  // Local task statistics calculations
  const localStats = {
    totalTasks: tasks.length,
    pendingTasks: tasks.filter(t => t.status === 'pending').length,
    inReviewTasks: tasks.filter(t => t.status === 'in_review').length,
    completedToday: tasks.filter(t => {
      const today = new Date();
      const taskDate = new Date(t.submittedAt);
      return taskDate.toDateString() === today.toDateString() && 
             (t.status === 'approved' || t.status === 'rejected');
    }).length,
  };

  const tabLabels = [
    `All (${tasks.length})`,
    `Pending (${localStats.pendingTasks})`,
    `In Review (${localStats.inReviewTasks})`,
    `Approved (${tasks.filter(t => t.status === 'approved').length})`,
    `Rejected (${tasks.filter(t => t.status === 'rejected').length})`,
  ];

  const filteredTasks = getFilteredTasks();

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
        pb: 10,
        pt: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#000',
          }}
        >
          🎧 Review Dashboard
        </Typography>
        <IconButton size="small">
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '24px', fontWeight: 700 }}>
                {stats?.pendingReviews || 0}
              </Typography>
              <Typography sx={{ fontSize: '12px', opacity: 0.9 }}>
                Pending Reviews
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '24px', fontWeight: 700 }}>
                {stats?.completedReviews || 0}
              </Typography>
              <Typography sx={{ fontSize: '12px', opacity: 0.9 }}>
                Completed Reviews
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progress Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid #E0E0E0',
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#000' }}>
              Daily Progress
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#666' }}>
              {stats?.completedReviews || 0}/10 target
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={((stats?.completedReviews || 0) / 10) * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: '#F0F0F0',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#4CAF50',
                borderRadius: 4,
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          '& .MuiTab-root': {
            fontSize: '12px',
            fontWeight: 500,
            minHeight: '36px',
            textTransform: 'none',
          },
        }}
      >
        {tabLabels.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      {/* Tasks List */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid #E0E0E0',
        }}
      >
        <List sx={{ p: 0 }}>
          {filteredTasks.map((task, index) => (
            <React.Fragment key={task.id}>
              <ListItem sx={{ px: 2, py: 1.5 }}>
                <Box sx={{ width: '100%' }}>
                  {/* Task Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography
                      sx={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#000',
                        flex: 1,
                        mr: 1,
                      }}
                    >
                      {task.title}
                    </Typography>
                    <Chip
                      icon={getStatusIcon(task.status)}
                      label={task.status.replace('_', ' ')}
                      size="small"
                      sx={{
                        fontSize: '10px',
                        height: '20px',
                        textTransform: 'capitalize',
                        bgcolor: getStatusColor(task.status),
                        color: 'white',
                        '& .MuiChip-icon': {
                          color: 'white',
                        },
                      }}
                    />
                  </Box>

                  {/* Task Details */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: '#2196F3',
                          fontSize: '10px',
                        }}
                      >
                        {task.submittedBy.name[0]}
                      </Avatar>
                      <Typography sx={{ fontSize: '11px', color: '#666' }}>
                        {task.submittedBy.name}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '11px', color: '#666' }}>
                      {formatSubmittedTime(task.submittedAt)}
                    </Typography>
                  </Box>

                  {/* Language and Category */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={task.language}
                      size="small"
                      sx={{
                        fontSize: '10px',
                        height: '18px',
                        bgcolor: '#E3F2FD',
                        color: '#2196F3',
                      }}
                    />
                    <Chip
                      label={task.category}
                      size="small"
                      sx={{
                        fontSize: '10px',
                        height: '18px',
                        bgcolor: '#F3E5F5',
                        color: '#9C27B0',
                      }}
                    />
                    <Chip
                      label={`${task.priority} priority`}
                      size="small"
                      sx={{
                        fontSize: '10px',
                        height: '18px',
                        bgcolor: `${getPriorityColor(task.priority)}20`,
                        color: getPriorityColor(task.priority),
                      }}
                    />
                  </Box>

                  {/* Audio Controls and Actions */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handlePlayPause(task.id)}
                        sx={{
                          bgcolor: playingTask === task.id ? '#FF9800' : '#2196F3',
                          color: 'white',
                          width: 28,
                          height: 28,
                          '&:hover': {
                            bgcolor: playingTask === task.id ? '#F57C00' : '#1976D2',
                          },
                        }}
                      >
                        {playingTask === task.id ? (
                          <PauseIcon fontSize="small" />
                        ) : (
                          <PlayIcon fontSize="small" />
                        )}
                      </IconButton>
                      <AudioIcon fontSize="small" sx={{ color: '#666' }} />
                      <Typography sx={{ fontSize: '11px', color: '#666' }}>
                        {formatDuration(task.duration)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {task.status === 'pending' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleStartReview(task)}
                          sx={{
                            fontSize: '10px',
                            py: 0.5,
                            px: 1,
                            borderRadius: '6px',
                            textTransform: 'none',
                            minWidth: 'auto',
                          }}
                        >
                          Start Review
                        </Button>
                      )}
                      {task.status === 'approved' && task.rating && (
                        <Rating
                          value={task.rating}
                          size="small"
                          readOnly
                          sx={{
                            '& .MuiRating-icon': {
                              fontSize: '12px',
                            },
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Review Notes for completed tasks */}
                  {task.reviewNotes && (
                    <Box
                      sx={{
                        mt: 1,
                        p: 1,
                        bgcolor: '#F8F9FA',
                        borderRadius: '6px',
                        border: '1px solid #E0E0E0',
                      }}
                    >
                      <Typography sx={{ fontSize: '11px', color: '#666' }}>
                        Review Notes: {task.reviewNotes}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </ListItem>
              {index < filteredTasks.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Card>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog}
        onClose={() => setReviewDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '12px', maxWidth: '350px' }
        }}
      >
        <DialogTitle sx={{ fontSize: '16px', fontWeight: 600 }}>
          Review Audio Submission
        </DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 1 }}>
                {selectedTask.title}
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#666', mb: 2 }}>
                By {selectedTask.submittedBy.name} • {selectedTask.language} • {formatDuration(selectedTask.duration)}
              </Typography>

              {/* Audio Player Placeholder */}
              <Paper
                sx={{
                  p: 2,
                  mb: 2,
                  bgcolor: '#F8F9FA',
                  textAlign: 'center',
                  borderRadius: '8px',
                }}
              >
                <AudioIcon sx={{ fontSize: '40px', color: '#666', mb: 1 }} />
                <Typography sx={{ fontSize: '12px', color: '#666' }}>
                  Audio player would be here
                </Typography>
                <Button
                  size="small"
                  startIcon={<PlayIcon />}
                  sx={{ mt: 1, fontSize: '12px' }}
                >
                  Play Audio
                </Button>
              </Paper>

              {/* Rating */}
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '12px', fontWeight: 500, mb: 1 }}>
                  Rating
                </Typography>
                <Rating
                  value={rating}
                  onChange={(_, newValue) => setRating(newValue)}
                  size="large"
                />
              </Box>

              {/* Review Notes */}
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Review Notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add feedback for the participant..."
                size="small"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setReviewDialog(false)}
            sx={{ fontSize: '12px' }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleSubmitReview(false)}
            variant="outlined"
            color="error"
            startIcon={<RejectIcon />}
            sx={{ fontSize: '12px' }}
          >
            Reject
          </Button>
          <Button
            onClick={() => handleSubmitReview(true)}
            variant="contained"
            color="success"
            startIcon={<ApproveIcon />}
            sx={{ fontSize: '12px' }}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewerDashboard;