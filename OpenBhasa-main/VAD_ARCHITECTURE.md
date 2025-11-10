# VAD Architecture Diagram

## System Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OpenBhasa VAD Integration                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. FRONTEND (Browser)                                                       │
└─────────────────────────────────────────────────────────────────────────────┘

    📱 User Interface (AudioRecorder.jsx)
        │
        │ User clicks "Record"
        ├──> navigator.mediaDevices.getUserMedia()
        │    └─> Microphone access granted
        │
        │ Recording...
        ├──> MediaRecorder API captures audio
        │    ├─> audioChunks[] collected
        │    └─> Waveform visualization (Web Audio API)
        │
        │ User clicks "Stop"
        ├──> audioBlob created (Blob type: audio/webm)
        │    └─> URL.createObjectURL() for preview
        │
        │ User reviews & clicks "Submit"
        └──> uploadRecording(audioBlob, taskId, metadata)


    🔄 Redux Store (audioSlice.js)
        │
        ├──> createAsyncThunk: uploadRecording
        │    └─> FormData preparation:
        │         ├─ audio: audioBlob
        │         ├─ taskId: "507f1f77bcf86cd799439011"
        │         └─ metadata: JSON.stringify({ duration, notes })
        │
        └──> API Call: POST /api/recordings/upload
             └─> Content-Type: multipart/form-data

                        │
                        │ HTTP Request
                        ↓

┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. BACKEND (Node.js + Express)                                             │
└─────────────────────────────────────────────────────────────────────────────┘

    🔐 Authentication Middleware (auth.js)
        │
        ├──> Verify JWT token
        ├──> Attach req.user
        └──> Check role: student/participant
                        │
                        ↓

    📁 Multer Middleware (file upload)
        │
        ├──> Parse multipart/form-data
        ├──> Extract audio file
        ├──> Validate:
        │    ├─ MIME type: audio/webm, audio/wav, audio/mp3
        │    └─ Size: < 50MB
        ├──> Store in memory: req.file.buffer
        └──> Attach metadata: req.body
                        │
                        ↓

    🎙️ VAD Middleware (vadMiddleware.js)
        │
        ├──> Save buffer to temp file
        │    └─ /tmp/input_timestamp_recording.webm
        │
        ├──> FFmpeg Analysis #1: Get Duration
        │    └─ ffmpeg -i audio.webm 2>&1 | findstr "Duration"
        │         └─> totalDuration: 225s (3:45)
        │
        ├──> FFmpeg Analysis #2: Detect Silence
        │    └─ ffmpeg -i audio.webm -af silencedetect=noise=-30dB:d=0.5
        │         ├─> silence_start: 0
        │         ├─> silence_end: 2.5
        │         ├─> silence_start: 120
        │         ├─> silence_end: 125
        │         └─> ... (all silence periods)
        │
        ├──> Calculate:
        │    ├─ totalSilence = sum(silence durations) = 33s
        │    ├─ actualSpeech = totalDuration - totalSilence = 192s
        │    ├─ speechPercentage = (192/225) * 100 = 85.33%
        │    ├─ trimStart = first silence end = 2.5s
        │    └─ trimEnd = last silence start = 222s
        │
        ├──> Trim Audio (if needed)
        │    └─ ffmpeg -i input.webm -ss 2.5 -t 219.5 output.webm
        │         ├─> Removes start silence (0-2.5s)
        │         ├─> Removes end silence (222-225s)
        │         └─> New duration: 192s (3:12)
        │
        ├──> Replace buffer:
        │    └─ req.file.buffer = trimmedAudioBuffer
        │
        └──> Attach analysis:
             └─ req.vadAnalysis = {
                  totalDuration: 225,
                  actualSpeechDuration: 192,
                  totalSilence: 33,
                  speechPercentage: 85.33,
                  silencePeriods: [...],
                  trimmed: true,
                  summary: "VAD: 3:12 actual speech (85% of 3:45 total)"
                }
                        │
                        ↓

    💾 Recording Controller (recordingControllerWithVAD.js)
        │
        ├──> Validate task exists and is active
        ├──> Check for duplicate recording
        │
        ├──> Storage Decision:
        │    ├─> IF AWS_S3_BUCKET configured:
        │    │   ├─ Upload to S3:
        │    │   │  └─ s3://openbhasa/recordings/user_task_time.webm
        │    │   └─ audioUrl = "https://bucket.s3.region.amazonaws.com/..."
        │    │
        │    └─> ELSE (Local Development):
        │        ├─ Save to: uploads/recordings/user_task_time.webm
        │        └─ audioUrl = "/uploads/recordings/user_task_time.webm"
        │
        ├──> Create Recording Document:
        │    └─ Recording.create({
        │         task: taskId,
        │         contributor: req.user._id,
        │         audioUrl: audioUrl,
        │         duration: vadAnalysis.actualSpeechDuration, // 192s
        │         fileSize: req.file.size,
        │         vadAnalysis: {
        │           totalDuration: 225,
        │           actualSpeechDuration: 192,
        │           speechPercentage: 85.33,
        │           summary: "VAD: 3:12 actual speech"
        │         },
        │         reviewStatus: 'pending'
        │       })
        │
        ├──> Update Statistics:
        │    ├─ Task.completedRecordings++
        │    ├─ User.stats.totalRecordings++
        │    └─ Project.metadata.completedRecordings++
        │
        └──> Return Response:
             └─ res.json({
                  recording: { ... },
                  vadAnalysis: {
                    totalDuration: "3:45",
                    actualSpeech: "3:12",
                    silenceRemoved: "0:33",
                    speechPercentage: "85%",
                    trimmed: true,
                    summary: "VAD: 3:12 actual speech (85% of 3:45 total)"
                  }
                })

                        │
                        │ HTTP Response
                        ↓

┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. FRONTEND (Response Handling)                                            │
└─────────────────────────────────────────────────────────────────────────────┘

    ✅ Success Handler
        │
        ├──> Extract vadAnalysis from response
        ├──> Update UI:
        │    ├─ Show success message
        │    ├─ Display VAD summary
        │    └─ Show badges:
        │         ├─ 🎙️ Speech: 3:12
        │         ├─ 📊 Total: 3:45
        │         ├─ ✅ 85% speech
        │         └─ ✂️ Silence trimmed
        │
        └──> Clear recorder & reset state


┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. DATABASE (MongoDB)                                                       │
└─────────────────────────────────────────────────────────────────────────────┘

    📄 Recording Document Stored:

    {
      _id: ObjectId("65abc123..."),
      task: ObjectId("507f1f77..."),
      project: ObjectId("507f1f88..."),
      contributor: ObjectId("507f1f99..."),
      audioUrl: "/uploads/recordings/123_task_1699999999.webm",
      duration: 192,                    // ← Actual speech duration
      fileSize: 1234567,
      format: "audio/webm",
      vadAnalysis: {                    // ← VAD Analysis
        totalDuration: 225,
        actualSpeechDuration: 192,
        totalSilence: 33,
        speechPercentage: 85.33,
        silencePeriods: [
          { start: 0, end: 2.5, duration: 2.5 },
          { start: 120, end: 125, duration: 5 }
        ],
        trimStart: 2.5,
        trimEnd: 222,
        trimmed: true,
        formattedSpeechDuration: "3:12",
        summary: "VAD: 3:12 actual speech (85.33% of 3:45 total)"
      },
      reviewStatus: "pending",
      createdAt: ISODate("2024-11-07T..."),
      updatedAt: ISODate("2024-11-07T...")
    }


┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. REVIEWER DASHBOARD (Review Interface)                                   │
└─────────────────────────────────────────────────────────────────────────────┘

    📋 Recording Review Card:

    ╔═══════════════════════════════════════════════════════════╗
    ║  Recording #123 - "Read this sentence clearly"           ║
    ║  Contributor: student@test.com                           ║
    ╠═══════════════════════════════════════════════════════════╣
    ║                                                           ║
    ║  🎙️ Voice Activity Analysis                             ║
    ║  ┌─────────────────────────────────────────────────────┐ ║
    ║  │ Speech: 3:12    Total: 3:45    Quality: 85% ✅     │ ║
    ║  │ Silence trimmed from recording                     │ ║
    ║  │                                                     │ ║
    ║  │ Summary: VAD: 3:12 actual speech (85% of 3:45)    │ ║
    ║  └─────────────────────────────────────────────────────┘ ║
    ║                                                           ║
    ║  🔊 Audio Player:                                        ║
    ║  [▶ Play] [⏸ Pause] [⏹ Stop]  ━━━●━━━ 1:30 / 3:12     ║
    ║                                                           ║
    ║  ⭐ Quality Score:                                       ║
    ║  Clarity:       ⭐⭐⭐⭐⭐                               ║
    ║  Accuracy:      ⭐⭐⭐⭐☆                               ║
    ║  Pronunciation: ⭐⭐⭐⭐⭐                               ║
    ║                                                           ║
    ║  📝 Review Notes: ________________________________        ║
    ║                                                           ║
    ║  [✅ Approve]  [❌ Reject]  [🔄 Needs Revision]         ║
    ╚═══════════════════════════════════════════════════════════╝


┌─────────────────────────────────────────────────────────────────────────────┐
│ KEY COMPONENTS                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

    🛠️ Technologies Used:

    Frontend:
    ├─ MediaRecorder API ──> Browser audio recording
    ├─ Web Audio API ──────> Waveform visualization
    ├─ Redux Toolkit ──────> State management
    ├─ FormData ───────────> Multipart file upload
    └─ Material-UI ────────> UI components

    Backend:
    ├─ Express.js ─────────> Web server
    ├─ Multer ─────────────> File upload middleware
    ├─ FFmpeg ─────────────> Audio analysis & processing
    ├─ AWS SDK ────────────> S3 cloud storage (optional)
    └─ Mongoose ───────────> MongoDB ODM

    Database:
    └─ MongoDB ────────────> Document storage

    External:
    ├─ FFmpeg (CLI tool) ──> Voice activity detection
    └─ AWS S3 (optional) ──> Cloud file storage


┌─────────────────────────────────────────────────────────────────────────────┐
│ VAD ALGORITHM (FFmpeg)                                                      │
└─────────────────────────────────────────────────────────────────────────────┘

    silencedetect Filter:
    
    Parameters:
    ├─ noise=-30dB     → Threshold for silence (audio below this = silence)
    └─ d=0.5           → Minimum silence duration (0.5 seconds)

    Process:
    1. Analyze audio waveform
    2. Identify periods below -30dB for >0.5s
    3. Mark as silence_start and silence_end
    4. Calculate non-silent periods = speech
    5. Return timestamps and durations

    Example Detection:
    Input: 3:45 audio
    
    Timeline:
    0:00 ─┬─ [Silence: -35dB] ──┬─ 0:02.5
          │                      │
    0:02.5 ─┬─ [Speech: -15dB] ──┬─ 2:00
            │                     │
    2:00 ─┬─ [Pause: -32dB] ───┬─ 2:05
          │                      │
    2:05 ─┬─ [Speech: -18dB] ──┬─ 3:42
          │                      │
    3:42 ─┬─ [Silence: -40dB] ─┬─ 3:45
          │                      │

    Detection Result:
    ├─ Speech periods: 0:02.5-2:00, 2:05-3:42 = 3:12 total
    ├─ Silence periods: 0:00-0:02.5, 2:00-2:05, 3:42-3:45 = 0:33 total
    └─ Speech percentage: (192/225) * 100 = 85.33%


┌─────────────────────────────────────────────────────────────────────────────┐
│ SUMMARY                                                                      │
└─────────────────────────────────────────────────────────────────────────────┘

    ✅ Complete VAD Pipeline:
    
    Browser Recording → File Upload → VAD Analysis → Silence Trim →
    Cloud/Local Storage → Database Save → Response with VAD → UI Display

    🎯 Result:
    "VAD: 3:30 min actual speech (85% of 4:07 total)"

    📊 Benefits:
    ├─ Accurate duration tracking
    ├─ Quality assessment (speech %)
    ├─ Automatic silence removal
    ├─ Storage optimization
    └─ Better user experience
```
