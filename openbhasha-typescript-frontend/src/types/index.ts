// UI component and navigation types
import type { Permission, UserRole } from './auth';
export type NavigationTab = 'dashboard' | 'projects' | 'review' | 'profile' | 'rewards' | 'participants' | 'tasks';
export type ThemeMode = 'light' | 'dark' | 'system';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Component prop interfaces
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Navigation and routing
export interface NavigationItem {
  key: NavigationTab;
  label: string;
  icon: React.ComponentType;
  path: string;
  requiredRole?: UserRole[];
  requiredPermission?: Permission;
  badge?: number | string;
}

// UI state management
export interface UIState {
  theme: ThemeMode;
  deviceType: DeviceType;
  isOnline: boolean;
  sidebarOpen: boolean;
  bottomSheetOpen: boolean;
  activeModal: string | null;
  notifications: Notification[];
  toast: Toast | null;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Notification {
  id: string;
  type: 'recording_submitted' | 'review_completed' | 'project_assigned' | 'system_update';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Form and input types
export interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'file';
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern';
  value?: any;
  message: string;
}

// Loading and error states
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  errorMessage?: string;
  errorCode?: string;
  canRetry?: boolean;
}

// Re-export core types for convenience
export type { User, UserRole, Permission } from './auth';
export type { Project, Task, TaskType, TaskStatus, Prompt } from './project';
export type { Recording, RecordingState, RecordingSession } from './recording';
export type { ApiResponse, ApiError, LoginRequest, RegisterRequest } from './api';