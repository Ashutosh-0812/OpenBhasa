import { apiClient } from './apiClient';
import { ApiResponse } from '@/types';

export interface TaskData {
  project: string;
  title: string;
  description?: string;
  script?: string;
  language: string;
  dialect?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedDuration: number;
  targetRecordings?: number;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
}

export interface TaskResponse {
  tasks: any[];
  total: number;
}

export class TaskService {
  // Get all tasks
  async getAllTasks(): Promise<ApiResponse> {
    try {
      console.log('🔄 FRONTEND: Fetching all tasks...');
      const response = await apiClient.get<any>('/tasks');
      console.log('✅ FRONTEND: Raw tasks response:', response);
      
      if (response) {
        console.log('✅ FRONTEND: Tasks fetched successfully');
        return {
          success: true,
          data: response
        };
      } else {
        console.log('❌ FRONTEND: Empty tasks response');
        return {
          success: false,
          error: 'No tasks data received'
        };
      }
    } catch (error: any) {
      console.error('❌ FRONTEND: Failed to fetch tasks:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch tasks'
      };
    }
  }

  // Get tasks for a specific project
  async getProjectTasks(projectId: string): Promise<ApiResponse> {
    try {
      console.log('🔄 FRONTEND: Fetching tasks for project:', projectId);
      const response = await apiClient.get<any>(`/tasks?project=${projectId}`);
      console.log('✅ FRONTEND: Raw project tasks response:', response);
      
      if (response) {
        console.log('✅ FRONTEND: Project tasks fetched successfully');
        return {
          success: true,
          data: response
        };
      } else {
        console.log('❌ FRONTEND: Empty project tasks response');
        return {
          success: false,
          error: 'No project tasks data received'
        };
      }
    } catch (error: any) {
      console.error('❌ FRONTEND: Failed to fetch project tasks:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch project tasks'
      };
    }
  }

  // Get single task by ID
  async getTask(id: string): Promise<ApiResponse> {
    try {
      console.log('🔄 FRONTEND: Fetching task by ID:', id);
      const response = await apiClient.get<any>(`/tasks/${id}`);
      console.log('✅ FRONTEND: Raw task response:', response);
      
      if (response) {
        console.log('✅ FRONTEND: Task fetched successfully');
        return {
          success: true,
          data: response
        };
      } else {
        console.log('❌ FRONTEND: Empty task response');
        return {
          success: false,
          error: 'No task data received'
        };
      }
    } catch (error: any) {
      console.error('❌ FRONTEND: Failed to fetch task:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch task'
      };
    }
  }

  // Get my assigned tasks
  async getMyTasks(): Promise<ApiResponse> {
    try {
      console.log('🔄 FRONTEND: Fetching my tasks...');
      const response = await apiClient.get<any>('/tasks/my-tasks');
      console.log('✅ FRONTEND: Raw my tasks response:', response);
      
      if (response) {
        console.log('✅ FRONTEND: My tasks fetched successfully');
        return {
          success: true,
          data: response
        };
      } else {
        console.log('❌ FRONTEND: Empty my tasks response');
        return {
          success: false,
          error: 'No my tasks data received'
        };
      }
    } catch (error: any) {
      console.error('❌ FRONTEND: Failed to fetch my tasks:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch my tasks'
      };
    }
  }

  // Create a new task
  async createTask(taskData: TaskData): Promise<ApiResponse> {
    try {
      console.log('🚀 FRONTEND: Starting task creation');
      console.log('📋 FRONTEND: Task Data:', JSON.stringify(taskData, null, 2));
      
      const response = await apiClient.post<any>('/tasks', taskData);
      console.log('✅ FRONTEND: Raw API Response received:', response);
      
      if (response && response.task) {
        console.log('✅ FRONTEND: Task created successfully');
        return {
          success: true,
          data: response
        };
      } else {
        console.log('❌ FRONTEND: Invalid task creation response');
        return {
          success: false,
          error: 'Invalid response format from server'
        };
      }
    } catch (error: any) {
      console.error('❌ FRONTEND: Task creation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create task'
      };
    }
  }

  // Update task
  async updateTask(id: string, taskData: Partial<TaskData>): Promise<ApiResponse> {
    try {
      console.log('🔄 FRONTEND: Updating task:', id);
      const response = await apiClient.put<any>(`/tasks/${id}`, taskData);
      console.log('✅ FRONTEND: Task update response:', response);
      
      if (response) {
        console.log('✅ FRONTEND: Task updated successfully');
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
      console.error('❌ FRONTEND: Task update error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update task'
      };
    }
  }

  // Delete task
  async deleteTask(id: string): Promise<ApiResponse> {
    try {
      console.log('🗑️ FRONTEND: Starting task deletion for ID:', id);
      const response = await apiClient.delete<any>(`/tasks/${id}`);
      console.log('✅ FRONTEND: Delete response received:', response);
      
      if (response) {
        console.log('✅ FRONTEND: Task deleted successfully');
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
      console.error('❌ FRONTEND: Delete task error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete task'
      };
    }
  }
}

// Create singleton instance
export const taskService = new TaskService();
export default taskService;