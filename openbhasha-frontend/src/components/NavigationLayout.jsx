import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
  Button,
  useTheme,
  useMediaQuery,
  Chip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft,
  ExpandLess,
  ExpandMore,
  Dashboard,
  Assignment,
  People,
  Analytics,
  Settings,
  Help,
  Notifications,
  AccountCircle,
  Logout,
  Brightness4,
  Brightness7,
  Language,
  Headset,
  RateReview,
  MonetizationOn,
  School,
  Star,
  AdminPanelSettings,
  Home,
  Person,
  Payment,
  BookmarkBorder,
  History,
} from "@mui/icons-material";
import { clearCredentials } from "../app/slices/authSlice";

const DRAWER_WIDTH = 280;

const NavigationLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState({});

  // Define navigation items based on user role
  const getNavigationItems = () => {
    if (!user) return [];

    const commonItems = [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <Dashboard />,
        path: `/${user.role}/dashboard`,
        roles: ["student", "participant", "reviewer", "admin"],
      },
    ];

    const roleSpecificItems = {
      student: [
        {
          id: "tasks",
          label: "My Tasks",
          icon: <Assignment />,
          path: "/student/tasks",
        },
        {
          id: "languages",
          label: "Languages",
          icon: <Language />,
          path: "/student/languages",
        },
        {
          id: "progress",
          label: "Progress",
          icon: <Analytics />,
          path: "/student/progress",
        },
        {
          id: "saved",
          label: "Saved Items",
          icon: <BookmarkBorder />,
          path: "/student/saved",
        },
      ],
      participant: [
        {
          id: "tasks",
          label: "Available Tasks",
          icon: <Assignment />,
          path: "/participant/tasks",
        },
        {
          id: "earnings",
          label: "Earnings",
          icon: <MonetizationOn />,
          path: "/participant/earnings",
        },
        {
          id: "payments",
          label: "Payment Settings",
          icon: <Payment />,
          path: "/participant/payments",
        },
        {
          id: "history",
          label: "Recording History",
          icon: <History />,
          path: "/participant/history",
        },
      ],
      reviewer: [
        {
          id: "queue",
          label: "Review Queue",
          icon: <RateReview />,
          path: "/reviewer/queue",
        },
        {
          id: "analytics",
          label: "Analytics",
          icon: <Analytics />,
          path: "/reviewer/analytics",
        },
        {
          id: "history",
          label: "Review History",
          icon: <History />,
          path: "/reviewer/history",
        },
      ],
      admin: [
        {
          id: "users",
          label: "User Management",
          icon: <People />,
          children: [
            { label: "All Users", path: "/admin/users" },
            { label: "Students", path: "/admin/users/students" },
            { label: "Participants", path: "/admin/users/participants" },
            { label: "Reviewers", path: "/admin/users/reviewers" },
          ],
        },
        {
          id: "tasks",
          label: "Task Management",
          icon: <Assignment />,
          children: [
            { label: "All Tasks", path: "/admin/tasks" },
            { label: "Create Task", path: "/admin/tasks/create" },
            { label: "Templates", path: "/admin/tasks/templates" },
          ],
        },
        {
          id: "analytics",
          label: "Analytics",
          icon: <Analytics />,
          path: "/admin/analytics",
        },
        {
          id: "system",
          label: "System",
          icon: <Settings />,
          children: [
            { label: "Settings", path: "/admin/settings" },
            { label: "Monitoring", path: "/admin/monitoring" },
            { label: "Logs", path: "/admin/logs" },
          ],
        },
      ],
    };

    const settingsItems = [
      {
        id: "profile",
        label: "Profile",
        icon: <Person />,
        path: `/${user.role}/profile`,
      },
      {
        id: "settings",
        label: "Settings",
        icon: <Settings />,
        path: `/${user.role}/settings`,
      },
      {
        id: "help",
        label: "Help & Support",
        icon: <Help />,
        path: "/help",
      },
    ];

    return [
      ...commonItems,
      ...(roleSpecificItems[user.role] || []),
      { divider: true },
      ...settingsItems,
    ];
  };

  const navigationItems = getNavigationItems();

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: "task",
      title: "New Task Available",
      message: "Bengali Reading Assignment is now available",
      timestamp: "5 minutes ago",
      unread: true,
    },
    {
      id: 2,
      type: "payment",
      title: "Payment Processed",
      message: "₹250 has been credited to your account",
      timestamp: "2 hours ago",
      unread: true,
    },
    {
      id: 3,
      type: "system",
      title: "System Maintenance",
      message: "Scheduled maintenance on Sunday 2 AM",
      timestamp: "1 day ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate("/login");
    handleProfileMenuClose();
  };

  const handleMenuItemClick = (item) => {
    if (item.path) {
      navigate(item.path);
      if (isMobile) {
        setDrawerOpen(false);
      }
    } else if (item.children) {
      setExpandedMenus((prev) => ({
        ...prev,
        [item.id]: !prev[item.id],
      }));
    }
  };

  const isActivePath = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "error";
      case "reviewer":
        return "warning";
      case "participant":
        return "success";
      case "student":
        return "info";
      default:
        return "default";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <AdminPanelSettings />;
      case "reviewer":
        return <RateReview />;
      case "participant":
        return <MonetizationOn />;
      case "student":
        return <School />;
      default:
        return <Person />;
    }
  };

  if (!isAuthenticated) {
    return <Outlet />;
  }

  const drawer = (
    <Box>
      {/* Logo/Brand Section */}
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h5" color="primary.main" fontWeight="bold">
          OpenBhasha
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Audio Collection Platform
        </Typography>
      </Box>

      {/* User Info Section */}
      <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: `${getRoleColor(user?.role)}.main` }}>
            {getRoleIcon(user?.role)}
          </Avatar>
          <Box flex={1}>
            <Typography variant="subtitle2" fontWeight="medium">
              {user?.name || "User"}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={
                  user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)
                }
                color={getRoleColor(user?.role)}
                size="small"
              />
              {user?.rating && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Star sx={{ fontSize: 16, color: "warning.main" }} />
                  <Typography variant="caption">{user.rating}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ pt: 1 }}>
        {navigationItems.map((item, index) => {
          if (item.divider) {
            return <Divider key={index} sx={{ my: 1 }} />;
          }

          if (item.children) {
            return (
              <React.Fragment key={item.id}>
                <ListItemButton
                  onClick={() => handleMenuItemClick(item)}
                  sx={{ px: 3, py: 1 }}
                >
                  <ListItemIcon sx={{ color: "text.secondary" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                  {expandedMenus[item.id] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse
                  in={expandedMenus[item.id]}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {item.children.map((child, childIndex) => (
                      <ListItemButton
                        key={childIndex}
                        onClick={() => navigate(child.path)}
                        selected={isActivePath(child.path)}
                        sx={{ pl: 6, py: 0.5 }}
                      >
                        <ListItemText
                          primary={child.label}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          }

          return (
            <ListItemButton
              key={item.id}
              onClick={() => handleMenuItemClick(item)}
              selected={isActivePath(item.path)}
              sx={{ px: 3, py: 1 }}
            >
              <ListItemIcon
                sx={{
                  color: isActivePath(item.path)
                    ? "primary.main"
                    : "text.secondary",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : 0}px)` },
          ml: { md: `${drawerOpen ? DRAWER_WIDTH : 0}px` },
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            {drawerOpen ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {user?.role === "student" && "Learning Dashboard"}
            {user?.role === "participant" && "Contributor Portal"}
            {user?.role === "reviewer" && "Review Console"}
            {user?.role === "admin" && "Admin Panel"}
          </Typography>

          {/* Header Actions */}
          <Box display="flex" alignItems="center" gap={1}>
            {/* Quick Record Button for Students/Participants */}
            {(user?.role === "student" || user?.role === "participant") && (
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<Headset />}
                size="small"
                onClick={() => navigate(`/${user.role}/tasks`)}
                sx={{ display: { xs: "none", sm: "flex" } }}
              >
                Record
              </Button>
            )}

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton color="inherit" onClick={handleNotificationsOpen}>
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Profile Menu */}
            <Tooltip title="Profile">
              <IconButton
                edge="end"
                color="inherit"
                onClick={handleProfileMenuOpen}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: `${getRoleColor(user?.role)}.main`,
                  }}
                >
                  {user?.name?.charAt(0) || "U"}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={() => {
            navigate(`/${user.role}/profile`);
            handleProfileMenuClose();
          }}
        >
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate(`/${user.role}/settings`);
            handleProfileMenuClose();
          }}
        >
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 },
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        {notifications.map((notification) => (
          <MenuItem
            key={notification.id}
            sx={{ py: 2, px: 2, alignItems: "flex-start" }}
          >
            <Box>
              <Typography
                variant="body2"
                fontWeight={notification.unread ? "medium" : "normal"}
              >
                {notification.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {notification.timestamp}
              </Typography>
              {notification.unread && (
                <Box
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    width: 8,
                    height: 8,
                    bgcolor: "error.main",
                    borderRadius: "50%",
                  }}
                />
              )}
            </Box>
          </MenuItem>
        ))}
        <Divider />
        <MenuItem sx={{ justifyContent: "center" }}>
          <Button size="small">View All Notifications</Button>
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : 0}px)` },
          transition: theme.transitions.create(["width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default NavigationLayout;
