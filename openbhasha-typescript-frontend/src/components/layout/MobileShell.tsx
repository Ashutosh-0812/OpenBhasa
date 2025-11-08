import React from 'react';
import { Box } from '@mui/material';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { NavigationTab, User, UserRole } from '@/types';

interface MobileShellProps {
  children: React.ReactNode;
  title: string;
  activeTab: NavigationTab;
  user?: User | null;
  userRole: UserRole;
  onTabChange: (tab: NavigationTab) => void;
}

export const MobileShell: React.FC<MobileShellProps> = ({
  children,
  title,
  activeTab,
  user,
  userRole,
  onTabChange,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      {/* Top Header with curved border box */}
      <TopBar
        title={title}
        user={user}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          overflow: 'auto',
          pb: 8, // Space for bottom navigation
          px: 2,
          py: 2,
          // Safe area handling for mobile devices
          paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          paddingLeft: 'calc(16px + env(safe-area-inset-left, 0px))',
          paddingRight: 'calc(16px + env(safe-area-inset-right, 0px))',
        }}
      >
        {children}
      </Box>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        userRole={userRole}
        onTabChange={onTabChange}
      />
    </Box>
  );
};