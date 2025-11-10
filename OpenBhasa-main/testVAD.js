const { detectVoiceActivity, formatDuration } = require('./middleware/vadMiddleware');
const path = require('path');

/**
 * Test script for VAD functionality
 * Place a test audio file in the same directory and run: node testVAD.js your-audio-file.wav
 */

async function testVAD() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('❌ Please provide an audio file path as argument');
    console.log('Usage: node testVAD.js <path-to-audio-file>');
    console.log('Example: node testVAD.js ./test-recording.wav');
    process.exit(1);
  }

  const audioPath = path.resolve(args[0]);
  
  console.log('🎙️ Testing VAD on:', audioPath);
  console.log('⏳ Analyzing audio... (this may take a few seconds)\n');

  try {
    const vadAnalysis = await detectVoiceActivity(audioPath);
    
    console.log('✅ VAD Analysis Complete!\n');
    console.log('═══════════════════════════════════════');
    console.log('📊 VOICE ACTIVITY DETECTION RESULTS');
    console.log('═══════════════════════════════════════\n');
    
    console.log('⏱️  Duration Analysis:');
    console.log(`   Total Duration:    ${formatDuration(vadAnalysis.totalDuration)} (${vadAnalysis.totalDuration}s)`);
    console.log(`   Actual Speech:     ${formatDuration(vadAnalysis.actualSpeechDuration)} (${vadAnalysis.actualSpeechDuration}s)`);
    console.log(`   Total Silence:     ${formatDuration(vadAnalysis.totalSilence)} (${vadAnalysis.totalSilence}s)`);
    console.log(`   Speech Percentage: ${vadAnalysis.speechPercentage}%\n`);
    
    console.log('✂️  Trimming Info:');
    console.log(`   Trim from Start:   ${vadAnalysis.trimStart}s`);
    console.log(`   Trim from End:     ${vadAnalysis.totalDuration - vadAnalysis.trimEnd}s`);
    console.log(`   Should Trim:       ${vadAnalysis.shouldTrim ? 'Yes ✓' : 'No ✗'}\n`);
    
    if (vadAnalysis.silencePeriods.length > 0) {
      console.log(`🔇 Silence Periods Detected: ${vadAnalysis.silencePeriods.length}`);
      vadAnalysis.silencePeriods.forEach((period, index) => {
        console.log(`   ${index + 1}. ${period.start}s - ${period.end}s (${period.duration}s)`);
      });
      console.log();
    }
    
    console.log('📝 Summary:');
    console.log(`   "${vadAnalysis.summary || `VAD: ${formatDuration(vadAnalysis.actualSpeechDuration)} actual speech (${vadAnalysis.speechPercentage}% of ${formatDuration(vadAnalysis.totalDuration)} total)`}"\n`);
    
    console.log('═══════════════════════════════════════\n');
    
    // Quality assessment
    if (vadAnalysis.speechPercentage >= 80) {
      console.log('🎉 EXCELLENT: High speech content (>80%)');
    } else if (vadAnalysis.speechPercentage >= 60) {
      console.log('✅ GOOD: Decent speech content (60-80%)');
    } else if (vadAnalysis.speechPercentage >= 40) {
      console.log('⚠️  FAIR: Moderate speech content (40-60%)');
    } else {
      console.log('❌ POOR: Low speech content (<40%)');
    }
    
  } catch (error) {
    console.error('❌ VAD Analysis Failed:', error.message);
    console.error('\n🔍 Common issues:');
    console.error('   1. FFmpeg not installed (run: ffmpeg -version)');
    console.error('   2. Invalid audio file format');
    console.error('   3. File path incorrect');
    console.error('   4. File corrupted or empty\n');
    process.exit(1);
  }
}

// Run test
testVAD();
