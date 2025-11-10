import { apiClient } from '@/services/apiClient';
import { ApiResponse } from '@/types';

export interface DashboardStats {
  totalProjects?: number;
  totalTasks?: number;
  completedTasks?: number;
  pendingTasks?: number;
  totalUsers?: number;
  totalRecordings?: number;
  [key: string]: any;
}

export class DashboardService {
  // Get dashboard data based on user role
  async getDashboardData(role: string): Promise<ApiResponse<DashboardStats>> {
    try {
      const endpoint = this.getRoleEndpoint(role);
      const response = await apiClient.get<any>(endpoint);
      
      return {
        success: true,
        data: response,
        message: `${role} dashboard data retrieved successfully`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get dashboard data'
      };
    }
  }

  // Get role-specific endpoint
  private getRoleEndpoint(role: string): string {
    const endpoints = {
      admin: '/auth/admin/dashboard',
      student: '/auth/student/dashboard',
      reviewer: '/auth/reviewer/dashboard',
      participant: '/auth/participant/dashboard'
    };

    return endpoints[role as keyof typeof endpoints] || endpoints.student;
  }

  // Get projects for current user
  async getProjects(): Promise<ApiResponse> {
    return apiClient.getProjects();
  }

  // Get tasks for current user
  async getTasks(): Promise<ApiResponse> {
    return apiClient.getTasks();
  }

  // Get user's assigned tasks
  async getMyTasks(): Promise<ApiResponse> {
    return apiClient.getMyTasks();
  }

  // Create new project (admin only)
  async createProject(projectData: any): Promise<ApiResponse> {
    return apiClient.createProject(projectData);
  }

  // Create new task (admin only)
  async createTask(taskData: any): Promise<ApiResponse> {
    return apiClient.createTask(taskData);
  }
}

// Create singleton instance
export const dashboardService = new DashboardService();
export default dashboardService;