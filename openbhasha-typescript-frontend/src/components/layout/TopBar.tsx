import React from 'react';
import { 
  Typography, 
  Avatar,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { LogoutOutlined as LogoutIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';
import { useAuth } from '@/hooks/useAuth';

interface TopBarProps {
  title: string;
  user?: User | null;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  user,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Box sx={{ 
      backgroundColor: '#FFFFFF', // White page background to match dashboard
      px: 2,
      pt: 2,
    }}>
      {/* Curved border box container */}
      <Box
        sx={{
          backgroundColor: '#F3EDF7', // Updated header background color
          borderRadius: '20px', // Curved border
          px: 3, // Internal padding
          py: 1.5, // Vertical padding
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: 56, // Maintain height
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', // Subtle shadow
        }}
      >
        {/* Left section - Bolo title */}
        <Typography
          variant="h5"
          sx={{
            fontSize: '24px', // h5: 24px specification
            fontWeight: 800, // weight 800 specification 
            color: 'primary.main', // color primary.main (#136E1B)
            lineHeight: 1,
          }}
        >
          {title}
        </Typography>

        {/* Right section - Profile Avatar and Logout */}
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Logout">
              <IconButton
                onClick={handleLogout}
                size="small"
                sx={{
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(19, 110, 27, 0.08)',
                  },
                }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Avatar
              sx={{
                width: 32, // Exact specification from theme
                height: 32,
                fontSize: '0.875rem',
                fontWeight: 700, // Exact weight
                backgroundColor: 'primary.main', // Green background
                color: '#fff', // White text
              }}
              src={user.avatar}
              alt={user.name}
            >
              {user.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U'}
            </Avatar>
          </Box>
        )}
      </Box>
    </Box>
  );
};