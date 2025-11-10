// Audio recording types and states for mobile speech collection
export type RecordingState = 'idle' | 'recording' | 'paused' | 'done' | 'submitted';
export type AudioQuality = 'low' | 'medium' | 'high';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export interface Recording {
  id: string;
  taskId: string;
  promptId: string;
  userId: string;
  audioBlob?: Blob;
  audioUrl?: string;
  duration: number; // in seconds
  fileSize?: number; // in bytes
  quality: AudioQuality;
  sampleRate?: number;
  createdAt: string;
  submittedAt?: string;
  reviewStatus: ReviewStatus;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

// Recording session state management
export interface RecordingSession {
  id: string;
  taskId: string;
  currentPromptId: string;
  currentPromptIndex: number;
  state: RecordingState;
  startTime?: number;
  pausedTime?: number;
  totalDuration: number;
  recordings: Recording[];
  skippedPrompts: string[];
  isSubmitting: boolean;
  error?: string;
}

// Audio recorder configuration
export interface RecorderConfig {
  sampleRate: number;
  channelCount: number;
  bitDepth: number;
  format: 'wav' | 'mp3' | 'ogg';
  maxDuration: number; // in seconds
  minDuration: number; // in seconds
  enableVoiceActivation: boolean;
  noiseReduction: boolean;
}

// Browser audio permission and capability detection
export interface AudioCapabilities {
  hasMediaDevices: boolean;
  hasMicrophone: boolean;
  hasUserMediaPermission: 'granted' | 'denied' | 'prompt' | 'unknown';
  supportedFormats: string[];
  maxSampleRate: number;
}

// Mobile recorder UI state
export interface RecorderUIState {
  isRecording: boolean;
  isPaused: boolean;
  currentDuration: number;
  amplitude: number; // for waveform visualization
  showWaveform: boolean;
  showTimer: boolean;
  showSkipConfirmation: boolean;
  showSubmitConfirmation: boolean;
  isSubmitting: boolean;
}

// Audio processing and upload
export interface AudioUploadProgress {
  recordingId: string;
  progress: number; // 0-100
  status: 'preparing' | 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}

// Recording analytics and metrics
export interface RecordingMetrics {
  totalRecordings: number;
  totalDuration: number; // in seconds
  averageDuration: number;
  completionRate: number; // percentage
  skipRate: number; // percentage
  retakeRate: number; // percentage
  dailyRecordings: number;
  weeklyRecordings: number;
  streakDays: number;
}