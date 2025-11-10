import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Avatar,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  Person as PersonIcon,
  School as StudentIcon,
  RateReview as ReviewerIcon,
  Work as ParticipantIcon,
  AdminPanelSettings as AdminIcon,
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import { User, UserRole } from '@/types';

interface AdminUser extends User {
  lastLogin?: string;
  tasksCompleted?: number;
  status: 'active' | 'inactive' | 'suspended';
}

interface AdminUserManagementProps {
  user: User;
}

// Mock data - replace with API calls
const mockUsers: AdminUser[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'student',
    isActive: true,
    status: 'active',
    lastLogin: '2025-11-06T08:30:00Z',
    tasksCompleted: 45,
    createdAt: '2025-10-15T00:00:00Z',
    updatedAt: '2025-11-06T08:30:00Z',
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    role: 'participant',
    isActive: true,
    status: 'active',
    lastLogin: '2025-11-06T09:15:00Z',
    tasksCompleted: 123,
    createdAt: '2025-10-20T00:00:00Z',
    updatedAt: '2025-11-06T09:15:00Z',
  },
  {
    id: '3',
    email: 'mike.wilson@example.com',
    name: 'Mike Wilson',
    role: 'reviewer',
    isActive: true,
    status: 'active',
    lastLogin: '2025-11-05T16:45:00Z',
    tasksCompleted: 67,
    createdAt: '2025-10-10T00:00:00Z',
    updatedAt: '2025-11-05T16:45:00Z',
  },
  {
    id: '4',
    email: 'sarah.johnson@example.com',
    name: 'Sarah Johnson',
    role: 'student',
    isActive: false,
    status: 'inactive',
    lastLogin: '2025-11-01T12:20:00Z',
    tasksCompleted: 12,
    createdAt: '2025-10-25T00:00:00Z',
    updatedAt: '2025-11-01T12:20:00Z',
  },
  {
    id: '5',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    isActive: true,
    status: 'active',
    lastLogin: '2025-11-06T10:00:00Z',
    tasksCompleted: 0,
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-11-06T10:00:00Z',
  },
];

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ user }) => {
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>(mockUsers);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editDialog, setEditDialog] = useState(false);

  useEffect(() => {
    filterUsers();
  }, [users, selectedTab, searchQuery]);

  const filterUsers = () => {
    let filtered = users;

    // Filter by role based on selected tab
    const roleFilters: (UserRole | 'all')[] = ['all', 'student', 'participant', 'reviewer', 'admin'];
    const selectedRole = roleFilters[selectedTab];
    
    if (selectedRole !== 'all') {
      filtered = filtered.filter(u => u.role === selectedRole);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'student':
        return <StudentIcon />;
      case 'participant':
        return <ParticipantIcon />;
      case 'reviewer':
        return <ReviewerIcon />;
      case 'admin':
        return <AdminIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'student':
        return '#2196F3';
      case 'participant':
        return '#4CAF50';
      case 'reviewer':
        return '#FF9800';
      case 'admin':
        return '#9C27B0';
      default:
        return '#666';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatLastLogin = (date: string) => {
    const loginDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - loginDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setEditDialog(true);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, isActive: !u.isActive, status: u.isActive ? 'inactive' : 'active' }
        : u
    ));
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const tabLabels = ['All Users', 'Students', 'Participants', 'Reviewers', 'Admins'];
  const userCounts = [
    users.length,
    users.filter(u => u.role === 'student').length,
    users.filter(u => u.role === 'participant').length,
    users.filter(u => u.role === 'reviewer').length,
    users.filter(u => u.role === 'admin').length,
  ];

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
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            sx={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#000',
            }}
          >
            👥 User Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh users">
              <IconButton size="small" onClick={() => filterUsers()}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export users">
              <IconButton size="small">
                <ExportIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />

        {/* Role Tabs */}
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontSize: '12px',
              fontWeight: 500,
              minHeight: '36px',
              px: 1,
            },
          }}
        >
          {tabLabels.map((label, index) => (
            <Tab
              key={label}
              label={`${label} (${userCounts[index]})`}
              sx={{ textTransform: 'none' }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Users List */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid #E0E0E0',
          bgcolor: '#FAFAFA',
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>
                  User
                </TableCell>
                <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>
                  Role
                </TableCell>
                <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((usr) => (
                <TableRow key={usr.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: getRoleColor(usr.role),
                          fontSize: '12px',
                        }}
                      >
                        {usr.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </Avatar>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#000',
                            lineHeight: 1.2,
                          }}
                        >
                          {usr.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '11px',
                            color: '#666',
                            lineHeight: 1.2,
                          }}
                        >
                          {usr.email}
                        </Typography>
                        {usr.lastLogin && (
                          <Typography
                            sx={{
                              fontSize: '10px',
                              color: '#999',
                              lineHeight: 1.2,
                            }}
                          >
                            {formatLastLogin(usr.lastLogin)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ color: getRoleColor(usr.role), display: 'flex' }}>
                        {getRoleIcon(usr.role)}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: '11px',
                          color: getRoleColor(usr.role),
                          fontWeight: 500,
                          textTransform: 'capitalize',
                        }}
                      >
                        {usr.role}
                      </Typography>
                    </Box>
                    {usr.tasksCompleted !== undefined && (
                      <Typography
                        sx={{
                          fontSize: '10px',
                          color: '#666',
                        }}
                      >
                        {usr.tasksCompleted} tasks
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={usr.status}
                      size="small"
                      color={getStatusColor(usr.status) as any}
                      sx={{
                        fontSize: '10px',
                        height: '20px',
                        textTransform: 'capitalize',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit user">
                        <IconButton
                          size="small"
                          onClick={() => handleEditUser(usr)}
                          sx={{ color: '#666' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={usr.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleUserStatus(usr.id)}
                          sx={{ color: usr.isActive ? '#FF9800' : '#4CAF50' }}
                        >
                          {usr.isActive ? <BlockIcon fontSize="small" /> : <ActiveIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      {usr.id !== user.id && (
                        <Tooltip title="Delete user">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(usr.id)}
                            sx={{ color: '#F44336' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Summary Stats */}
      <Grid container spacing={1.5} sx={{ mt: 2 }}>
        <Grid item xs={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '8px',
              border: '1px solid #E0E0E0',
              bgcolor: '#F8F9FA',
            }}
          >
            <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography
                sx={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#4CAF50',
                }}
              >
                {users.filter(u => u.status === 'active').length}
              </Typography>
              <Typography
                sx={{
                  fontSize: '11px',
                  color: '#666',
                }}
              >
                Active Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '8px',
              border: '1px solid #E0E0E0',
              bgcolor: '#F8F9FA',
            }}
          >
            <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography
                sx={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#FF9800',
                }}
              >
                {users.reduce((sum, u) => sum + (u.tasksCompleted || 0), 0)}
              </Typography>
              <Typography
                sx={{
                  fontSize: '11px',
                  color: '#666',
                }}
              >
                Total Tasks Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add User Button */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        fullWidth
        sx={{
          mt: 2,
          borderRadius: '12px',
          py: 1.5,
          fontSize: '14px',
          fontWeight: 600,
          textTransform: 'none',
        }}
      >
        Add New User
      </Button>

      {/* Edit User Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '12px', maxWidth: '350px' }
        }}
      >
        <DialogTitle sx={{ fontSize: '16px', fontWeight: 600 }}>
          Edit User
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Full Name"
                defaultValue={selectedUser.name}
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                defaultValue={selectedUser.email}
                size="small"
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Role</InputLabel>
                <Select defaultValue={selectedUser.role}>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="participant">Participant</MenuItem>
                  <MenuItem value="reviewer">Reviewer</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={<Switch defaultChecked={selectedUser.isActive} />}
                label="Active"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setEditDialog(false)}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUserManagement;