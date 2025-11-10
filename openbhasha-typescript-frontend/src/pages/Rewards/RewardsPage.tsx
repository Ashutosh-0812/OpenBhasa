import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Alert,
  Paper,
} from '@mui/material';
import {
  Stars as StarsIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as TaskIcon,
  Mic as RecordIcon,
  People as ShareIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import '@fontsource/poppins/700.css';
import { User } from '@/types';

interface RewardsPageProps {
  user: User;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  coins: number;
  earned: boolean;
  earnedDate?: string;
  progress?: string;
}

interface RecentEarning {
  activity: string;
  coins: number;
  time: string;
}

interface UserRewards {
  totalCoins: number;
  dailyCoins: number;
  weeklyCoins: number;
  monthlyCoins: number;
  level: number;
  streak: number;
  nextLevelCoins: number;
}

// Mock data - replace with API calls
const mockUserRewards: UserRewards = {
  totalCoins: 1250,
  dailyCoins: 45,
  weeklyCoins: 320,
  monthlyCoins: 1250,
  level: 3,
  streak: 7,
  nextLevelCoins: 1500,
};

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first recording task',
    icon: '🎯',
    coins: 50,
    earned: true,
    earnedDate: 'Nov 1',
  },
  {
    id: '2',
    title: 'Week Warrior',
    description: 'Record for 7 consecutive days',
    icon: '⚡',
    coins: 200,
    earned: true,
    earnedDate: 'Nov 5',
  },
  {
    id: '3',
    title: 'Speed Demon',
    description: 'Complete 10 tasks in one day',
    icon: '🚀',
    coins: 150,
    earned: false,
    progress: '6/10',
  },
  {
    id: '4',
    title: 'Quality Master',
    description: 'Maintain 95% accuracy rate',
    icon: '👑',
    coins: 300,
    earned: false,
    progress: '92%',
  },
  {
    id: '5',
    title: 'Team Player',
    description: 'Help 5 new participants get started',
    icon: '🤝',
    coins: 250,
    earned: false,
    progress: '2/5',
  },
  {
    id: '6',
    title: 'Marathon Runner',
    description: 'Complete 100 total tasks',
    icon: '🏃‍♂️',
    coins: 500,
    earned: false,
    progress: '78/100',
  },
];

const mockRecentEarnings: RecentEarning[] = [
  { activity: 'Completed Hindi reading task', coins: 25, time: 'Just now' },
  { activity: 'Daily streak bonus', coins: 10, time: '2 hours ago' },
  { activity: 'Quality bonus (98% accuracy)', coins: 15, time: '4 hours ago' },
  { activity: 'Achievement: Week Warrior', coins: 200, time: 'Today' },
  { activity: 'Completed Telugu conversation task', coins: 30, time: 'Yesterday' },
  { activity: 'Referral bonus', coins: 50, time: 'Yesterday' },
];

export const RewardsPage: React.FC<RewardsPageProps> = ({ user }) => {
  const [userRewards, setUserRewards] = useState<UserRewards>(mockUserRewards);
  const [achievements, setAchievements] = useState<Achievement[]>(mockAchievements);
  const [recentEarnings, setRecentEarnings] = useState<RecentEarning[]>(mockRecentEarnings);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch user rewards data
    fetchRewardsData();
  }, []);

  const fetchRewardsData = async () => {
    setLoading(true);
    try {
      // API call would go here
      // const data = await rewardsAPI.getUserRewards(user.id);
      // setUserRewards(data.rewards);
      // setAchievements(data.achievements);
      // setRecentEarnings(data.recentEarnings);
    } catch (error) {
      console.error('Failed to fetch rewards data:', error);
    } finally {
      setLoading(false);
    }
  };

  const earnedAchievements = achievements.filter(a => a.earned);
  const progressPercentage = (userRewards.totalCoins / userRewards.nextLevelCoins) * 100;

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
      {/* Page Title */}
      <Typography
        sx={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#000',
          mb: 3,
          textAlign: 'center',
        }}
      >
        🎁 Rewards & Achievements
      </Typography>

      {/* Rewards Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Total Coins Card */}
        <Grid item xs={12}>
          <Card
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              borderRadius: '16px',
              border: '1px solid #FFD700',
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StarsIcon sx={{ fontSize: 28, color: '#8B4513', mr: 1.5 }} />
                <Box>
                  <Typography
                    sx={{
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#8B4513',
                      lineHeight: 1.2,
                    }}
                  >
                    {userRewards.totalCoins.toLocaleString()}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '12px',
                      color: '#8B4513',
                      opacity: 0.8,
                    }}
                  >
                    Total Coins
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 1.5, borderColor: 'rgba(139, 69, 19, 0.2)' }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#8B4513',
                    }}
                  >
                    {userRewards.dailyCoins}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '10px',
                      color: '#8B4513',
                      opacity: 0.8,
                    }}
                  >
                    Today
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#8B4513',
                    }}
                  >
                    {userRewards.weeklyCoins}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '10px',
                      color: '#8B4513',
                      opacity: 0.8,
                    }}
                  >
                    This Week
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#8B4513',
                    }}
                  >
                    {userRewards.monthlyCoins}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '10px',
                      color: '#8B4513',
                      opacity: 0.8,
                    }}
                  >
                    This Month
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Level & Streak Card */}
        <Grid item xs={12}>
          <Card
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #4FC3F7 0%, #2196F3 100%)',
              borderRadius: '16px',
              border: '1px solid #4FC3F7',
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ fontSize: 28, color: '#0D47A1', mr: 1.5 }} />
                <Box>
                  <Typography
                    sx={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#0D47A1',
                      lineHeight: 1.2,
                    }}
                  >
                    Level {userRewards.level}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '12px',
                      color: '#0D47A1',
                      opacity: 0.8,
                    }}
                  >
                    {userRewards.streak} Day Streak 🔥
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 1.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '10px',
                      color: '#0D47A1',
                      opacity: 0.8,
                    }}
                  >
                    Progress to Level {userRewards.level + 1}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '10px',
                      color: '#0D47A1',
                      opacity: 0.8,
                    }}
                  >
                    {userRewards.totalCoins}/{userRewards.nextLevelCoins}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progressPercentage}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'rgba(13, 71, 161, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#0D47A1',
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Earnings */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#000',
            mb: 1.5,
          }}
        >
          Recent Earnings
        </Typography>
        <Card
          elevation={0}
          sx={{
            borderRadius: '12px',
            border: '1px solid #E0E0E0',
            bgcolor: '#FAFAFA',
          }}
        >
          <List sx={{ py: 0 }}>
            {recentEarnings.slice(0, 4).map((earning, index) => (
              <React.Fragment key={index}>
                <ListItem sx={{ py: 1, px: 2 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <StarsIcon sx={{ color: '#FFB300', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#000',
                        }}
                      >
                        {earning.activity}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        sx={{
                          fontSize: '12px',
                          color: '#666',
                        }}
                      >
                        {earning.time}
                      </Typography>
                    }
                  />
                  <Chip
                    label={`+${earning.coins}`}
                    size="small"
                    sx={{
                      backgroundColor: '#E8F5E8',
                      color: '#2E7D32',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  />
                </ListItem>
                {index < 3 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Card>
      </Box>

      {/* Achievements */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#000',
            mb: 1.5,
          }}
        >
          Achievements ({earnedAchievements.length}/{achievements.length})
        </Typography>
        
        <Grid container spacing={2}>
          {achievements.map((achievement) => (
            <Grid item xs={6} key={achievement.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: achievement.earned ? '#4CAF50' : '#E0E0E0',
                  bgcolor: achievement.earned ? '#F1F8E9' : '#FAFAFA',
                  opacity: achievement.earned ? 1 : 0.7,
                }}
              >
                <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '32px', mb: 0.5 }}>
                    {achievement.icon}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#000',
                      mb: 0.5,
                      lineHeight: 1.2,
                    }}
                  >
                    {achievement.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '10px',
                      color: '#666',
                      mb: 1,
                      lineHeight: 1.2,
                    }}
                  >
                    {achievement.description}
                  </Typography>
                  
                  <Chip
                    label={`${achievement.coins} coins`}
                    size="small"
                    sx={{
                      fontSize: '9px',
                      height: '20px',
                      backgroundColor: achievement.earned ? '#4CAF50' : '#E0E0E0',
                      color: achievement.earned ? '#FFF' : '#666',
                      mb: 0.5,
                    }}
                  />

                  {achievement.earned ? (
                    <Box>
                      <CheckCircleIcon
                        sx={{ color: '#4CAF50', fontSize: 16, mb: 0.5 }}
                      />
                      <Typography
                        sx={{
                          fontSize: '9px',
                          color: '#4CAF50',
                          fontWeight: 500,
                        }}
                      >
                        Earned {achievement.earnedDate}
                      </Typography>
                    </Box>
                  ) : achievement.progress ? (
                    <Typography
                      sx={{
                        fontSize: '9px',
                        color: '#666',
                        fontWeight: 500,
                      }}
                    >
                      Progress: {achievement.progress}
                    </Typography>
                  ) : null}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Earning Opportunities */}
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#000',
            mb: 1.5,
          }}
        >
          Earn More Coins
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #81C784 0%, #4CAF50 100%)',
                borderRadius: '12px',
                border: '1px solid #81C784',
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TaskIcon sx={{ fontSize: 24, color: '#1B5E20', mr: 1.5 }} />
                  <Box>
                    <Typography
                      sx={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#1B5E20',
                        lineHeight: 1.2,
                      }}
                    >
                      Daily Tasks
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '11px',
                        color: '#1B5E20',
                        opacity: 0.8,
                      }}
                    >
                      Complete recording tasks to earn coins
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  sx={{
                    fontSize: '12px',
                    color: '#1B5E20',
                    fontWeight: 500,
                  }}
                >
                  💰 Earn 15-35 coins per task
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6}>
            <Card
              elevation={0}
              sx={{
                borderRadius: '12px',
                border: '1px solid #E0E0E0',
                bgcolor: '#FAFAFA',
              }}
            >
              <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                <RecordIcon sx={{ fontSize: 20, color: '#FF6B35', mb: 0.5 }} />
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#000',
                    mb: 0.5,
                  }}
                >
                  Quality Bonus
                </Typography>
                <Typography
                  sx={{
                    fontSize: '10px',
                    color: '#666',
                    mb: 0.5,
                  }}
                >
                  95%+ accuracy
                </Typography>
                <Typography
                  sx={{
                    fontSize: '11px',
                    color: '#FF6B35',
                    fontWeight: 600,
                  }}
                >
                  +10 coins
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6}>
            <Card
              elevation={0}
              sx={{
                borderRadius: '12px',
                border: '1px solid #E0E0E0',
                bgcolor: '#FAFAFA',
              }}
            >
              <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                <ShareIcon sx={{ fontSize: 20, color: '#2196F3', mb: 0.5 }} />
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#000',
                    mb: 0.5,
                  }}
                >
                  Referral
                </Typography>
                <Typography
                  sx={{
                    fontSize: '10px',
                    color: '#666',
                    mb: 0.5,
                  }}
                >
                  Invite friends
                </Typography>
                <Typography
                  sx={{
                    fontSize: '11px',
                    color: '#2196F3',
                    fontWeight: 600,
                  }}
                >
                  +50 coins
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default RewardsPage;