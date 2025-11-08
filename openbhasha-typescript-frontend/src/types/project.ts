// Project and task management types for speech recording
export type TaskType = 'read-only' | 'conversational' | 'continuous';
export type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'skipped';
export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface Project {
  id: string;
  _id?: string; // MongoDB ObjectId
  name: string;
  title?: string; // Alternative field name from backend
  description: string;
  language: string;
  languageCode: string; // e.g., 'hi', 'te', 'en'
  status: ProjectStatus;
  totalTasks: number;
  completedTasks: number;
  assignedUsers: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  type: TaskType;
  description?: string;
  prompts: Prompt[];
  assignedTo: string[];
  status: TaskStatus;
  estimatedDuration: number; // in minutes
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prompt {
  id: string;
  taskId: string;
  text: string;
  order: number;
  type: TaskType;
  // For conversational tasks
  speaker?: 'system' | 'bot' | 'user';
  conversationTurn?: number;
  // For continuous tasks
  expectedDuration?: number; // in seconds
  // Metadata
  language: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Task completion tracking
export interface TaskProgress {
  taskId: string;
  userId: string;
  completedPrompts: number;
  totalPrompts: number;
  skippedPrompts: number;
  totalDuration: number; // in seconds
  startedAt: string;
  lastActiveAt: string;
  completedAt?: string;
}

// Project statistics for dashboard
export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalRecordings: number;
  verifiedRecordings: number;
  pendingReviews: number;
  totalParticipants: number;
}