import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../api/apiClient'

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  role: null, // 'admin', 'student', 'participant', 'reviewer'
  redirectTo: null
}

// Async thunks for authentication actions
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed')
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout()
      return {}
    } catch (error) {
      // Even if logout fails, clear local state
      return {}
    }
  }
)

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyToken()
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Token verification failed')
    }
  }
)

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authAPI.forgotPassword(email)
      return response.data
    } catch (error) {
      // Mock for development
      if (error.message && error.message.includes('Network error')) {
        return {
          message: 'OTP sent successfully (Demo mode)',
          success: true
        }
      }
      return rejectWithValue(error.message || 'Failed to send OTP')
    }
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPassword(token, newPassword)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reset password')
    }
  }
)

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null
    },
    setCredentials: (state, action) => {
      const { user, role, redirectTo } = action.payload
      state.user = user
      state.role = role
      state.redirectTo = redirectTo
      state.isAuthenticated = true
    },
    clearCredentials: state => {
      state.user = null
      state.role = null
      state.redirectTo = null
      state.isAuthenticated = false
    }
  },
  extraReducers: builder => {
    // Login user
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.role = action.payload.user.role
        state.redirectTo = action.payload.redirectTo
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.role = null
        state.redirectTo = null
      })

    // Register user
    builder
      .addCase(registerUser.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.role = action.payload.user.role
        state.redirectTo = action.payload.redirectTo
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Logout user
    builder.addCase(logoutUser.fulfilled, state => {
      state.user = null
      state.role = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
      state.redirectTo = null
    })

    // Verify token
    builder
      .addCase(verifyToken.pending, state => {
        state.loading = true
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.role = action.payload.user.role
        state.redirectTo = action.payload.redirectTo
        state.error = null
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.role = null
        state.redirectTo = null
      })

    // Forgot Password
    builder
      .addCase(forgotPassword.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Reset Password
    builder
      .addCase(resetPassword.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError, setCredentials, clearCredentials } =
  authSlice.actions

// Selectors
export const selectAuth = state => state.auth
export const selectUser = state => state.auth.user
export const selectIsAuthenticated = state => state.auth.isAuthenticated
export const selectUserRole = state => state.auth.role
export const selectAuthLoading = state => state.auth.loading
export const selectAuthError = state => state.auth.error

export default authSlice.reducer
