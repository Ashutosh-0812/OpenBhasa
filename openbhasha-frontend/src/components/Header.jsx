import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  IconButton,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import {
  AccountCircle,
  Help,
  Logout,
  Dashboard,
  Assignment,
  Headset,
  EmojiEvents,
  SupervisorAccount,
  RateReview,
  Group,
  Analytics,
  Settings,
  Mic,
  ViewList,
} from "@mui/icons-material";

const Header = ({ userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [anchorEl, setAnchorEl] = useState(null);

  // Role-based navigation configurations
  const roleConfigs = {
    admin: {
      tabs: [
        { label: "Dashboard", icon: <Dashboard />, path: "/admin/dashboard" },
        { label: "Users", icon: <SupervisorAccount />, path: "/admin/users" },
        { label: "Tasks", icon: <Assignment />, path: "/admin/tasks" },
        { label: "Analytics", icon: <Analytics />, path: "/admin/analytics" },
        { label: "Settings", icon: <Settings />, path: "/admin/settings" },
      ],
    },
    student: {
      tabs: [
        { label: "Dashboard", icon: <Dashboard />, path: "/student/dashboard" },
        { label: "My Tasks", icon: <Assignment />, path: "/student/tasks" },
        { label: "Recordings", icon: <Mic />, path: "/student/recordings" },
        {
          label: "Participants",
          icon: <Group />,
          path: "/student/participants",
        },
        { label: "Referrals", icon: <ViewList />, path: "/student/referrals" },
      ],
    },
    participant: {
      tabs: [
        {
          label: "Dashboard",
          icon: <Dashboard />,
          path: "/participant/dashboard",
        },
        { label: "My Tasks", icon: <Assignment />, path: "/participant/tasks" },
        {
          label: "My Recordings",
          icon: <Headset />,
          path: "/participant/recordings",
        },
        {
          label: "Rewards",
          icon: <EmojiEvents />,
          path: "/participant/rewards",
        },
      ],
    },
    reviewer: {
      tabs: [
        {
          label: "Dashboard",
          icon: <Dashboard />,
          path: "/reviewer/dashboard",
        },
        {
          label: "Review Queue",
          icon: <RateReview />,
          path: "/reviewer/queue",
        },
        {
          label: "Completed",
          icon: <Assignment />,
          path: "/reviewer/completed",
        },
        {
          label: "Analytics",
          icon: <Analytics />,
          path: "/reviewer/analytics",
        },
      ],
    },
  };

  const currentConfig = roleConfigs[userRole] || roleConfigs.participant;

  // Get current tab value based on location
  const getCurrentTabValue = () => {
    const currentPath = location.pathname;
    const tabIndex = currentConfig.tabs.findIndex(
      (tab) => tab.path === currentPath
    );
    return tabIndex >= 0 ? tabIndex : 0;
  };

  const [tabValue, setTabValue] = useState(getCurrentTabValue());

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const selectedTab = currentConfig.tabs[newValue];
    if (selectedTab) {
      navigate(selectedTab.path);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate(`/${userRole}/profile`);
  };

  const handleHelp = () => {
    handleMenuClose();
    navigate("/help");
  };

  const handleLogout = () => {
    handleMenuClose();
    // Clear auth state and navigate to login
    localStorage.removeItem("token");
    // dispatch(logout()); // Uncomment when auth slice has logout action
    navigate("/login");
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: "Admin",
      student: "Student",
      participant: "Participant",
      reviewer: "Reviewer",
    };
    return roleNames[role] || "User";
  };

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        {/* Logo */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 0,
            mr: 4,
            fontWeight: "bold",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/${userRole}/dashboard`)}
        >
          OpenBhasha
        </Typography>

        {/* Role indicator */}
        <Box sx={{ mr: 2 }}>
          <Typography
            variant="caption"
            sx={{
              bgcolor: "primary.light",
              color: "primary.main",
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: "0.7rem",
              fontWeight: 500,
            }}
          >
            {getRoleDisplayName(userRole)}
          </Typography>
        </Box>

        {/* Navigation Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            flexGrow: 1,
            "& .MuiTab-root": {
              color: "primary.main",
              minHeight: 64,
              "&.Mui-selected": {
                color: "primary.main",
                fontWeight: 600,
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "primary.main",
              height: 3,
            },
          }}
        >
          {currentConfig.tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              sx={{ minWidth: "auto" }}
            />
          ))}
        </Tabs>

        {/* User info and menu */}
        <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
          <Typography
            variant="body2"
            sx={{ mr: 1, display: { xs: "none", sm: "block" } }}
          >
            {user?.name || "User"}
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
        </Box>

        {/* Profile Menu */}
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleProfile}>
            <AccountCircle sx={{ mr: 2 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleHelp}>
            <Help sx={{ mr: 2 }} />
            Help & Support
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 2 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
