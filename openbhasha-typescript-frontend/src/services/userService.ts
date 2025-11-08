import { apiClient } from './apiClient';
import { ApiResponse } from '@/types';

export interface UserData {
  name: string;
  email: string;
  role: 'admin' | 'student' | 'reviewer' | 'participant';
  college?: string;
  department?: string;
}

export class UserService {
  // Get all users (admin only)
  async getAllUsers(): Promise<ApiResponse> {
    try {
      console.log('🔄 FRONTEND: Fetching all users...');
      const response = await apiClient.get<any>('/users');
      console.log('✅ FRONTEND: Raw users response:', response);
      
      if (response) {
        console.log('✅ FRONTEND: Users fetched successfully');
        return {
          success: true,
          data: response
        };
      } else {
        console.log('❌ FRONTEND: Empty users response');
        return {
          success: false,
          error: 'No users data received'
        };
      }
    } catch (error: any) {
      console.error('❌ FRONTEND: Failed to fetch users:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch users'
      };
    }
  }

  // Get users by role
  async getUsersByRole(role: string): Promise<ApiResponse> {
    try {
      console.log('🔄 FRONTEND: Fetching users by role:', role);
      const response = await apiClient.get<any>(`/users?role=${role}`);
      console.log('✅ FRONTEND: Raw users by role response:', response);
      
      if (response) {
        console.log('✅ FRONTEND: Users by role fetched successfully');
        return {
          success: true,
          data: response
        };
      } else {
        console.log('❌ FRONTEND: Empty users by role response');
        return {
          success: false,
          error: 'No users data received'
        };
      }
    } catch (error: any) {
      console.error('❌ FRONTEND: Failed to fetch users by role:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch users by role'
      };
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<ApiResponse> {
    try {
      console.log('🔄 FRONTEND: Fetching current user...');
      const response = await apiClient.get<any>('/auth/me');
      console.log('✅ FRONTEND: Raw current user response:', response);
      
      if (response) {
        console.log('✅ FRONTEND: Current user fetched successfully');
        return {
          success: true,
          data: response
        };
      } else {
        console.log('❌ FRONTEND: Empty current user response');
        return {
          success: false,
          error: 'No user data received'
        };
      }
    } catch (error: any) {
      console.error('❌ FRONTEND: Failed to fetch current user:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch current user'
      };
    }
  }

  // Update user profile
  async updateUser(id: string, userData: Partial<UserData>): Promise<ApiResponse> {
    try {
      console.log('🔄 FRONTEND: Updating user:', id);
      const response = await apiClient.put<any>(`/users/${id}`, userData);
      console.log('✅ FRONTEND: User update response:', response);
      
      if (response) {
        console.log('✅ FRONTEND: User updated successfully');
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
      console.error('❌ FRONTEND: User update error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update user'
      };
    }
  }

  // Delete user (admin only)
  async deleteUser(id: string): Promise<ApiResponse> {
    try {
      console.log('🗑️ FRONTEND: Starting user deletion for ID:', id);
      const response = await apiClient.delete<any>(`/users/${id}`);
      console.log('✅ FRONTEND: Delete response received:', response);
      
      if (response) {
        console.log('✅ FRONTEND: User deleted successfully');
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
      console.error('❌ FRONTEND: Delete user error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete user'
      };
    }
  }
}

// Create singleton instance
export const userService = new UserService();
export default userService;
