# M4A Audio Format & File Size Guide

## 📊 M4A File Size Calculator

### 15-Minute Recording Sizes

| Quality Level | Bitrate | File Size (15 min) | Use Case |
|--------------|---------|-------------------|----------|
| **Low** | 64 kbps | ~7 MB | Voice-only, minimal quality |
| **Standard** | 128 kbps | ~14 MB | ⭐ **Recommended** - Good voice quality |
| **High** | 192 kbps | ~22 MB | High-quality voice, music |
| **Very High** | 256 kbps | ~29 MB | Professional quality |
| **Maximum** | 320 kbps | ~36 MB | Studio quality |

### Quick Formula

```
File Size (MB) = (Bitrate in kbps × Duration in seconds) / 8192

Example (15 min @ 128 kbps):
= (128 × 900) / 8192
= 115,200 / 8192
= ~14 MB
```

---

## 🎙️ M4A Format Details

### What is M4A?

**M4A** = MPEG-4 Audio (AAC codec)
- **Codec**: AAC (Advanced Audio Coding)
- **Container**: MP4
- **Compression**: Lossy (like MP3, but better quality at same bitrate)
- **File Extension**: `.m4a`

### Why M4A for Voice Recording?

✅ **Better compression** than MP3 (smaller files, same quality)  
✅ **Excellent voice quality** at 128 kbps  
✅ **Native support** in iOS/macOS  
✅ **Browser compatible** with MediaRecorder API  
✅ **FFmpeg compatible** for VAD processing  

---

## 📁 File Size by Duration

### At 128 kbps (Recommended):

| Duration | File Size |
|----------|-----------|
| 1 minute | ~1 MB |
| 3 minutes | ~3 MB |
| 5 minutes | ~5 MB |
| 10 minutes | ~10 MB |
| **15 minutes** | **~14 MB** |
| 30 minutes | ~29 MB |
| 60 minutes | ~58 MB |

### At Different Bitrates (15 minutes):

| Bitrate | Quality | Size |
|---------|---------|------|
| 64 kbps | Low | 7 MB |
| 96 kbps | Medium | 11 MB |
| 128 kbps | Standard ⭐ | 14 MB |
| 192 kbps | High | 22 MB |
| 256 kbps | Very High | 29 MB |
| 320 kbps | Maximum | 36 MB |

---

## 🎚️ Recommended Settings for OpenBhasa

### Voice Recording (Speech Only)

```javascript
// Browser MediaRecorder settings
const options = {
  mimeType: 'audio/mp4;codecs=mp4a.40.2', // M4A with AAC
  audioBitsPerSecond: 128000 // 128 kbps
};

const mediaRecorder = new MediaRecorder(stream, options);
```

**Result:**
- 15-minute recording = ~14 MB
- Good voice clarity
- Small file size
- Perfect for speech collection

---

## 🔧 Backend Configuration

### Current Limits (Already Updated)

**File: `controllers/recordingControllerWithVAD.js`**

```javascript
const upload = multer({
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'audio/webm',
      'audio/wav',
      'audio/mp3',
      'audio/m4a',      // ✅ M4A support added
      'audio/mp4',      // ✅ Alternative MIME
      'audio/x-m4a'     // ✅ Alternative MIME
    ];
    // ...
  }
});
```

**Supported:**
- ✅ 15-min @ 320 kbps (36 MB) - fits within 50 MB limit
- ✅ 20-min @ 256 kbps (38 MB) - fits within 50 MB limit
- ✅ 30-min @ 128 kbps (29 MB) - fits within 50 MB limit

---

## 🌐 Frontend Configuration

### Update AudioRecorder.jsx

```jsx
// Check if M4A is supported
const getSupportedMimeType = () => {
  const types = [
    'audio/mp4;codecs=mp4a.40.2',  // M4A with AAC
    'audio/webm;codecs=opus',      // WebM fallback
    'audio/webm',                   // WebM simple
  ];
  
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return '';
};

// Use in MediaRecorder
const handleStartRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 44100,
    },
  });

  const mimeType = getSupportedMimeType();
  const options = {
    mimeType,
    audioBitsPerSecond: 128000, // 128 kbps for 15-min = ~14 MB
  };

  const mediaRecorder = new MediaRecorder(stream, options);
  // ... rest of recording logic
};
```

---

## 📊 Storage Planning

### For 1,000 Recordings (15 min each @ 128 kbps):

- **File Size**: 1,000 × 14 MB = **14 GB**
- **With VAD trimming** (avg 85% speech): 1,000 × 12 MB = **12 GB**

### For 10,000 Recordings:

- **File Size**: 10,000 × 14 MB = **140 GB**
- **With VAD trimming**: 10,000 × 12 MB = **120 GB**

### Storage Cost Estimation (AWS S3):

| Recordings | Size (VAD) | S3 Cost/month |
|-----------|-----------|---------------|
| 1,000 | 12 GB | ~$0.28 |
| 10,000 | 120 GB | ~$2.76 |
| 100,000 | 1.2 TB | ~$27.60 |

*(Based on S3 Standard storage at $0.023/GB/month)*

---

## 🎯 Quality Comparison

### M4A vs Other Formats (15 minutes)

| Format | Bitrate | Size | Quality | Notes |
|--------|---------|------|---------|-------|
| **M4A** | 128 kbps | 14 MB | ⭐⭐⭐⭐ | Best balance |
| WebM | 128 kbps | 15 MB | ⭐⭐⭐⭐ | Slightly larger |
| MP3 | 128 kbps | 14 MB | ⭐⭐⭐ | Lower quality than M4A |
| WAV | Uncompressed | 154 MB | ⭐⭐⭐⭐⭐ | Too large |

**Winner: M4A @ 128 kbps** - Best quality-to-size ratio for voice

---

## 🔍 FFmpeg M4A Support

FFmpeg handles M4A natively:

```bash
# Test M4A detection
ffmpeg -i recording.m4a 2>&1 | findstr "Duration"

# VAD on M4A
ffmpeg -i recording.m4a -af silencedetect=noise=-30dB:d=0.5 -f null - 2>&1

# Convert to M4A
ffmpeg -i input.wav -c:a aac -b:a 128k output.m4a
```

All VAD middleware functions work with M4A! ✅

---

## 🚀 Browser Compatibility

### M4A MediaRecorder Support:

| Browser | M4A Support | Notes |
|---------|-------------|-------|
| **Safari** | ✅ Yes | Native, preferred format |
| **Chrome** | ✅ Yes | Via mp4a.40.2 codec |
| **Firefox** | ⚠️ Partial | May need WebM fallback |
| **Edge** | ✅ Yes | Chromium-based |
| **Mobile Safari** | ✅ Yes | Best support |
| **Chrome Mobile** | ✅ Yes | Good support |

### Detection Code:

```javascript
// Check M4A support
const isM4ASupported = MediaRecorder.isTypeSupported('audio/mp4;codecs=mp4a.40.2');
console.log('M4A supported:', isM4ASupported);
```

---

## 💡 Recommendations

### For OpenBhasa Voice Collection:

1. **Primary Format**: M4A @ 128 kbps
   - 15 minutes = ~14 MB
   - Excellent voice quality
   - Good compression

2. **Fallback Format**: WebM @ 128 kbps
   - For browsers without M4A support
   - Similar size and quality

3. **File Size Limit**: 50 MB
   - Supports up to 30 minutes @ 128 kbps
   - Or 15 minutes @ 256 kbps

4. **VAD Processing**: Enabled
   - Removes ~15% silence on average
   - Final size: ~12 MB for 15 min recording

---

## 📱 Mobile Considerations

### iOS/Safari:
- **Default**: Records in M4A
- **Quality**: Excellent (native AAC encoder)
- **Size**: As configured (128 kbps = 14 MB/15 min)

### Android/Chrome:
- **Default**: May use WebM or M4A
- **Quality**: Good (depends on codec)
- **Size**: Similar to iOS

### Network Upload Time (4G):

| File Size | Upload Time (10 Mbps) |
|-----------|---------------------|
| 14 MB (15 min @ 128 kbps) | ~11 seconds |
| 29 MB (15 min @ 256 kbps) | ~23 seconds |

---

## 🔧 Adjust Settings for Different Use Cases

### Case 1: Minimize File Size (Voice only)

```javascript
audioBitsPerSecond: 64000 // 64 kbps
// 15 minutes = ~7 MB
```

### Case 2: Balance Quality & Size (Recommended)

```javascript
audioBitsPerSecond: 128000 // 128 kbps
// 15 minutes = ~14 MB ⭐
```

### Case 3: Maximum Quality (Music/Professional)

```javascript
audioBitsPerSecond: 256000 // 256 kbps
// 15 minutes = ~29 MB
```

---

## 📊 File Size Calculator Tool

### JavaScript Function:

```javascript
/**
 * Calculate M4A file size
 * @param {number} durationMinutes - Recording duration in minutes
 * @param {number} bitrate - Bitrate in kbps (e.g., 128)
 * @returns {number} - File size in MB
 */
function calculateM4ASize(durationMinutes, bitrate = 128) {
  const durationSeconds = durationMinutes * 60;
  const fileSizeBytes = (bitrate * 1000 * durationSeconds) / 8;
  const fileSizeMB = fileSizeBytes / (1024 * 1024);
  return Math.round(fileSizeMB * 10) / 10; // Round to 1 decimal
}

// Examples:
console.log(calculateM4ASize(15, 128)); // 14.1 MB
console.log(calculateM4ASize(15, 256)); // 28.1 MB
console.log(calculateM4ASize(30, 128)); // 28.1 MB
```

---

## ✅ Summary for OpenBhasa

### 15-Minute M4A Recording:

| Setting | Value |
|---------|-------|
| **Format** | M4A (AAC codec) |
| **Bitrate** | 128 kbps (recommended) |
| **File Size** | ~14 MB |
| **After VAD** | ~12 MB (85% speech) |
| **Quality** | Excellent for voice |
| **Limit** | 50 MB (supports up to 30 min) |

### Configuration Status:

✅ Backend supports M4A  
✅ File size limit: 50 MB  
✅ VAD processes M4A  
✅ FFmpeg compatible  
✅ Browser compatible  

### Storage Estimate (1,000 users, 10 recordings each):

- **Total recordings**: 10,000
- **Average size**: 12 MB (after VAD)
- **Total storage**: 120 GB
- **AWS S3 cost**: ~$2.76/month

---

**Your platform is ready to handle M4A recordings up to 15 minutes!** 🎉

**File size for 15 min @ 128 kbps: ~14 MB** (After VAD trimming: ~12 MB)
