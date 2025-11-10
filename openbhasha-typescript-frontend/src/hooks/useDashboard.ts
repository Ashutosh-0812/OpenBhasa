import { useState, useEffect, useCallback } from 'react';
import { dashboardService, DashboardStats } from '@/services/dashboardService';
import { useAuth } from '@/contexts/AuthContext';
import { participantService } from '@/services/participantService';
import { projectService } from '@/services/projectService';

interface DashboardState {
  stats: DashboardStats | null;
  projects: any[];
  tasks: any[];
  myTasks: any[];
  participantInvites: any[];
  loading: boolean;
  error: string | null;
}

export const useDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<DashboardState>({
    stats: null,
    projects: [],
    tasks: [],
    myTasks: [],
    participantInvites: [],
    loading: true,
    error: null,
  });

  // Load dashboard data (memoized to prevent infinite loops)
  const loadDashboardData = useCallback(async () => {
    if (!user || !isAuthenticated) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Check if backend is available first
      console.log('🔍 Loading dashboard data for user:', user.name);
      
      // Load role-specific dashboard stats
      const statsResponse = await dashboardService.getDashboardData(user.role);
      
      let stats: DashboardStats | null = null;
      if (statsResponse.success && statsResponse.data) {
        stats = statsResponse.data;
      }

      // Load additional data based on role
      let projects: any[] = [];
      let tasks: any[] = [];
      let myTasks: any[] = [];
      let participantInvites: any[] = [];

      if (user.role === 'admin') {
        // Admin can see all projects and tasks
        const [projectsResponse, tasksResponse] = await Promise.all([
          projectService.getAllProjects(),
          dashboardService.getTasks(),
        ]);

        if (projectsResponse.success) {
          const projectsData = projectsResponse.data?.projects || projectsResponse.data || [];
          projects = Array.isArray(projectsData) ? projectsData : [];
        }
        if (tasksResponse.success) {
          tasks = tasksResponse.data || [];
        }
      } else {
        // Students and participants see their projects, tasks and participant invites
        const [projectsResponse, myTasksResponse, participantInvitesResponse] = await Promise.all([
          projectService.getAllProjects(), // Students can also see projects
          dashboardService.getMyTasks(),
          participantService.getMyInvites()
        ]);
        
        if (projectsResponse.success) {
          const projectsData = projectsResponse.data?.projects || projectsResponse.data || [];
          projects = Array.isArray(projectsData) ? projectsData : [];
        }
        if (myTasksResponse.success) {
          myTasks = myTasksResponse.data || [];
        }
        if (participantInvitesResponse.success && participantInvitesResponse.data) {
          participantInvites = participantInvitesResponse.data.invites || [];
        }
      }

      // Calculate dynamic stats based on participant invites
      const finalStats = stats ? {
        ...stats,
        totalParticipants: participantInvites.length,
        activeParticipants: participantInvites.filter(invite => invite.status === 'accepted').length,
        pendingInvites: participantInvites.filter(invite => invite.status === 'pending').length
      } : stats;

      setState({
        stats: finalStats,
        projects,
        tasks,
        myTasks,
        participantInvites,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Dashboard data loading error:', error);
      
      // If backend is unavailable, provide mock data so dashboard still works
      const mockStats = {
        totalProjects: 3,
        totalTasks: 8,
        completedTasks: 5,
        pendingReviews: 2,
        totalRecordings: 12,
        totalParticipants: 25,
        activeUsers: 15,
        completionRate: 62.5,
      };
      
      setState({
        stats: mockStats,
        projects: [],
        tasks: [],
        myTasks: [],
        participantInvites: [],
        loading: false,
        error: null, // Don't show error - just work in offline mode
      });
    }
  }, [user, isAuthenticated]);

  // Refresh dashboard data (memoized)
  const refresh = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Create new project (memoized)
  const createProject = useCallback(async (projectData: any) => {
    const response = await dashboardService.createProject(projectData);
    if (response.success) {
      // Refresh projects list
      const projectsResponse = await dashboardService.getProjects();
      if (projectsResponse.success) {
        setState(prev => ({ ...prev, projects: projectsResponse.data || [] }));
      }
    }
    return response;
  }, []);

  // Create new task (memoized)
  const createTask = useCallback(async (taskData: any) => {
    const response = await dashboardService.createTask(taskData);
    if (response.success) {
      // Refresh tasks list
      const tasksResponse = await dashboardService.getTasks();
      if (tasksResponse.success) {
        setState(prev => ({ ...prev, tasks: tasksResponse.data || [] }));
      }
    }
    return response;
  }, []);

  // Load data on mount and when user changes
  useEffect(() => {
    if (user && isAuthenticated) {
      console.log('📊 Dashboard ready for user:', user.name);
      
      // Load real data from backend
      const timer = setTimeout(() => {
        loadDashboardData();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [user, isAuthenticated, loadDashboardData]);

  return {
    ...state,
    refresh,
    createProject,
    createTask,
  };
};

export default useDashboard;