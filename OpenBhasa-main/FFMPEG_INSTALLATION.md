# FFmpeg Installation Guide for VAD

## Why FFmpeg?

The VAD (Voice Activity Detection) feature uses **FFmpeg** to:
- Analyze audio waveforms
- Detect silence periods
- Calculate speech duration
- Trim silence from recordings

## Installation by Platform

### 🪟 Windows

#### Option 1: Chocolatey (Recommended)

**Step 1:** Open PowerShell as **Administrator**

**Step 2:** Install Chocolatey (if not installed):
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

**Step 3:** Install FFmpeg:
```powershell
choco install ffmpeg
```

**Step 4:** Verify:
```powershell
ffmpeg -version
```

---

#### Option 2: Manual Installation

**Step 1:** Download FFmpeg
- Go to: https://www.gyan.dev/ffmpeg/builds/
- Download: `ffmpeg-release-essentials.zip`

**Step 2:** Extract
- Extract to: `C:\ffmpeg\`
- Should have: `C:\ffmpeg\bin\ffmpeg.exe`

**Step 3:** Add to PATH
1. Press `Win + X` → System
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "System variables", find "Path"
5. Click "Edit" → "New"
6. Add: `C:\ffmpeg\bin`
7. Click "OK" on all dialogs

**Step 4:** Restart Terminal and Verify
```powershell
ffmpeg -version
```

---

### 🍎 macOS

#### Using Homebrew (Recommended)

**Step 1:** Install Homebrew (if not installed):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Step 2:** Install FFmpeg:
```bash
brew install ffmpeg
```

**Step 3:** Verify:
```bash
ffmpeg -version
```

---

### 🐧 Linux

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install ffmpeg
ffmpeg -version
```

#### Fedora/RHEL

```bash
sudo dnf install ffmpeg
ffmpeg -version
```

#### Arch Linux

```bash
sudo pacman -S ffmpeg
ffmpeg -version
```

---

## Verification

After installation, run:

```bash
ffmpeg -version
```

**Expected Output:**
```
ffmpeg version 6.0 Copyright (c) 2000-2023 the FFmpeg developers
built with gcc 12.2.0 (GCC)
configuration: ...
libavutil      58.  2.100 / 58.  2.100
libavcodec     60.  3.100 / 60.  3.100
...
```

If you see this, **FFmpeg is installed correctly!** ✅

---

## Test FFmpeg with Audio Analysis

### Test Silence Detection

```bash
# Create a test audio (silent for 2 seconds, then beep)
ffmpeg -f lavfi -i "anullsrc=r=44100:cl=mono:d=2" -f lavfi -i "sine=f=1000:d=1" -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1" test-audio.wav

# Detect silence
ffmpeg -i test-audio.wav -af silencedetect=noise=-30dB:d=0.5 -f null - 2>&1 | findstr "silence"
```

**Expected Output:**
```
[silencedetect @ ...] silence_start: 0
[silencedetect @ ...] silence_end: 2.0 | silence_duration: 2.0
```

---

## Troubleshooting

### Windows: "ffmpeg is not recognized"

**Cause:** FFmpeg not in PATH or terminal not restarted

**Fix:**
1. Check installation: `where ffmpeg`
2. Verify PATH includes FFmpeg bin directory
3. Restart PowerShell/CMD/VS Code
4. Try: `C:\ffmpeg\bin\ffmpeg.exe -version` (absolute path)

---

### macOS: "command not found: ffmpeg"

**Cause:** Homebrew not installed or FFmpeg not installed

**Fix:**
```bash
# Check Homebrew
brew --version

# If not installed:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install FFmpeg
brew install ffmpeg

# Verify
ffmpeg -version
```

---

### Linux: "Package ffmpeg has no installation candidate"

**Cause:** FFmpeg not in default repos

**Fix (Ubuntu):**
```bash
# Add universe repository
sudo add-apt-repository universe
sudo apt update
sudo apt install ffmpeg
```

**Alternative (Build from source):**
```bash
# Download and compile
git clone https://git.ffmpeg.org/ffmpeg.git ffmpeg
cd ffmpeg
./configure
make
sudo make install
```

---

## Testing VAD After Installation

### Test 1: Command Line

```bash
# Go to project directory
cd d:\BoloIntern\OpenBhasa\OpenBhasa-main

# Test with audio file
node testVAD.js path/to/audio.wav
```

**Expected:**
```
🎙️ Testing VAD on: audio.wav
⏳ Analyzing audio...

✅ VAD Analysis Complete!
📊 VOICE ACTIVITY DETECTION RESULTS
...
```

### Test 2: API

```bash
# Start server
npm run dev

# Upload recording
curl -X POST http://localhost:5000/api/recordings/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "audio=@test.wav" \
  -F "taskId=507f1f77bcf86cd799439011"
```

**Expected:**
```json
{
  "vadAnalysis": {
    "summary": "VAD: 3:30 actual speech (85% of 4:07 total)"
  }
}
```

---

## Common Issues

### Issue: FFmpeg installed but VAD fails

**Symptoms:**
```
❌ VAD Analysis Failed: Voice activity detection failed: Command failed
```

**Possible Causes:**
1. Audio file corrupted
2. Unsupported format
3. FFmpeg version too old

**Fix:**
```bash
# Check FFmpeg version (need 4.0+)
ffmpeg -version

# Test with simple audio
ffmpeg -i test.wav -af silencedetect=noise=-30dB:d=0.5 -f null - 2>&1
```

### Issue: "Permission denied" on Linux/macOS

**Fix:**
```bash
sudo chmod +x /usr/local/bin/ffmpeg
```

---

## Production Deployment

### Render.com

Add to `render.yaml`:
```yaml
services:
  - type: web
    name: openbhasa-backend
    buildCommand: |
      apt-get update
      apt-get install -y ffmpeg
      npm install
    startCommand: npm start
```

### Heroku

Add `Aptfile`:
```
ffmpeg
```

Add buildpack:
```bash
heroku buildpacks:add --index 1 heroku-community/apt
```

### Docker

```dockerfile
FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
```

### AWS EC2 / DigitalOcean

```bash
# SSH into server
ssh user@server

# Install FFmpeg
sudo apt update
sudo apt install -y ffmpeg

# Verify
ffmpeg -version
```

---

## Summary

### Installation Commands

| Platform | Command |
|----------|---------|
| Windows (Choco) | `choco install ffmpeg` |
| Windows (Manual) | Download + Add to PATH |
| macOS | `brew install ffmpeg` |
| Ubuntu/Debian | `sudo apt install ffmpeg` |
| Fedora | `sudo dnf install ffmpeg` |

### Verification

```bash
ffmpeg -version  # Should show version info
```

### Test VAD

```bash
node testVAD.js audio.wav
```

---

## Next Steps

After installing FFmpeg:

1. ✅ Restart terminal/IDE
2. ✅ Verify: `ffmpeg -version`
3. ✅ Test: `node testVAD.js audio.wav`
4. ✅ Start backend: `npm run dev`
5. ✅ Upload recording and check VAD analysis

---

**FFmpeg Installation Complete!** 🎉

Your VAD feature is now ready to use.

---

**Need Help?**
- FFmpeg Documentation: https://ffmpeg.org/documentation.html
- Windows Installation: https://www.wikihow.com/Install-FFmpeg-on-Windows
- macOS Installation: https://formulae.brew.sh/formula/ffmpeg
- Linux Installation: https://ffmpeg.org/download.html#build-linux
