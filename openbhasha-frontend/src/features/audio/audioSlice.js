import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { audioAPI } from '../../api/apiClient'

// Initial state
const initialState = {
  currentPrompt: null,
  isRecording: false,
  isPaused: false,
  audioBlob: null,
  audioUrl: null,
  recordingTime: 0,
  uploadStatus: 'idle', // 'idle' | 'uploading' | 'success' | 'error'
  playbackStatus: 'idle', // 'idle' | 'playing' | 'paused'
  recordings: [],
  error: null,
  loading: false,
  mediaRecorder: null,
  stream: null
}

// Async thunks for audio operations
export const uploadRecording = createAsyncThunk(
  'audio/uploadRecording',
  async ({ audioBlob, promptId, taskId, metadata }, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append(
        'audio',
        audioBlob,
        `recording_${promptId}_${Date.now()}.wav`
      )
      formData.append('promptId', promptId)
      formData.append('taskId', taskId)
      formData.append('metadata', JSON.stringify(metadata))

      const response = await audioAPI.uploadRecording(formData)
      return response.data
    } catch (error) {
      // Mock success for development
      if (error.message && error.message.includes('Network error')) {
        return {
          id: Date.now(),
          promptId,
          taskId,
          audioUrl: URL.createObjectURL(audioBlob),
          duration: metadata?.duration || 0,
          fileSize: audioBlob.size,
          uploadedAt: new Date().toISOString(),
          status: 'uploaded'
        }
      }
      return rejectWithValue(error.message || 'Failed to upload recording')
    }
  }
)

export const fetchRecordings = createAsyncThunk(
  'audio/fetchRecordings',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await audioAPI.getRecordings(params)
      return response.data
    } catch (error) {
      // Mock data for development
      if (error.message && error.message.includes('Network error')) {
        return {
          recordings: [
            {
              id: 1,
              promptId: 1,
              taskId: 1,
              audioUrl: '/mock-audio-1.wav',
              duration: 5.2,
              fileSize: 52000,
              uploadedAt: '2024-10-15T10:30:00Z',
              status: 'pending_review'
            },
            {
              id: 2,
              promptId: 2,
              taskId: 1,
              audioUrl: '/mock-audio-2.wav',
              duration: 3.8,
              fileSize: 38000,
              uploadedAt: '2024-10-15T11:15:00Z',
              status: 'approved'
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1
          }
        }
      }
      return rejectWithValue(error.message || 'Failed to fetch recordings')
    }
  }
)

// Audio slice
const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    startRecording: (state, action) => {
      state.isRecording = true
      state.isPaused = false
      state.recordingTime = 0
      state.audioBlob = null
      state.audioUrl = null
      state.uploadStatus = 'idle'
      state.error = null
      state.mediaRecorder = action.payload.mediaRecorder
      state.stream = action.payload.stream
    },
    pauseRecording: state => {
      state.isPaused = true
      state.isRecording = false
    },
    resumeRecording: state => {
      state.isPaused = false
      state.isRecording = true
    },
    stopRecording: (state, action) => {
      state.isRecording = false
      state.isPaused = false
      state.audioBlob = action.payload.audioBlob
      state.audioUrl = action.payload.audioUrl

      // Clean up media recorder and stream
      if (state.mediaRecorder) {
        state.mediaRecorder = null
      }
      if (state.stream) {
        state.stream = null
      }
    },
    updateRecordingTime: (state, action) => {
      state.recordingTime = action.payload
    },
    clearRecording: state => {
      state.audioBlob = null
      state.audioUrl = null
      state.recordingTime = 0
      state.uploadStatus = 'idle'
      state.playbackStatus = 'idle'
      state.error = null
    },
    setPlaybackStatus: (state, action) => {
      state.playbackStatus = action.payload
    },
    setCurrentPrompt: (state, action) => {
      state.currentPrompt = action.payload
    },
    clearCurrentPrompt: state => {
      state.currentPrompt = null
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    clearError: state => {
      state.error = null
    },
    resetUploadStatus: state => {
      state.uploadStatus = 'idle'
    }
  },
  extraReducers: builder => {
    // Upload recording
    builder
      .addCase(uploadRecording.pending, state => {
        state.uploadStatus = 'uploading'
        state.loading = true
        state.error = null
      })
      .addCase(uploadRecording.fulfilled, (state, action) => {
        state.uploadStatus = 'success'
        state.loading = false
        state.recordings.unshift(action.payload)
        state.error = null

        // Clear current recording after successful upload
        state.audioBlob = null
        state.audioUrl = null
        state.recordingTime = 0
      })
      .addCase(uploadRecording.rejected, (state, action) => {
        state.uploadStatus = 'error'
        state.loading = false
        state.error = action.payload
      })

    // Fetch recordings
    builder
      .addCase(fetchRecordings.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRecordings.fulfilled, (state, action) => {
        state.loading = false
        state.recordings = action.payload.recordings || action.payload
        state.error = null
      })
      .addCase(fetchRecordings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const {
  startRecording,
  pauseRecording,
  resumeRecording,
  stopRecording,
  updateRecordingTime,
  clearRecording,
  setPlaybackStatus,
  setCurrentPrompt,
  clearCurrentPrompt,
  setError,
  clearError,
  resetUploadStatus
} = audioSlice.actions

// Selectors
export const selectAudio = state => state.audio
export const selectIsRecording = state => state.audio.isRecording
export const selectIsPaused = state => state.audio.isPaused
export const selectAudioBlob = state => state.audio.audioBlob
export const selectAudioUrl = state => state.audio.audioUrl
export const selectRecordingTime = state => state.audio.recordingTime
export const selectUploadStatus = state => state.audio.uploadStatus
export const selectPlaybackStatus = state => state.audio.playbackStatus
export const selectCurrentPrompt = state => state.audio.currentPrompt
export const selectRecordings = state => state.audio.recordings
export const selectAudioLoading = state => state.audio.loading
export const selectAudioError = state => state.audio.error

export default audioSlice.reducer
