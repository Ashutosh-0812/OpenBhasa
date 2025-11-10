# 🎙️ Voice Activity Detection (VAD) - OpenBhasa

## What Was Added?

Your OpenBhasa platform now has **automatic voice activity detection** that:

✅ **Detects silence** in audio recordings  
✅ **Trims silence** from start and end  
✅ **Calculates actual speech duration** vs total recording time  
✅ **Shows summary** like: `VAD: 3:30 min actual speech (85% of 4:07 total)`

---

## Quick Example

### Before VAD:
```
User records: 4:07 total
- 0:30 silence at start (mic adjustment)
- 3:30 actual speech
- 0:07 silence at end (stopping recording)

Saved as: 4:07 duration ❌
```

### After VAD:
```
User records: 4:07 total

VAD Analysis:
✓ Detects 0:37 total silence
✓ Trims edges automatically
✓ Calculates 3:30 actual speech (85%)

Saved as: 3:30 duration ✅
Shows: "VAD: 3:30 actual speech (85% of 4:07 total)"
```

---

## 🚀 Getting Started

### 1. Install FFmpeg (Required)

**Windows (PowerShell as Admin):**
```powershell
choco install ffmpeg
```

**Verify:**
```powershell
ffmpeg -version
```

### 2. Test VAD

**Option A: Test Script**
```powershell
node testVAD.js path/to/your-audio.wav
```

**Option B: API Test**
```powershell
# Start server
npm run dev

# Upload recording
curl -X POST http://localhost:5000/api/recordings/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@recording.wav" \
  -F "taskId=507f1f77bcf86cd799439011"
```

### 3. See Results

**Console Output:**
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

**API Response:**
```json
{
  "recording": { "duration": 210, "..." },
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

---

## 📂 What Files Were Added/Changed?

### New Files:
- `middleware/vadMiddleware.js` - VAD processing logic
- `controllers/recordingControllerWithVAD.js` - File upload controller
- `uploads/recordings/` - Local storage directory
- `testVAD.js` - Test script
- `VAD_INTEGRATION_GUIDE.md` - Complete documentation
- `VAD_QUICKSTART.md` - Quick start guide
- `VAD_ARCHITECTURE.md` - System diagram
- `VAD_SUMMARY.md` - Implementation summary

### Modified Files:
- `models/Recording.js` - Added `vadAnalysis` field
- `routes/recordingRoutes.js` - Added `/upload` endpoint
- `server.js` - Added static file serving
- `package.json` - Added multer, @aws-sdk/client-s3
- `.env.example` - Added AWS S3 config

---

## 🎯 How to Use

### Frontend (Already Integrated!)

Your existing `AudioRecorder.jsx` component works as-is:

```javascript
// In audioSlice.js - uploadRecording thunk
const formData = new FormData();
formData.append('audio', audioBlob, 'recording.wav');
formData.append('taskId', taskId);
formData.append('metadata', JSON.stringify({ duration, notes }));

// Sends to: POST /api/recordings/upload
// Returns: VAD analysis in response
```

### Display VAD Results

Add to your UI:
```jsx
{vadAnalysis && (
  <Alert severity="success">
    <AlertTitle>🎙️ Voice Activity Analysis</AlertTitle>
    <Chip label={`Speech: ${vadAnalysis.actualSpeech}`} color="primary" />
    <Chip label={`${vadAnalysis.speechPercentage} speech`} color="success" />
    {vadAnalysis.trimmed && <Chip label="✂️ Silence trimmed" />}
    <Typography>{vadAnalysis.summary}</Typography>
  </Alert>
)}
```

---

## 🔧 Configuration

### Adjust VAD Sensitivity

Edit `middleware/vadMiddleware.js` line 35:

```javascript
// More aggressive (removes more silence)
silencedetect=noise=-20dB:d=0.3

// Balanced (default) ⭐ Recommended
silencedetect=noise=-30dB:d=0.5

// Conservative (keeps more audio)
silencedetect=noise=-40dB:d=1.0
```

### Storage Options

**Local (Development):**
```env
# No config needed
# Files saved to: uploads/recordings/
```

**AWS S3 (Production):**
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=openbhasa-recordings
```

---

## 📊 VAD Analysis Details

### What Gets Stored in Database:

```javascript
{
  duration: 210,  // Actual speech duration (used for display)
  vadAnalysis: {
    totalDuration: 247,           // Original: 4:07
    actualSpeechDuration: 210,    // Speech: 3:30
    totalSilence: 37,             // Removed: 0:37
    speechPercentage: 85,         // Quality: 85%
    silencePeriods: [             // Detected silence
      { start: 0, end: 2.5, duration: 2.5 },
      { start: 244.5, end: 247, duration: 2.5 }
    ],
    trimmed: true,
    formattedSpeechDuration: "3:30",
    summary: "VAD: 3:30 actual speech (85% of 4:07 total)"
  }
}
```

### Quality Indicators:

| Speech % | Quality | Badge Color |
|----------|---------|-------------|
| > 80% | Excellent ✅ | Green |
| 60-80% | Good ✓ | Blue |
| 40-60% | Fair ⚠️ | Yellow |
| < 40% | Poor ❌ | Red |

---

## 🎉 Benefits

### For Contributors:
- ✅ Automatic silence removal
- ✅ Accurate duration display
- ✅ Instant quality feedback
- ✅ Smaller file sizes

### For Reviewers:
- ✅ Speech quality metric (%)
- ✅ Quick quality assessment
- ✅ Focus on actual content
- ✅ Better review decisions

### For Platform:
- ✅ Data quality insights
- ✅ Storage optimization
- ✅ Automated QA
- ✅ Better analytics

---

## 🐛 Troubleshooting

### Common Issues:

1. **"ffmpeg: command not found"**
   - Install FFmpeg: `choco install ffmpeg`
   - Restart terminal
   - Verify: `ffmpeg -version`

2. **"VAD analysis failed" (but upload works)**
   - Recording still uploads successfully
   - Check FFmpeg installation
   - Check audio file format

3. **"Invalid file type"**
   - Use: webm, wav, mp3, ogg
   - Check MIME type

4. **"File too large"**
   - Max: 50MB (configurable)
   - Reduce quality or duration

---

## 📚 Documentation

- **[VAD_QUICKSTART.md](./VAD_QUICKSTART.md)** - 5-minute setup guide
- **[VAD_INTEGRATION_GUIDE.md](./VAD_INTEGRATION_GUIDE.md)** - Complete technical docs
- **[VAD_ARCHITECTURE.md](./VAD_ARCHITECTURE.md)** - System flow diagram
- **[VAD_SUMMARY.md](./VAD_SUMMARY.md)** - Implementation details

---

## 🚀 Next Steps

1. **Install FFmpeg** (if not already)
2. **Test with sample audio** (`node testVAD.js audio.wav`)
3. **Start backend** (`npm run dev`)
4. **Upload recording** (via frontend or curl)
5. **Verify VAD analysis** in response
6. **Update frontend UI** to display VAD summary
7. **Deploy to production** (ensure FFmpeg on server)

---

## ✨ Example Output

### Terminal:
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

### API Response:
```json
{
  "message": "Recording uploaded successfully",
  "vadAnalysis": {
    "summary": "VAD: 3:12 actual speech (85.33% of 3:45 total)"
  }
}
```

### UI Display:
```
┌─────────────────────────────────────┐
│ 🎙️ Voice Activity Analysis         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Speech: 3:12  Total: 3:45          │
│ 85% speech content  ✂️ Trimmed     │
│                                     │
│ VAD: 3:12 actual speech            │
│ (85% of 3:45 total)                │
└─────────────────────────────────────┘
```

---

## 🎯 Success!

Your platform now automatically:
1. **Detects** voice activity in recordings
2. **Trims** silence from edges
3. **Calculates** actual speech duration
4. **Shows** summary: `VAD: 3:30 min actual speech`

**No frontend changes needed** - existing upload flow works!

---

**Questions?** Check the documentation or test with `testVAD.js`

**VAD Integration Complete! 🎉**
