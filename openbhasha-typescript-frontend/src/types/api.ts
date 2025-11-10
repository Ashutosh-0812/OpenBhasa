// API client types and response contracts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Request types for different endpoints
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
}

export interface ProjectCreateRequest {
  name: string;
  description: string;
  language: string;
  languageCode: string;
  dueDate?: string;
}

export interface TaskCreateRequest {
  projectId: string;
  title: string;
  type: string;
  description?: string;
  estimatedDuration: number;
  prompts: Array<{
    text: string;
    type: string;
    speaker?: string;
    expectedDuration?: number;
  }>;
}

export interface RecordingSubmitRequest {
  taskId: string;
  promptId: string;
  audioBlob: Blob;
  duration: number;
  quality: string;
}

export interface ReviewSubmitRequest {
  recordingId: string;
  status: 'approved' | 'rejected' | 'flagged';
  notes?: string;
}

// HTTP client configuration
export interface HttpClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// WebSocket event types for real-time updates
export interface WebSocketEvent {
  type: 'recording_submitted' | 'review_completed' | 'project_updated' | 'user_joined';
  payload: any;
  timestamp: string;
}