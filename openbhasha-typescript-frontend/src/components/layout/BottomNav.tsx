import React from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
} from '@mui/material';
import {
  Home as HomeIcon,
  Star as RewardsIcon,
  People as ParticipantsIcon,
  FormatListBulleted as TasksIcon,
} from '@mui/icons-material';
import { NavigationTab, UserRole } from '@/types';

interface BottomNavProps {
  activeTab: NavigationTab;
  userRole: UserRole;
  onTabChange: (tab: NavigationTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  userRole,
  onTabChange,
}) => {
  // Define navigation items to match the design exactly
  const navigationItems = [
    {
      key: 'dashboard' as NavigationTab,
      icon: HomeIcon,
      roles: ['admin', 'student', 'reviewer', 'participant'] as UserRole[],
    },
    {
      key: 'rewards' as NavigationTab,
      icon: RewardsIcon,
      roles: ['admin', 'student', 'reviewer', 'participant'] as UserRole[],
    },
    {
      key: 'participants' as NavigationTab,
      icon: ParticipantsIcon,
      roles: ['admin', 'student', 'reviewer'] as UserRole[], // Hide from participants
    },
    {
      key: 'projects' as NavigationTab,
      icon: TasksIcon,
      roles: ['admin', 'student', 'reviewer', 'participant'] as UserRole[],
    },
  ];

  // Filter navigation items based on user role
  const visibleItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  const handleChange = (_: React.SyntheticEvent, newValue: NavigationTab) => {
    onTabChange(newValue);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      {/* Bottom Navigation */}
      <Paper
        sx={{
          backgroundColor: '#136E1B', // Green background to match image
          borderTop: 'none',
          boxShadow: 'none',
        }}
        elevation={0}
      >
        <BottomNavigation
          value={activeTab}
          onChange={handleChange}
          sx={{
            height: 64,
            backgroundColor: '#136E1B', // Green background
            '& .MuiBottomNavigationAction-root': {
              minWidth: 44,
              maxWidth: 'none',
              padding: '8px 0 10px',
              color: '#ffffff', // White icons
            },
            '& .MuiBottomNavigationAction-root .MuiSvgIcon-root': {
              fontSize: '28px', // Larger icons to match the design
            },
            '& .Mui-selected': {
              color: '#ffffff !important', // Keep white when selected
            },
          }}
        >
          {visibleItems.map(({ key, icon: Icon }) => (
            <BottomNavigationAction
              key={key}
              value={key}
              icon={<Icon />}
              sx={{
                color: '#ffffff !important', // White icons
                '&.Mui-selected': {
                  color: '#ffffff !important',
                },
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
};