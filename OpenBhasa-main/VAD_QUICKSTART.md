# Quick Start: Testing VAD Feature

## 🚀 Quick Setup (5 minutes)

### Step 1: Install FFmpeg

**Windows (PowerShell as Administrator):**
```powershell
# Using Chocolatey
choco install ffmpeg

# OR download from: https://www.gyan.dev/ffmpeg/builds/
# Extract and add to PATH: C:\ffmpeg\bin
```

**Verify:**
```powershell
ffmpeg -version
```

### Step 2: Start Backend Server

```powershell
cd d:\BoloIntern\OpenBhasa\OpenBhasa-main
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB connected successfully
```

### Step 3: Test VAD with Audio File

**Option A: Using Test Script**

1. Get a test audio file (WAV, MP3, or WebM)
2. Run:
```powershell
node testVAD.js path\to\your\audio.wav
```

**Example Output:**
```
🎙️ Testing VAD on: C:\audio\test.wav
⏳ Analyzing audio... (this may take a few seconds)

✅ VAD Analysis Complete!

═══════════════════════════════════════
📊 VOICE ACTIVITY DETECTION RESULTS
═══════════════════════════════════════

⏱️  Duration Analysis:
   Total Duration:    3:45 (225s)
   Actual Speech:     3:12 (192s)
   Total Silence:     0:33 (33s)
   Speech Percentage: 85.33%

✂️  Trimming Info:
   Trim from Start:   2.5s
   Trim from End:     3.0s
   Should Trim:       Yes ✓

🔇 Silence Periods Detected: 3
   1. 0s - 2.5s (2.5s)
   2. 120.3s - 125.0s (4.7s)
   3. 222.0s - 225.0s (3.0s)

📝 Summary:
   "VAD: 3:12 actual speech (85.33% of 3:45 total)"

═══════════════════════════════════════

🎉 EXCELLENT: High speech content (>80%)
```

**Option B: Using API Endpoint**

1. Login to get auth token:
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"student@test.com","password":"password123"}'
```

2. Upload recording with VAD:
```powershell
curl -X POST http://localhost:5000/api/recordings/upload `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -F "audio=@test-recording.wav" `
  -F "taskId=507f1f77bcf86cd799439011" `
  -F 'metadata={"duration":120,"notes":"Test recording"}'
```

**Response:**
```json
{
  "message": "Recording uploaded successfully",
  "recording": {
    "_id": "...",
    "audioUrl": "/uploads/recordings/...",
    "duration": 192,
    "vadAnalysis": {
      "totalDuration": 225,
      "actualSpeechDuration": 192,
      "speechPercentage": 85.33,
      "summary": "VAD: 3:12 actual speech (85.33% of 3:45 total)"
    }
  },
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

## 📱 Frontend Integration

### Update Frontend to Use New Endpoint

The existing frontend code already works! Just make sure `audioAPI.uploadRecording` points to `/recordings/upload`.

**File: `openbhasha-frontend/src/api/apiClient.js`**

Already configured correctly:
```javascript
export const audioAPI = {
  uploadRecording: formData =>
    apiClient.post('/recordings/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  // ...
}
```

### Display VAD Results in UI

**File: `openbhasha-frontend/src/pages/TaskRecording.jsx`** (example):

```jsx
import { Alert, AlertTitle, Chip, Box } from '@mui/material';

const TaskRecording = () => {
  const [vadResults, setVadResults] = useState(null);

  const handleSubmit = async () => {
    try {
      const result = await dispatch(uploadRecording({
        audioBlob,
        taskId,
        promptId,
        metadata: { duration, notes, accent }
      })).unwrap();

      // Save VAD results
      if (result.vadAnalysis) {
        setVadResults(result.vadAnalysis);
      }

      // Show success message
      toast.success(`Recording submitted! ${result.vadAnalysis?.summary || ''}`);
    } catch (error) {
      toast.error('Upload failed');
    }
  };

  return (
    <div>
      <AudioRecorder onComplete={handleSubmit} />

      {/* Display VAD Results */}
      {vadResults && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <AlertTitle>🎙️ Voice Activity Analysis</AlertTitle>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            <Chip label={`Speech: ${vadResults.actualSpeech}`} color="primary" size="small" />
            <Chip label={`Total: ${vadResults.totalDuration}`} variant="outlined" size="small" />
            <Chip 
              label={`${vadResults.speechPercentage} speech`} 
              color={parseFloat(vadResults.speechPercentage) > 70 ? 'success' : 'warning'} 
              size="small" 
            />
            {vadResults.trimmed && (
              <Chip label="✂️ Silence trimmed" color="success" size="small" />
            )}
          </Box>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {vadResults.summary}
          </Typography>
        </Alert>
      )}
    </div>
  );
};
```

## 🎯 What Happens Now?

### 1. Recording Upload Flow
```
User records audio in browser
   ↓
Frontend sends file to POST /api/recordings/upload
   ↓
Backend receives file (multer)
   ↓
VAD Middleware processes audio:
   - Detects total duration
   - Finds silence periods
   - Calculates actual speech
   - Trims silence from edges
   - Generates summary
   ↓
Controller saves to database with VAD analysis
   ↓
Response includes VAD summary
   ↓
Frontend displays: "VAD: 3:30 actual speech"
```

### 2. What Gets Saved?

**Recording Document:**
```javascript
{
  _id: ObjectId("..."),
  task: ObjectId("..."),
  contributor: ObjectId("..."),
  audioUrl: "/uploads/recordings/user_task_timestamp.webm",
  duration: 192,  // Actual speech duration (3:12)
  fileSize: 1234567,
  vadAnalysis: {
    totalDuration: 225,           // Original: 3:45
    actualSpeechDuration: 192,    // Speech: 3:12
    totalSilence: 33,             // Removed: 0:33
    speechPercentage: 85.33,      // Quality: 85%
    trimmed: true,
    formattedSpeechDuration: "3:12",
    summary: "VAD: 3:12 actual speech (85.33% of 3:45 total)"
  },
  reviewStatus: "pending"
}
```

### 3. Reviewer Dashboard

Reviewers see VAD summary when reviewing:

```
Recording #123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎙️ Voice Activity: 3:12 actual speech (85% of 3:45 total)
✅ High quality speech content

[Audio Player]
[Play] [Pause] [0:00 / 3:12]

Quality Score: ⭐⭐⭐⭐⭐
[Approve] [Reject] [Needs Revision]
```

## 🔧 Configuration

### Adjust VAD Sensitivity

**File: `middleware/vadMiddleware.js` (line 35)**

```javascript
// More sensitive (removes more silence)
const silenceCmd = `ffmpeg -i "${audioPath}" -af silencedetect=noise=-20dB:d=0.3 -f null - 2>&1`;

// Default (balanced)
const silenceCmd = `ffmpeg -i "${audioPath}" -af silencedetect=noise=-30dB:d=0.5 -f null - 2>&1`;

// Less sensitive (keeps more audio)
const silenceCmd = `ffmpeg -i "${audioPath}" -af silencedetect=noise=-40dB:d=1.0 -f null - 2>&1`;
```

### Change File Size Limit

**File: `controllers/recordingControllerWithVAD.js` (line 19)**

```javascript
const upload = multer({
  limits: {
    fileSize: 100 * 1024 * 1024 // Change to 100MB
  }
});
```

## ✅ Verification Checklist

- [ ] FFmpeg installed and in PATH
- [ ] Backend server running (`npm run dev`)
- [ ] MongoDB connected
- [ ] Test audio file available
- [ ] VAD test script runs successfully
- [ ] API endpoint returns VAD analysis
- [ ] Frontend displays VAD summary
- [ ] Database contains `vadAnalysis` field

## 🐛 Troubleshooting

### Error: "ffmpeg: command not found"
**Fix:** Install FFmpeg and restart terminal

### Error: "Failed to upload recording"
**Fix:** Check file size (max 50MB), format (webm/wav/mp3), and authentication

### Warning: "VAD analysis failed"
**Fix:** Recording still uploads, but without VAD data. Check ffmpeg installation.

### Error: "Task not found"
**Fix:** Create a task first or use valid taskId

## 📚 Next Steps

1. ✅ Test with sample audio file
2. ✅ Verify VAD summary in response
3. ✅ Check database for `vadAnalysis` field
4. ✅ Update frontend to display VAD results
5. ✅ Test with actual recordings from browser
6. 🚀 Deploy to production

## 🎉 Success!

You should now see:
- **Terminal logs:** VAD analysis output during upload
- **API response:** VAD summary in JSON
- **Database:** `vadAnalysis` object stored
- **Frontend:** "VAD: 3:30 min actual speech" displayed

---

**Need help?** Check [VAD_INTEGRATION_GUIDE.md](./VAD_INTEGRATION_GUIDE.md) for detailed documentation.
