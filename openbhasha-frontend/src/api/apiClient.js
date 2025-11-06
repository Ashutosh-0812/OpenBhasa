import axios from 'axios'

// Base URL - update this to match your backend API
const BASE_URL = import.meta.env.VITE_API_URL 

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true, // Include cookies in requests
  timeout: 10000 // 10 second timeout
})

// Request interceptor - cookies are automatically included with withCredentials: true
apiClient.interceptors.request.use(
  config => {
    // Cookies are automatically handled by the browser with withCredentials: true
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors globally
apiClient.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status

      if (status === 401) {
        // Unauthorized - redirect to login (cookies will be cleared by logout endpoint)
        window.location.href = '/login'
      } else if (status === 403) {
        // Forbidden - insufficient permissions
        console.error('Access forbidden:', error.response.data)
      } else if (status >= 500) {
        // Server error
        console.error('Server error:', error.response.data)
      }

      return Promise.reject(error.response.data)
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error:', error.request)
      return Promise.reject({
        message: 'Network error. Please check your connection.'
      })
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request error:', error.message)
      return Promise.reject({
        message: error.message
      })
    }
  }
)

// Auth API endpoints
export const authAPI = {
  login: credentials => apiClient.post('/auth/login', credentials),

  register: userData => apiClient.post('/auth/register', userData),

  logout: () => apiClient.post('/auth/logout'),

  verifyToken: () => apiClient.get('/auth/verify'),

  refreshToken: () => apiClient.post('/auth/refresh-token'),

  forgotPassword: email => apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (token, newPassword) =>
    apiClient.post(`/auth/reset-password/${token}`, { password: newPassword })
}

// User API endpoints
export const userAPI = {
  getProfile: () => apiClient.get('/users/profile'),

  updateProfile: profileData => apiClient.put('/users/profile', profileData),

  changePassword: passwordData =>
    apiClient.put('/users/change-password', passwordData)
}

// Task API endpoints (for future use)
export const taskAPI = {
  getTasks: () => apiClient.get('/tasks'),

  getTaskById: taskId => apiClient.get(`/tasks/${taskId}`),

  createTask: taskData => apiClient.post('/tasks', taskData),

  updateTask: (taskId, taskData) => apiClient.put(`/tasks/${taskId}`, taskData),

  deleteTask: taskId => apiClient.delete(`/tasks/${taskId}`)
}

// Audio/Recording API endpoints (for future use)
export const audioAPI = {
  uploadRecording: formData =>
    apiClient.post('/recordings/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),

  getRecordings: params => apiClient.get('/recordings', { params }),

  getRecordingById: recordingId => apiClient.get(`/recordings/${recordingId}`),

  updateRecording: (recordingId, data) =>
    apiClient.put(`/recordings/${recordingId}`, data),

  deleteRecording: recordingId => apiClient.delete(`/recordings/${recordingId}`)
}

// Admin API endpoints (for future use)
export const adminAPI = {
  getUsers: params => apiClient.get('/admin/users', { params }),

  getUserById: userId => apiClient.get(`/admin/users/${userId}`),

  updateUser: (userId, userData) =>
    apiClient.put(`/admin/users/${userId}`, userData),

  deleteUser: userId => apiClient.delete(`/admin/users/${userId}`),

  getDashboardStats: () => apiClient.get('/admin/dashboard/stats')
}

// Student API endpoints (for future use)
export const studentAPI = {
  generateReferralLink: () => apiClient.post('/student/referral/generate'),

  getParticipants: () => apiClient.get('/student/participants'),

  approveParticipant: participantId =>
    apiClient.put(`/student/participants/${participantId}/approve`),

  removeParticipant: participantId =>
    apiClient.delete(`/student/participants/${participantId}`),

  assignTask: (participantId, taskId) =>
    apiClient.post(`/student/participants/${participantId}/assign-task`, {
      taskId
    })
}

// Participant Invite API endpoints
export const participantInviteAPI = {
  createInvite: participantData =>
    apiClient.post('/participant-invites/create', participantData),

  getMyInvites: () => apiClient.get('/participant-invites/my-invites'),

  getInviteByToken: token => apiClient.get(`/participant-invites/${token}`),

  acceptInvite: (token, password) =>
    apiClient.post(`/participant-invites/${token}/accept`, { password })
}

// Reviewer API endpoints (for future use)
export const reviewerAPI = {
  getReviewBatches: params => apiClient.get('/reviewer/batches', { params }),

  getBatchById: batchId => apiClient.get(`/reviewer/batches/${batchId}`),

  reviewRecording: (recordingId, reviewData) =>
    apiClient.put(`/reviewer/recordings/${recordingId}/review`, reviewData),

  getReviewStats: () => apiClient.get('/reviewer/stats')
}

export default apiClient
