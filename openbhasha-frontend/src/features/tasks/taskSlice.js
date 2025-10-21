import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { taskAPI } from '../../api/apiClient'

// Initial state
const initialState = {
  tasks: [],
  selectedTask: null,
  currentPrompt: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  }
}

// Async thunks for task operations
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getTasks(params)
      return response.data
    } catch (error) {
      // Mock data for development
      if (error.message && error.message.includes('Network error')) {
        return {
          tasks: [
            {
              id: 1,
              title: 'Hindi Sentence Reading',
              language: 'Hindi',
              type: 'sentence_reading',
              description: 'Read Hindi sentences clearly and naturally',
              available: 50,
              completed: 12,
              verified: 8,
              skipped: 3,
              totalPrompts: 50,
              status: 'active',
              createdAt: '2024-10-15T10:00:00Z'
            },
            {
              id: 2,
              title: 'English Word Pronunciation',
              language: 'English',
              type: 'word_pronunciation',
              description: 'Pronounce English words with correct accent',
              available: 30,
              completed: 5,
              verified: 4,
              skipped: 1,
              totalPrompts: 30,
              status: 'active',
              createdAt: '2024-10-15T11:00:00Z'
            },
            {
              id: 3,
              title: 'Bengali Story Narration',
              language: 'Bengali',
              type: 'story_narration',
              description: 'Narrate short Bengali stories with expression',
              available: 20,
              completed: 0,
              verified: 0,
              skipped: 0,
              totalPrompts: 20,
              status: 'active',
              createdAt: '2024-10-15T12:00:00Z'
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 3,
            totalPages: 1
          }
        }
      }
      return rejectWithValue(error.message || 'Failed to fetch tasks')
    }
  }
)

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getTaskById(taskId)
      return response.data
    } catch (error) {
      // Mock data for development
      if (error.message && error.message.includes('Network error')) {
        return {
          id: taskId,
          title: 'Hindi Sentence Reading',
          language: 'Hindi',
          type: 'sentence_reading',
          description: 'Read Hindi sentences clearly and naturally',
          instructions:
            'Please read each sentence naturally and clearly. Take your time to pronounce each word correctly.',
          available: 50,
          completed: 12,
          verified: 8,
          skipped: 3,
          totalPrompts: 50,
          status: 'active'
        }
      }
      return rejectWithValue(error.message || 'Failed to fetch task')
    }
  }
)

export const fetchNextPrompt = createAsyncThunk(
  'tasks/fetchNextPrompt',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getTaskById(taskId)
      return response.data.nextPrompt
    } catch (error) {
      // Mock data for development
      if (error.message && error.message.includes('Network error')) {
        const prompts = [
          'आज मौसम बहुत अच्छा है।',
          'मैं कल बाजार जाऊंगा।',
          'यह किताब बहुत दिलचस्प है।',
          'बच्चे पार्क में खेल रहे हैं।',
          'सूरज पूर्व दिशा में उगता है।'
        ]
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]
        return {
          id: Date.now(),
          taskId: taskId,
          text: randomPrompt,
          language: 'Hindi',
          type: 'sentence',
          audioRequired: true,
          timeLimit: 30
        }
      }
      return rejectWithValue(error.message || 'Failed to fetch next prompt')
    }
  }
)

export const updateTaskProgress = createAsyncThunk(
  'tasks/updateTaskProgress',
  async ({ taskId, action, promptId }, { rejectWithValue }) => {
    try {
      const response = await taskAPI.updateTask(taskId, { action, promptId })
      return response.data
    } catch (error) {
      // Mock success for development
      if (error.message && error.message.includes('Network error')) {
        return {
          taskId,
          action,
          promptId,
          success: true
        }
      }
      return rejectWithValue(error.message || 'Failed to update task progress')
    }
  }
)

// Task slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null
    },
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload
    },
    clearSelectedTask: state => {
      state.selectedTask = null
      state.currentPrompt = null
    },
    updateTaskLocally: (state, action) => {
      const { taskId, updates } = action.payload
      const taskIndex = state.tasks.findIndex(task => task.id === taskId)
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...updates }
      }
    },
    incrementTaskCount: (state, action) => {
      const { taskId, type } = action.payload
      const task = state.tasks.find(task => task.id === taskId)
      if (task) {
        switch (type) {
          case 'completed':
            task.completed += 1
            task.available = Math.max(0, task.available - 1)
            break
          case 'verified':
            task.verified += 1
            break
          case 'skipped':
            task.skipped += 1
            task.available = Math.max(0, task.available - 1)
            break
        }
      }
    }
  },
  extraReducers: builder => {
    // Fetch tasks
    builder
      .addCase(fetchTasks.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.tasks = action.payload.tasks || action.payload
        state.pagination = action.payload.pagination || state.pagination
        state.error = null
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Fetch task by ID
    builder
      .addCase(fetchTaskById.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedTask = action.payload
        state.error = null
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Fetch next prompt
    builder
      .addCase(fetchNextPrompt.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNextPrompt.fulfilled, (state, action) => {
        state.loading = false
        state.currentPrompt = action.payload
        state.error = null
      })
      .addCase(fetchNextPrompt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Update task progress
    builder
      .addCase(updateTaskProgress.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTaskProgress.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        // Update task counts locally
        const { taskId, action: progressAction } = action.payload
        const task = state.tasks.find(task => task.id === taskId)
        if (task) {
          switch (progressAction) {
            case 'complete':
              task.completed += 1
              task.available = Math.max(0, task.available - 1)
              break
            case 'skip':
              task.skipped += 1
              task.available = Math.max(0, task.available - 1)
              break
          }
        }
      })
      .addCase(updateTaskProgress.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const {
  clearError,
  setSelectedTask,
  clearSelectedTask,
  updateTaskLocally,
  incrementTaskCount
} = taskSlice.actions

// Selectors
export const selectTasks = state => state.tasks
export const selectTasksList = state => state.tasks.tasks
export const selectSelectedTask = state => state.tasks.selectedTask
export const selectCurrentPrompt = state => state.tasks.currentPrompt
export const selectTasksLoading = state => state.tasks.loading
export const selectTasksError = state => state.tasks.error
export const selectTasksPagination = state => state.tasks.pagination

export default taskSlice.reducer
