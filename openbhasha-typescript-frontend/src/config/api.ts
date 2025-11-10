// API Configuration
export const API_CONFIG = {
  BASE_URL: (import.meta as any).env?.DEV ? '' : (process.env.VITE_API_BASE_URL || 'http://localhost:5000'),
  API_PREFIX: (import.meta as any).env?.DEV ? '/api' : '/api',
  TIMEOUT: 10000,
  
  // Endpoints
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register', 
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh-token',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      VERIFY: '/auth/verify',
      ME: '/auth/me',
    },
    
    // Dashboard endpoints
    DASHBOARD: {
      ADMIN: '/auth/admin/dashboard',
      STUDENT: '/auth/student/dashboard',
      REVIEWER: '/auth/reviewer/dashboard',
      PARTICIPANT: '/auth/participant/dashboard',
    },
    
    // Project endpoints
    PROJECTS: {
      CREATE: '/projects',
      GET_ALL: '/projects',
      GET_BY_ID: '/projects',
      UPDATE: '/projects',
      DELETE: '/projects',
      STATS: '/projects/:id/stats',
    },
    
    // Task endpoints  
    TASKS: {
      CREATE: '/tasks',
      GET_ALL: '/tasks',
      GET_BY_ID: '/tasks',
      UPDATE: '/tasks',
      DELETE: '/tasks',
      ASSIGN: '/tasks/:id/assign',
      MY_TASKS: '/tasks/my-tasks',
    },
    
    // Recording endpoints
    RECORDINGS: {
      CREATE: '/recordings',
      GET_ALL: '/recordings',
      GET_BY_ID: '/recordings',
      UPDATE: '/recordings',
      DELETE: '/recordings',
      UPLOAD: '/recordings/upload',
    },
    
    // Task Request endpoints
    TASK_REQUESTS: {
      CREATE: '/task-requests',
      GET_ALL: '/task-requests',
      GET_BY_ID: '/task-requests',
      UPDATE: '/task-requests',
      DELETE: '/task-requests',
      APPROVE: '/task-requests/:id/approve',
      REJECT: '/task-requests/:id/reject',
    },
    
    // User endpoints
    USERS: {
      GET_ALL: '/users',
      GET_BY_ID: '/users',
      UPDATE: '/users',
      DELETE: '/users',
    },
  }
};

export default API_CONFIG;