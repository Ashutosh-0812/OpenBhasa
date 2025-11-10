import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '@/config/api';
import { ApiResponse, LoginRequest, RegisterRequest } from '@/types/api';

declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: { skipAuthRetry?: boolean };
  }
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
}

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL + API_CONFIG.API_PREFIX,
      timeout: API_CONFIG.TIMEOUT,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for handling auth errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Don't retry for auth verification endpoints to prevent infinite loops
        const isAuthEndpoint = error.config?.url?.includes('/auth/verify') || 
                             error.config?.url?.includes('/auth/refresh-token') ||
                             error.config?.url?.includes('/dashboard') ||
                             error.config?.metadata?.skipAuthRetry;
        
        // Only handle 401 errors that aren't retries and aren't auth endpoints
        if (error.response?.status === 401 && !error.config._retry && !isAuthEndpoint) {
          console.log('🔒 Got 401 error for:', error.config?.url);
          error.config._retry = true;
          
          try {
            // Try to refresh token using cookies
            await this.refreshToken();
            console.log('✅ Token refresh successful, retrying request');
            return this.client.request(error.config);
          } catch (refreshError) {
            console.error('🔴 Auth refresh failed:', refreshError);
            // Don't auto-redirect, let components handle this
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Refresh token method using cookies
  private async refreshToken(): Promise<void> {
    if (this.refreshPromise) {
      await this.refreshPromise;
      return;
    }

    this.refreshPromise = (async () => {
      try {
        console.log('🔄 Attempting token refresh...');
        // Use direct axios call to bypass interceptor
        await this.client.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH, {}, {
          metadata: { skipAuthRetry: true }
        });
        console.log('✅ Token refresh successful');
      } catch (error) {
        console.error('❌ Token refresh failed:', error);
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    await this.refreshPromise;
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    console.log('🌐 API CLIENT: GET Request:', { url, config });
    const response: AxiosResponse<T> = await this.client.get(url, config);
    console.log('🌐 API CLIENT: GET Response:', { url, status: response.status, data: response.data });
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    console.log('🌐 API CLIENT: POST Request:', { url, data, config });
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    console.log('🌐 API CLIENT: POST Response:', { url, status: response.status, data: response.data });
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse> {
    try {
      const response = await this.post<any>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
      
      // Backend uses cookies, so we store user data locally
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return {
        success: true,
        data: response.user,
        message: response.message || 'Login successful'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  }

  async register(userData: RegisterRequest): Promise<ApiResponse> {
    try {
      const response = await this.post<any>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
      
      // Backend uses cookies, so we store user data locally
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return {
        success: true,
        data: response.user,
        message: response.message || 'Registration successful'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('user');
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    try {
      await this.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      return {
        success: true,
        message: 'Password reset email sent'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send reset email'
      };
    }
  }

  async resetPassword(token: string, passwords: ResetPasswordRequest): Promise<ApiResponse> {
    try {
      await this.post(`${API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD}/${token}`, passwords);
      return {
        success: true,
        message: 'Password reset successful'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Password reset failed'
      };
    }
  }

  async getCurrentUser(): Promise<ApiResponse> {
    try {
      const response = await this.get<any>(API_CONFIG.ENDPOINTS.AUTH.ME);
      return {
        success: true,
        data: response.user || response
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get user data'
      };
    }
  }

  async verifyToken(): Promise<ApiResponse> {
    try {
      // Use direct axios call to bypass interceptor
      const response = await this.client.get(API_CONFIG.ENDPOINTS.AUTH.VERIFY, {
        metadata: { skipAuthRetry: true }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Token verification failed'
      };
    }
  }

  // Dashboard methods
  async getDashboardData(role: string): Promise<ApiResponse> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.DASHBOARD[role.toUpperCase() as keyof typeof API_CONFIG.ENDPOINTS.DASHBOARD];
      const response = await this.get<any>(endpoint);
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get dashboard data'
      };
    }
  }

  // Check if user is authenticated (using stored user data since backend uses cookies)
  isAuthenticated(): boolean {
    return !!this.getStoredUser();
  }

  // Get stored user data
  getStoredUser(): any {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  // Project API methods
  async getProjects(): Promise<ApiResponse> {
    try {
      const response = await this.get<any>(API_CONFIG.ENDPOINTS.PROJECTS.GET_ALL);
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get projects'
      };
    }
  }

  async createProject(projectData: any): Promise<ApiResponse> {
    try {
      const response = await this.post<any>(API_CONFIG.ENDPOINTS.PROJECTS.CREATE, projectData);
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create project'
      };
    }
  }

  // Task API methods
  async getTasks(): Promise<ApiResponse> {
    try {
      const response = await this.get<any>(API_CONFIG.ENDPOINTS.TASKS.GET_ALL);
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get tasks'
      };
    }
  }

  async getMyTasks(): Promise<ApiResponse> {
    try {
      const response = await this.get<any>(API_CONFIG.ENDPOINTS.TASKS.MY_TASKS);
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get my tasks'
      };
    }
  }

  async createTask(taskData: any): Promise<ApiResponse> {
    try {
      const response = await this.post<any>(API_CONFIG.ENDPOINTS.TASKS.CREATE, taskData);
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create task'
      };
    }
  }

  // Participant Invite API methods
  async createParticipantInvite(participantData: any): Promise<ApiResponse> {
    try {
      const response = await this.post<any>('/participant-invites/create', participantData);
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create participant invite'
      };
    }
  }

  async getMyParticipantInvites(): Promise<ApiResponse> {
    try {
      const response = await this.get<any>('/participant-invites/my-invites');
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get participant invites'
      };
    }
  }

  async getParticipantInviteByToken(token: string): Promise<ApiResponse> {
    try {
      const response = await this.get<any>(`/participant-invites/${token}`);
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Invalid or expired invitation'
      };
    }
  }

  async acceptParticipantInvite(token: string, password: string): Promise<ApiResponse> {
    try {
      const response = await this.post<any>(`/participant-invites/${token}/accept`, { password });
      
      // Store user data after successful acceptance
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to accept invitation'
      };
    }
  }


}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;