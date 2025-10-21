import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { reviewerAPI } from '../../api/apiClient'

// Initial state
const initialState = {
  pendingAudios: [],
  currentAudio: null,
  verdicts: [],
  reviewBatches: [],
  currentBatch: null,
  reviewStats: {
    totalReviewed: 0,
    approved: 0,
    rejected: 0,
    flagged: 0
  },
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  }
}

// Async thunks for review operations
export const fetchPendingAudios = createAsyncThunk(
  'review/fetchPendingAudios',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await reviewerAPI.getReviewBatches(params)
      return response.data
    } catch (error) {
      // Mock data for development
      if (error.message && error.message.includes('Network error')) {
        return {
          audios: [
            {
              id: 1,
              promptId: 1,
              taskId: 1,
              taskTitle: 'Hindi Sentence Reading',
              promptText: 'आज मौसम बहुत अच्छा है।',
              audioUrl: '/mock-audio-1.wav',
              duration: 5.2,
              submittedBy: 'Student123',
              submittedAt: '2024-10-15T10:30:00Z',
              language: 'Hindi',
              type: 'sentence_reading',
              status: 'pending_review'
            },
            {
              id: 2,
              promptId: 2,
              taskId: 1,
              taskTitle: 'Hindi Sentence Reading',
              promptText: 'मैं कल बाजार जाऊंगा।',
              audioUrl: '/mock-audio-2.wav',
              duration: 3.8,
              submittedBy: 'Participant456',
              submittedAt: '2024-10-15T11:15:00Z',
              language: 'Hindi',
              type: 'sentence_reading',
              status: 'pending_review'
            },
            {
              id: 3,
              promptId: 3,
              taskId: 2,
              taskTitle: 'English Word Pronunciation',
              promptText: 'Beautiful',
              audioUrl: '/mock-audio-3.wav',
              duration: 2.1,
              submittedBy: 'Student789',
              submittedAt: '2024-10-15T12:00:00Z',
              language: 'English',
              type: 'word_pronunciation',
              status: 'pending_review'
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
      return rejectWithValue(error.message || 'Failed to fetch pending audios')
    }
  }
)

export const submitReviewVerdict = createAsyncThunk(
  'review/submitReviewVerdict',
  async ({ audioId, verdict, comments, tags }, { rejectWithValue }) => {
    try {
      const response = await reviewerAPI.reviewRecording(audioId, {
        verdict,
        comments,
        tags,
        reviewedAt: new Date().toISOString()
      })
      return response.data
    } catch (error) {
      // Mock success for development
      if (error.message && error.message.includes('Network error')) {
        return {
          id: Date.now(),
          audioId,
          verdict,
          comments,
          tags,
          reviewedAt: new Date().toISOString(),
          reviewerId: 'reviewer-123',
          success: true
        }
      }
      return rejectWithValue(error.message || 'Failed to submit review verdict')
    }
  }
)

export const fetchReviewBatches = createAsyncThunk(
  'review/fetchReviewBatches',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await reviewerAPI.getReviewBatches(params)
      return response.data
    } catch (error) {
      // Mock data for development
      if (error.message && error.message.includes('Network error')) {
        return {
          batches: [
            {
              id: 1,
              taskId: 1,
              taskTitle: 'Hindi Sentence Reading',
              language: 'Hindi',
              totalAudios: 25,
              reviewedAudios: 12,
              pendingAudios: 13,
              createdAt: '2024-10-15T09:00:00Z',
              status: 'in_progress'
            },
            {
              id: 2,
              taskId: 2,
              taskTitle: 'English Word Pronunciation',
              language: 'English',
              totalAudios: 15,
              reviewedAudios: 5,
              pendingAudios: 10,
              createdAt: '2024-10-15T10:00:00Z',
              status: 'in_progress'
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
      return rejectWithValue(error.message || 'Failed to fetch review batches')
    }
  }
)

export const fetchReviewStats = createAsyncThunk(
  'review/fetchReviewStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reviewerAPI.getReviewStats()
      return response.data
    } catch (error) {
      // Mock data for development
      if (error.message && error.message.includes('Network error')) {
        return {
          totalReviewed: 45,
          approved: 32,
          rejected: 8,
          flagged: 5,
          todayReviewed: 12,
          averageReviewTime: 25, // seconds
          qualityScore: 85.5
        }
      }
      return rejectWithValue(error.message || 'Failed to fetch review stats')
    }
  }
)

// Review slice
const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    setCurrentAudio: (state, action) => {
      state.currentAudio = action.payload
    },
    clearCurrentAudio: state => {
      state.currentAudio = null
    },
    updateAudioStatus: (state, action) => {
      const { audioId, status } = action.payload
      const audio = state.pendingAudios.find(audio => audio.id === audioId)
      if (audio) {
        audio.status = status
      }
    },
    removeAudioFromPending: (state, action) => {
      const audioId = action.payload
      state.pendingAudios = state.pendingAudios.filter(
        audio => audio.id !== audioId
      )
    },
    addVerdict: (state, action) => {
      state.verdicts.unshift(action.payload)
    },
    updateReviewStats: (state, action) => {
      const { verdict } = action.payload
      state.reviewStats.totalReviewed += 1

      switch (verdict) {
        case 'approved':
          state.reviewStats.approved += 1
          break
        case 'rejected':
          state.reviewStats.rejected += 1
          break
        case 'flagged':
          state.reviewStats.flagged += 1
          break
      }
    },
    clearError: state => {
      state.error = null
    },
    resetReviewState: state => {
      state.currentAudio = null
      state.verdicts = []
      state.error = null
    }
  },
  extraReducers: builder => {
    // Fetch pending audios
    builder
      .addCase(fetchPendingAudios.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPendingAudios.fulfilled, (state, action) => {
        state.loading = false
        state.pendingAudios = action.payload.audios || action.payload
        state.pagination = action.payload.pagination || state.pagination
        state.error = null
      })
      .addCase(fetchPendingAudios.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Submit review verdict
    builder
      .addCase(submitReviewVerdict.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(submitReviewVerdict.fulfilled, (state, action) => {
        state.loading = false
        state.error = null

        // Add verdict to list
        state.verdicts.unshift(action.payload)

        // Remove audio from pending list
        const audioId = action.payload.audioId
        state.pendingAudios = state.pendingAudios.filter(
          audio => audio.id !== audioId
        )

        // Update stats
        const verdict = action.payload.verdict
        state.reviewStats.totalReviewed += 1

        switch (verdict) {
          case 'approved':
            state.reviewStats.approved += 1
            break
          case 'rejected':
            state.reviewStats.rejected += 1
            break
          case 'flagged':
            state.reviewStats.flagged += 1
            break
        }

        // Clear current audio
        state.currentAudio = null
      })
      .addCase(submitReviewVerdict.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Fetch review batches
    builder
      .addCase(fetchReviewBatches.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReviewBatches.fulfilled, (state, action) => {
        state.loading = false
        state.reviewBatches = action.payload.batches || action.payload
        state.error = null
      })
      .addCase(fetchReviewBatches.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Fetch review stats
    builder
      .addCase(fetchReviewStats.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReviewStats.fulfilled, (state, action) => {
        state.loading = false
        state.reviewStats = { ...state.reviewStats, ...action.payload }
        state.error = null
      })
      .addCase(fetchReviewStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const {
  setCurrentAudio,
  clearCurrentAudio,
  updateAudioStatus,
  removeAudioFromPending,
  addVerdict,
  updateReviewStats,
  clearError,
  resetReviewState
} = reviewSlice.actions

// Selectors
export const selectReview = state => state.review
export const selectPendingAudios = state => state.review.pendingAudios
export const selectCurrentAudio = state => state.review.currentAudio
export const selectVerdicts = state => state.review.verdicts
export const selectReviewBatches = state => state.review.reviewBatches
export const selectReviewStats = state => state.review.reviewStats
export const selectReviewLoading = state => state.review.loading
export const selectReviewError = state => state.review.error
export const selectReviewPagination = state => state.review.pagination

export default reviewSlice.reducer
