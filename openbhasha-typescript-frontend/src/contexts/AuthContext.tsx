import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/services/apiClient';
import { User, ApiResponse, LoginRequest, RegisterRequest } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<ApiResponse>;
  register: (userData: RegisterRequest) => Promise<ApiResponse>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Debug state changes (reduced logging)
  useEffect(() => {
    if (state.user) {
      console.log('✅ User authenticated:', state.user.name, state.user.role);
    } else if (!state.isLoading) {
      console.log('❌ No user authenticated');
    }
  }, [state.user, state.isLoading]);

  // Initialize auth state from stored data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing auth state...');
        const storedUser = apiClient.getStoredUser();
        
        if (storedUser) {
          console.log('📁 Found stored user:', storedUser.name);
          console.log('🔍 Validating session with backend...');
          
          // Validate the session with the backend
          const validation = await apiClient.verifyToken();
          
          if (validation.success) {
            console.log('✅ Session valid, user authenticated');
            setState({
              user: storedUser,
              isLoading: false,
              isAuthenticated: true,
              error: null,
            });
          } else {
            console.log('❌ Session invalid, clearing stored data');
            // Clear invalid stored data
            localStorage.removeItem('user');
            setState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
              error: null,
            });
          }
        } else {
          console.log('❌ No stored user found');
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('🚫 Auth initialization error:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('user');
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<ApiResponse> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    console.log('🔄 AuthContext: Attempting login for:', credentials.email);

    try {
      const response = await apiClient.login(credentials);

      console.log('🔄 AuthContext: API response:', { 
        success: response.success, 
        hasData: !!response.data,
        userRole: response.data?.role,
        error: response.error 
      });

      if (response.success && response.data) {
        // Ensure localStorage is updated (apiClient should have done this, but let's be sure)
        localStorage.setItem('user', JSON.stringify(response.data));
        console.log('🔄 AuthContext: Updating state with user:', response.data.name, 'role:', response.data.role);
        
        setState({
          user: response.data,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        console.log('✅ AuthContext: State updated successfully for role:', response.data.role);
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
    console.log('🚪 Logging out user...');
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Call backend logout endpoint to clear cookies
      await apiClient.logout();
      console.log('✅ Backend logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      // Clear local state
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
      
      // Clear any local storage items
      localStorage.removeItem('user');
      localStorage.removeItem('userData');
      
      console.log('🔓 User logged out successfully');
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const setUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setState({
      user,
      isLoading: false,
      isAuthenticated: true,
      error: null,
    });
    console.log('✅ AuthContext: User manually set:', user.name, 'role:', user.role);
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};