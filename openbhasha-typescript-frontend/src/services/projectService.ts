import { apiClient } from './apiClient';
import { ApiResponse } from '@/types';

export interface ProjectData {
  name: string;
  description: string;
  language: string;
  languageCode: string;
  totalTasks?: number;
  assignedUsers?: string[];
}

export interface ProjectResponse {
  projects: any[];
  count: number;
}

export class ProjectService {
  // Get all projects
  async getAllProjects(): Promise<ApiResponse> {
    try {
      console.log('🔄 FRONTEND: Fetching all projects...');
      const response = await apiClient.get<any>('/projects');
      console.log('✅ FRONTEND: Raw projects response:', response);
      
      // Backend returns projects directly or in a wrapper
      // Convert to expected format
      if (response) {
        console.log('✅ FRONTEND: Projects fetched successfully, formatting response');
        return {
          success: true,
          data: response
        };
      } else {
        console.log('❌ FRONTEND: Empty or invalid projects response');
        return {
          success: false,
          error: 'No projects data received'
        };
      }
    } catch (error: any) {
      console.error('❌ FRONTEND: Failed to fetch projects:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch projects'
      };
    }
  }

  // Get single project by ID
  async getProject(id: string): Promise<ApiResponse> {
    try {
      console.log('🔄 FRONTEND: Fetching project by ID:', id);
      const response = await apiClient.get<any>(`/projects/${id}`);
      console.log('✅ FRONTEND: Raw project response:', response);
      
      // Convert raw response to expected format
      if (response) {
        console.log('✅ FRONTEND: Project fetched successfully');
        return {
          success: true,
          data: response
        };
      } else {
        console.log('❌ FRONTEND: Empty project response');
        return {
          success: false,
          error: 'No project data received'
        };
      }
    } catch (error: any) {
      console.error('❌ FRONTEND: Failed to fetch project:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch project'
      };
    }
  }

  // Create a new project (admin and students)
  async createProject(projectData: ProjectData): Promise<ApiResponse> {
    try {
      console.log('🚀 FRONTEND: Starting project creation');
      console.log('📋 FRONTEND: Project Data:', JSON.stringify(projectData, null, 2));
      
      console.log('📡 FRONTEND: Making API request to /api/projects');
      const response = await apiClient.post<any>('/projects', projectData);
      
      console.log('✅ FRONTEND: Raw API Response received:', response);
      
      // Backend returns { message: '...', project: {...} }
      // We need to convert to { success: true, data: {...} } format
      if (response && response.project) {
        console.log('✅ FRONTEND: Project created successfully, formatting response');
        return {
          success: true,
          data: response
        };
      } else {
        console.log('❌ FRONTEND: Invalid response format:', response);
        return {
          success: false,
          error: 'Invalid response format from server'
        };
      }
    } catch (error: any) {
      console.error('❌ FRONTEND: Project creation error:', error);
      console.error('❌ FRONTEND: Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      return {
        success: false,
        error: error.message || 'Failed to create project'
      };
    }
  }

  // Update project (admin and students)
  async updateProject(id: string, projectData: Partial<ProjectData>): Promise<ApiResponse> {
    try {
      console.log('🔄 FRONTEND: Updating project:', id);
      console.log('📋 FRONTEND: Update data:', JSON.stringify(projectData, null, 2));
      
      const response = await apiClient.put<any>(`/projects/${id}`, projectData);
      console.log('✅ FRONTEND: Project update response:', response);
      
      if (response) {
        console.log('✅ FRONTEND: Project updated successfully');
        return {
          success: true,
          data: response
        };
      } else {
        console.log('❌ FRONTEND: Invalid update response');
        return {
          success: false,
          error: 'Invalid response from server'
        };
      }
    } catch (error: any) {
      console.error('❌ FRONTEND: Project update error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update project'
      };
    }
  }

  // Delete project (admin and students)
  async deleteProject(id: string): Promise<ApiResponse> {
    try {
      console.log('🗑️ FRONTEND: Starting project deletion for ID:', id);
      const response = await apiClient.delete<any>(`/projects/${id}`);
      console.log('✅ FRONTEND: Delete response received:', response);
      
      // Convert raw response to expected format
      if (response) {
        console.log('✅ FRONTEND: Project deleted successfully');
        return {
          success: true,
          data: response
        };
      } else {
        console.log('❌ FRONTEND: Invalid delete response');
        return {
          success: false,
          error: 'Invalid response from server'
        };
      }
    } catch (error: any) {
      console.error('❌ FRONTEND: Delete project error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete project'
      };
    }
  }

  // Assign users to project (admin and students)
  async assignUsersToProject(id: string, userIds: string[]): Promise<ApiResponse> {
    try {
      console.log('👥 FRONTEND: Assigning users to project:', id);
      console.log('👥 FRONTEND: User IDs:', userIds);
      
      const response = await apiClient.put<any>(`/projects/${id}/assign-users`, {
        assignedUsers: userIds
      });
      console.log('✅ FRONTEND: User assignment response:', response);
      
      if (response) {
        console.log('✅ FRONTEND: Users assigned successfully');
        return {
          success: true,
          data: response
        };
      } else {
        console.log('❌ FRONTEND: Invalid assignment response');
        return {
          success: false,
          error: 'Invalid response from server'
        };
      }
    } catch (error: any) {
      console.error('❌ FRONTEND: User assignment error:', error);
      return {
        success: false,
        error: error.message || 'Failed to assign users to project'
      };
    }
  }

  // Get project statistics (admin, reviewer)
  async getProjectStats(id: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.get<any>(`/projects/${id}/stats`);
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch project statistics'
      };
    }
  }
}

// Create singleton instance
export const projectService = new ProjectService();
export default projectService;