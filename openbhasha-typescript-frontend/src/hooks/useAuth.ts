import { useState, useEffect } from 'react';
import { apiClient } from '@/services/apiClient';
import { User, ApiResponse, LoginRequest, RegisterRequest } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Debug state changes
  useEffect(() => {
    console.log('🔍 useAuth state changed:', { 
      hasUser: !!state.user, 
      isLoading: state.isLoading, 
      isAuthenticated: state.isAuthenticated,
      userName: state.user?.name 
    });
  }, [state]);

  // Initialize auth state from stored data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = apiClient.getStoredUser();
        const isAuthenticated = apiClient.isAuthenticated();

        // If we have a stored user, trust it and set as authenticated
        if (storedUser) {
          setState({
            user: storedUser,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });
          return;
        }

        // No stored user, set as unauthenticated
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      } catch (error) {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: 'Authentication check failed',
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<ApiResponse> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.login(credentials);

      if (response.success && response.data) {
        // Ensure localStorage is updated (apiClient should have done this, but let's be sure)
        localStorage.setItem('user', JSON.stringify(response.data));
        console.log('🔄 useAuth: Updating state with user:', response.data);
        
        setState({
          user: response.data,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        console.log('✅ useAuth: State updated successfully');
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Login failed',
        }));
      }

      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const register = async (userData: RegisterRequest): Promise<ApiResponse> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.register(userData);

      if (response.success && response.data) {
        setState({
          user: response.data,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Registration failed',
        }));
      }

      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const logout = async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    }
  };

  const forgotPassword = async (email: string): Promise<ApiResponse> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.forgotPassword(email);
      setState(prev => ({ ...prev, isLoading: false }));
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const resetPassword = async (token: string, password: string, confirmPassword: string): Promise<ApiResponse> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.resetPassword(token, { password, confirmPassword });
      setState(prev => ({ ...prev, isLoading: false }));
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const updateUser = (updatedUser: User): void => {
    setState(prev => ({
      ...prev,
      user: updatedUser,
    }));
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const clearError = (): void => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    ...state,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateUser,
    clearError,
  };
};