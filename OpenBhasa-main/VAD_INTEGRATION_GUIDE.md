# Voice Activity Detection (VAD) Integration Guide

## 🎯 Overview

The OpenBhasa platform now includes **Voice Activity Detection (VAD)** middleware that automatically:
- **Detects silence** in audio recordings
- **Trims silence** from start and end
- **Calculates actual speech duration** vs total duration
- **Shows VAD summary** like "VAD: 3:30 min actual speech (85% of 4:07 total)"

## 🛠️ Prerequisites

### 1. Install FFmpeg (Required)

The VAD middleware uses **ffmpeg** for audio analysis. Install it on your system:

#### Windows
```powershell
# Using Chocolatey
choco install ffmpeg

# Or download from: https://ffmpeg.org/download.html
# Add ffmpeg to your PATH environment variable
```

#### macOS
```bash
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg
```

#### Verify Installation
```bash
ffmpeg -version
```

### 2. Dependencies Already Installed

The following packages were installed:
- `multer` - File upload handling
- `@aws-sdk/client-s3` - AWS S3 integration (optional)

## 📂 Files Created/Modified

### New Files
1. **`middleware/vadMiddleware.js`** - VAD processing middleware
2. **`controllers/recordingControllerWithVAD.js`** - Updated controller with file upload
3. **`uploads/recordings/`** - Directory for local audio storage

### Modified Files
1. **`models/Recording.js`** - Added `vadAnalysis` field
2. **`routes/recordingRoutes.js`** - Added `/upload` endpoint
3. **`server.js`** - Added static file serving for `/uploads`

## 🚀 How It Works

### Recording Upload Flow

```
Frontend AudioRecorder
   ↓ Records audio (MediaRecorder API)
   ↓ Creates audioBlob
   ↓
POST /api/recordings/upload
   ↓ [multer] Receives file
   ↓ [vadMiddleware] Processes audio
      ├─ Detects total duration
      ├─ Finds silence periods (< -30dB for > 0.5s)
      ├─ Calculates actual speech duration
      ├─ Trims silence from start/end
      └─ Creates VAD summary
   ↓
[Controller] Saves to database
   ├─ Uploads to S3 (or saves locally)
   ├─ Stores VAD analysis
   └─ Updates task/project stats
   ↓
Response: {
  recording: { ... },
  vadAnalysis: {
    totalDuration: "4:07",
    actualSpeech: "3:30",
    silenceRemoved: "0:37",
    speechPercentage: "85%",
    trimmed: true,
    summary: "VAD: 3:30 actual speech (85% of 4:07 total)"
  }
}
```

### VAD Analysis Output

The `vadAnalysis` object in the Recording model contains:

```javascript
{
  totalDuration: 247.5,              // Total recording duration (seconds)
  actualSpeechDuration: 210.3,       // Duration with actual speech
  totalSilence: 37.2,                // Total silence detected
  speechPercentage: 85.0,            // Percentage of speech
  silencePeriods: [                  // Detected silence periods
    { start: 0, end: 2.5, duration: 2.5 },
    { start: 120.3, end: 125.0, duration: 4.7 },
    ...
  ],
  trimStart: 2.5,                    // Seconds trimmed from start
  trimEnd: 245.0,                    // End point after trimming
  trimmed: true,                     // Whether audio was trimmed
  formattedSpeechDuration: "3:30",   // Human-readable format
  summary: "VAD: 3:30 actual speech (85% of 4:07 total)"
}
```

## 🎛️ VAD Configuration

You can adjust VAD sensitivity in `middleware/vadMiddleware.js`:

```javascript
// Line 35-36: Adjust silence detection parameters
const silenceCmd = `ffmpeg -i "${audioPath}" -af silencedetect=noise=-30dB:d=0.5 -f null - 2>&1`;
//                                                              ^^^^^^^^    ^^^
//                                                              |           |
//                                                              Noise       Duration
//                                                              threshold   threshold
```

### Parameters:
- **`noise=-30dB`**: Silence threshold (lower = more sensitive)
  - `-30dB` = moderate (default)
  - `-40dB` = less sensitive (keeps more audio)
  - `-20dB` = more sensitive (removes more)

- **`d=0.5`**: Minimum silence duration (seconds)
  - `0.5` = 500ms (default)
  - `1.0` = 1 second (less aggressive)
  - `0.3` = 300ms (more aggressive)

## 📡 API Endpoints

### 1. Upload Recording with VAD (Recommended)

**POST** `/api/recordings/upload`

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer <token> (or cookie)
```

**Body (FormData):**
```javascript
const formData = new FormData();
formData.append('audio', audioBlob, 'recording.webm');
formData.append('taskId', '507f1f77bcf86cd799439011');
formData.append('promptId', 'prompt_123');
formData.append('metadata', JSON.stringify({
  duration: 120,
  notes: 'Clear pronunciation',
  environment: 'quiet',
  deviceInfo: { browser: 'Chrome' }
}));
```

**Response:**
```json
{
  "message": "Recording uploaded successfully",
  "recording": {
    "_id": "...",
    "task": "...",
    "audioUrl": "/uploads/recordings/...",
    "duration": 210.3,
    "vadAnalysis": {
      "totalDuration": 247.5,
      "actualSpeechDuration": 210.3,
      "summary": "VAD: 3:30 actual speech (85% of 4:07 total)"
    }
  },
  "vadAnalysis": {
    "totalDuration": "4:07",
    "actualSpeech": "3:30",
    "silenceRemoved": "0:37",
    "speechPercentage": "85%",
    "trimmed": true,
    "summary": "VAD: 3:30 actual speech (85% of 4:07 total)"
  }
}
```

### 2. Submit Recording (Legacy - Without VAD)

**POST** `/api/recordings`

Still works for backward compatibility. Accepts `audioUrl` instead of file upload.

## 🖥️ Frontend Integration

### Update `audioSlice.js`

The existing `uploadRecording` thunk already works with the new endpoint:

```javascript
// openbhasha-frontend/src/features/audio/audioSlice.js
export const uploadRecording = createAsyncThunk(
  'audio/uploadRecording',
  async ({ audioBlob, promptId, taskId, metadata }, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, `recording_${promptId}_${Date.now()}.wav`)
      formData.append('promptId', promptId)
      formData.append('taskId', taskId)
      formData.append('metadata', JSON.stringify(metadata))

      // This now hits /api/recordings/upload with VAD processing
      const response = await audioAPI.uploadRecording(formData)
      
      // Extract VAD analysis from response
      return {
        ...response.data,
        vadAnalysis: response.data.vadAnalysis
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to upload recording')
    }
  }
)
```

### Display VAD Results

Add VAD summary to your UI:

```jsx
// In AudioRecorder.jsx or TaskRecording.jsx
const handleSubmit = async () => {
  try {
    const result = await dispatch(uploadRecording(recordingData)).unwrap();
    
    // Show VAD analysis
    if (result.vadAnalysis) {
      showNotification({
        type: 'success',
        message: result.vadAnalysis.summary,
        details: `
          Total: ${result.vadAnalysis.totalDuration}
          Speech: ${result.vadAnalysis.actualSpeech}
          Removed: ${result.vadAnalysis.silenceRemoved}
        `
      });
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Example UI Component

```jsx
import { Chip, Typography, Box } from '@mui/material';
import { CheckCircle, Mic } from '@mui/icons-material';

const VADDisplay = ({ vadAnalysis }) => {
  if (!vadAnalysis) return null;

  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        🎙️ Voice Activity Detection
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
        <Chip 
          icon={<Mic />}
          label={`Speech: ${vadAnalysis.formattedSpeechDuration}`}
          color="primary"
          size="small"
        />
        <Chip 
          label={`Total: ${vadAnalysis.formattedDuration}`}
          variant="outlined"
          size="small"
        />
        <Chip 
          label={`${vadAnalysis.speechPercentage}% speech`}
          color={vadAnalysis.speechPercentage > 70 ? 'success' : 'warning'}
          size="small"
        />
        {vadAnalysis.trimmed && (
          <Chip 
            icon={<CheckCircle />}
            label="Silence trimmed"
            color="success"
            size="small"
          />
        )}
      </Box>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {vadAnalysis.summary}
      </Typography>
    </Box>
  );
};

export default VADDisplay;
```

## ☁️ Cloud Storage (Optional)

### AWS S3 Setup

To store audio files in AWS S3 instead of locally:

1. **Create S3 Bucket**
   - Go to AWS Console → S3
   - Create bucket: `openbhasa-recordings`
   - Enable public access for recordings

2. **Create IAM User**
   - Go to IAM → Users → Create User
   - Attach policy: `AmazonS3FullAccess`
   - Create access keys

3. **Configure Environment Variables**

Add to `.env`:

```env
# AWS S3 Configuration (optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=openbhasa-recordings
```

4. **Restart Server**

If AWS variables are present, recordings will automatically upload to S3. Otherwise, they save locally in `uploads/recordings/`.

## 🧪 Testing

### 1. Test VAD Endpoint

```bash
# Using curl (PowerShell)
curl -X POST http://localhost:5000/api/recordings/upload `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -F "audio=@test-recording.webm" `
  -F "taskId=507f1f77bcf86cd799439011" `
  -F 'metadata={"duration":120,"notes":"Test"}'
```

### 2. Check VAD Output

The terminal will show VAD analysis logs:

```
🎙️ Starting VAD analysis...
📊 VAD Analysis Complete:
  - Total Duration: 4:07 (247s)
  - Actual Speech: 3:30 (210s)
  - Silence Removed: 0:37 (37s)
  - Speech: 85%
✂️ Trimming silence from audio...
✅ Audio trimmed successfully! New duration: 3:30
```

### 3. Verify in Database

Check MongoDB for `vadAnalysis` field:

```javascript
db.recordings.findOne({}, { vadAnalysis: 1 })
```

## 📊 Display in Dashboard

### Reviewer Dashboard

Show VAD analysis when reviewing recordings:

```jsx
const RecordingCard = ({ recording }) => (
  <Card>
    <CardContent>
      <Typography variant="h6">{recording.task.title}</Typography>
      
      {/* Audio Player */}
      <audio controls src={recording.audioUrl} />
      
      {/* VAD Summary */}
      {recording.vadAnalysis && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <AlertTitle>Voice Activity Analysis</AlertTitle>
          {recording.vadAnalysis.summary}
          
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption">
              Total: {recording.vadAnalysis.formattedDuration} | 
              Speech: {recording.vadAnalysis.formattedSpeechDuration} | 
              Quality: {recording.vadAnalysis.speechPercentage}% speech content
            </Typography>
          </Box>
        </Alert>
      )}
      
      {/* Review Form */}
      <ReviewForm recording={recording} />
    </CardContent>
  </Card>
);
```

## 🔧 Troubleshooting

### FFmpeg Not Found

**Error:** `Voice activity detection failed: ffmpeg: command not found`

**Solution:**
1. Install ffmpeg (see Prerequisites)
2. Verify installation: `ffmpeg -version`
3. Restart your terminal/IDE
4. On Windows, add to PATH: `C:\Program Files\ffmpeg\bin`

### Audio Format Not Supported

**Error:** `Invalid file type. Only audio files allowed.`

**Solution:** Ensure audio MIME type is one of:
- `audio/webm`
- `audio/wav`
- `audio/mp3`
- `audio/mpeg`
- `audio/ogg`

### VAD Analysis Failed (Continues Anyway)

If VAD fails, the recording still uploads successfully but without VAD analysis:

```json
{
  "recording": { "vadAnalysis": null },
  "vadAnalysis": null
}
```

Check server logs for detailed error messages.

### File Too Large

**Error:** `File too large`

**Solution:** Default limit is 50MB. Adjust in `recordingControllerWithVAD.js`:

```javascript
const upload = multer({
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});
```

## 🎉 Example Output

After uploading a recording, you'll see:

**Console Output:**
```
🎙️ Starting VAD analysis...
📊 VAD Analysis Complete:
  - Total Duration: 3:45 (225s)
  - Actual Speech: 3:12 (192s)
  - Silence Removed: 0:33 (33s)
  - Speech: 85.33%
✂️ Trimming silence from audio...
✅ Audio trimmed successfully! New duration: 3:12
```

**API Response:**
```json
{
  "message": "Recording uploaded successfully",
  "vadAnalysis": {
    "totalDuration": "3:45",
    "actualSpeech": "3:12",
    "silenceRemoved": "0:33",
    "speechPercentage": "85.33%",
    "trimmed": true,
    "summary": "VAD: 3:12 actual speech (85.33% of 3:45 total)"
  }
}
```

## 📝 Summary

✅ **VAD middleware automatically:**
- Detects silence in audio recordings
- Trims unnecessary silence
- Calculates actual speech duration
- Provides human-readable summary

✅ **Usage:**
```
POST /api/recordings/upload
→ Upload audio file
→ Get VAD analysis
→ Display "VAD: 3:30 min actual speech"
```

✅ **Benefits:**
- Accurate duration tracking
- Better quality control
- Storage optimization (trimmed files)
- Improved reviewer experience

## 🔗 Related Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Backend Summary](./BACKEND_SUMMARY.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)

---

**Need help?** Check server logs or contact the development team.
