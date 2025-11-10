const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const execAsync = promisify(exec);

/**
 * VAD (Voice Activity Detection) Middleware
 * Detects silence, trims audio, and calculates actual speech duration
 * Uses ffmpeg for audio analysis and processing
 */

/**
 * Detect silence in audio file using ffmpeg
 * @param {string} audioPath - Path to audio file
 * @returns {Object} - VAD analysis results
 */
async function detectVoiceActivity(audioPath) {
  try {
    // Get total duration of audio
    const durationCmd = `ffmpeg -i "${audioPath}" 2>&1 | findstr /r "Duration"`;
    const { stdout: durationOutput } = await execAsync(durationCmd);
    
    const durationMatch = durationOutput.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
    let totalDuration = 0;
    
    if (durationMatch) {
      const hours = parseInt(durationMatch[1]);
      const minutes = parseInt(durationMatch[2]);
      const seconds = parseFloat(durationMatch[3]);
      totalDuration = hours * 3600 + minutes * 60 + seconds;
    }

    // Detect silence periods using ffmpeg silencedetect filter
    // silence_start, silence_duration, silence_end
    const silenceCmd = `ffmpeg -i "${audioPath}" -af silencedetect=noise=-30dB:d=0.5 -f null - 2>&1`;
    const { stdout: silenceOutput } = await execAsync(silenceCmd);

    // Parse silence periods
    const silenceStarts = [];
    const silenceEnds = [];
    
    const startMatches = silenceOutput.matchAll(/silence_start: ([\d.]+)/g);
    for (const match of startMatches) {
      silenceStarts.push(parseFloat(match[1]));
    }
    
    const endMatches = silenceOutput.matchAll(/silence_end: ([\d.]+)/g);
    for (const match of endMatches) {
      silenceEnds.push(parseFloat(match[1]));
    }

    // Calculate total silence duration
    let totalSilence = 0;
    for (let i = 0; i < Math.min(silenceStarts.length, silenceEnds.length); i++) {
      totalSilence += silenceEnds[i] - silenceStarts[i];
    }

    // Calculate actual speech duration (total - silence)
    const actualSpeechDuration = Math.max(0, totalDuration - totalSilence);

    // Calculate speech percentage
    const speechPercentage = totalDuration > 0 ? (actualSpeechDuration / totalDuration) * 100 : 0;

    // Determine start and end trim points
    const trimStart = silenceEnds.length > 0 && silenceStarts[0] === 0 ? silenceEnds[0] : 0;
    const trimEnd = silenceStarts.length > 0 && 
                    silenceStarts[silenceStarts.length - 1] > totalDuration - 2 
                    ? silenceStarts[silenceStarts.length - 1] 
                    : totalDuration;

    return {
      totalDuration: parseFloat(totalDuration.toFixed(2)),
      actualSpeechDuration: parseFloat(actualSpeechDuration.toFixed(2)),
      totalSilence: parseFloat(totalSilence.toFixed(2)),
      speechPercentage: parseFloat(speechPercentage.toFixed(2)),
      silencePeriods: silenceStarts.map((start, i) => ({
        start: parseFloat(start.toFixed(2)),
        end: silenceEnds[i] ? parseFloat(silenceEnds[i].toFixed(2)) : null,
        duration: silenceEnds[i] ? parseFloat((silenceEnds[i] - start).toFixed(2)) : null
      })).filter(p => p.end !== null),
      trimStart: parseFloat(trimStart.toFixed(2)),
      trimEnd: parseFloat(trimEnd.toFixed(2)),
      shouldTrim: trimStart > 0.5 || (totalDuration - trimEnd) > 0.5
    };
  } catch (error) {
    console.error('VAD detection error:', error);
    throw new Error(`Voice activity detection failed: ${error.message}`);
  }
}

/**
 * Trim silence from audio file
 * @param {string} inputPath - Input audio file path
 * @param {string} outputPath - Output audio file path
 * @param {number} trimStart - Start time to trim from
 * @param {number} trimEnd - End time to trim to
 * @returns {Object} - Trimmed audio info
 */
async function trimSilence(inputPath, outputPath, trimStart, trimEnd) {
  try {
    const duration = trimEnd - trimStart;
    
    // Trim audio using ffmpeg
    const trimCmd = `ffmpeg -i "${inputPath}" -ss ${trimStart} -t ${duration} -c:a libopus -b:a 128k "${outputPath}" -y`;
    await execAsync(trimCmd);

    // Get file size
    const stats = await fs.stat(outputPath);

    return {
      path: outputPath,
      size: stats.size,
      duration: parseFloat(duration.toFixed(2)),
      trimmedStart: parseFloat(trimStart.toFixed(2)),
      trimmedEnd: parseFloat((trimEnd - duration).toFixed(2))
    };
  } catch (error) {
    console.error('Audio trimming error:', error);
    throw new Error(`Failed to trim audio: ${error.message}`);
  }
}

/**
 * Format duration to human-readable string (MM:SS)
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration
 */
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Express middleware for VAD processing
 * Processes uploaded audio file and attaches VAD analysis to req
 */
const vadMiddleware = async (req, res, next) => {
  try {
    // Check if audio file exists in request
    if (!req.file) {
      return next(); // Skip if no file
    }

    console.log('🎙️ Starting VAD analysis...');

    const audioFile = req.file;
    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `input_${Date.now()}_${audioFile.originalname}`);
    const outputPath = path.join(tempDir, `trimmed_${Date.now()}_${audioFile.originalname}`);

    // Save uploaded file temporarily
    await fs.writeFile(inputPath, audioFile.buffer);

    // Detect voice activity
    const vadAnalysis = await detectVoiceActivity(inputPath);

    console.log(`📊 VAD Analysis Complete:
      - Total Duration: ${formatDuration(vadAnalysis.totalDuration)} (${vadAnalysis.totalDuration}s)
      - Actual Speech: ${formatDuration(vadAnalysis.actualSpeechDuration)} (${vadAnalysis.actualSpeechDuration}s)
      - Silence Removed: ${formatDuration(vadAnalysis.totalSilence)} (${vadAnalysis.totalSilence}s)
      - Speech: ${vadAnalysis.speechPercentage}%
    `);

    // Trim silence if needed
    let trimmedAudio = null;
    if (vadAnalysis.shouldTrim && vadAnalysis.actualSpeechDuration > 1) {
      console.log('✂️ Trimming silence from audio...');
      trimmedAudio = await trimSilence(
        inputPath,
        outputPath,
        vadAnalysis.trimStart,
        vadAnalysis.trimEnd
      );

      // Replace original file buffer with trimmed audio
      const trimmedBuffer = await fs.readFile(outputPath);
      req.file.buffer = trimmedBuffer;
      req.file.size = trimmedBuffer.length;

      console.log(`✅ Audio trimmed successfully! New duration: ${formatDuration(trimmedAudio.duration)}`);
    } else {
      console.log('ℹ️ No trimming needed or audio too short');
    }

    // Attach VAD analysis to request object
    req.vadAnalysis = {
      ...vadAnalysis,
      trimmed: trimmedAudio !== null,
      trimmedAudio,
      formattedDuration: formatDuration(vadAnalysis.totalDuration),
      formattedSpeechDuration: formatDuration(vadAnalysis.actualSpeechDuration),
      formattedSilence: formatDuration(vadAnalysis.totalSilence),
      summary: `VAD: ${formatDuration(vadAnalysis.actualSpeechDuration)} actual speech (${vadAnalysis.speechPercentage}% of ${formatDuration(vadAnalysis.totalDuration)} total)`
    };

    // Cleanup temporary files
    await fs.unlink(inputPath).catch(() => {});
    if (trimmedAudio) {
      await fs.unlink(outputPath).catch(() => {});
    }

    next();
  } catch (error) {
    console.error('❌ VAD Middleware Error:', error);
    
    // Continue without VAD analysis if it fails
    req.vadAnalysis = {
      error: true,
      message: error.message,
      totalDuration: 0,
      actualSpeechDuration: 0,
      summary: 'VAD analysis failed'
    };
    
    next();
  }
};

module.exports = {
  vadMiddleware,
  detectVoiceActivity,
  trimSilence,
  formatDuration
};
