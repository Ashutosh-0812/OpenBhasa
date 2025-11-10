import { apiClient } from './apiClient';
import { ApiResponse } from '@/types';

export interface ParticipantInviteResponse {
  invites: any[];
  count: number;
}

export class ParticipantService {
  // Get all participant invites for the current student
  async getMyInvites(): Promise<ApiResponse> {
    try {
      const response = await apiClient.getMyParticipantInvites();
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch participant invites'
      };
    }
  }

  // Create a new participant invite
  async createInvite(participantData: any): Promise<ApiResponse> {
    try {
      const response = await apiClient.createParticipantInvite(participantData);
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create participant invite'
      };
    }
  }

  // Get invite details by token
  async getInviteByToken(token: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.getParticipantInviteByToken(token);
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch invite details'
      };
    }
  }

  // Accept a participant invite
  async acceptInvite(token: string, password: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.acceptParticipantInvite(token, password);
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to accept invitation'
      };
    }
  }
}

// Create singleton instance
export const participantService = new ParticipantService();
export default participantService;