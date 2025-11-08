// Core user roles and permissions for the speech recording application
export type UserRole = 'admin' | 'student' | 'reviewer' | 'participant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  college?: string;
  phone?: string;
  age?: number;
  gender?: string;
  native?: string;
  language?: string[];
  dialects?: string[];
  accent?: string[];
  avatar?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
}

// Role-based permission matrix
export interface RolePermissions {
  admin: {
    canManageProjects: true;
    canManageUsers: true;
    canViewDashboard: true;
    canAssignTasks: true;
    canViewReports: true;
    canAccessReviewQueue: false;
    canRecordAudio: false;
  };
  reviewer: {
    canManageProjects: false;
    canManageUsers: false;
    canViewDashboard: true;
    canAssignTasks: false;
    canViewReports: true;
    canAccessReviewQueue: true;
    canRecordAudio: false;
  };
  student: {
    canManageProjects: false;
    canManageUsers: false;
    canViewDashboard: true;
    canAssignTasks: false;
    canViewReports: false;
    canAccessReviewQueue: false;
    canRecordAudio: true;
  };
  participant: {
    canManageProjects: false;
    canManageUsers: false;
    canViewDashboard: true;
    canAssignTasks: false;
    canViewReports: false;
    canAccessReviewQueue: false;
    canRecordAudio: true;
  };
}

export type Permission = keyof RolePermissions['admin'];