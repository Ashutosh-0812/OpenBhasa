// Password debugging utility
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/openbhasha', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/User');

async function debugParticipantPasswords() {
  try {
    console.log('🔍 Finding all participant accounts...');
    
    const participants = await User.find({ role: 'participant' });
    console.log(`📊 Found ${participants.length} participant accounts`);
    
    for (const participant of participants) {
      console.log('\n--- Participant Debug ---');
      console.log('Name:', participant.name);
      console.log('Email:', participant.email);
      console.log('Password hash length:', participant.password?.length);
      console.log('Hash starts with:', participant.password?.substring(0, 10));
      console.log('Is bcrypt hash?', participant.password?.startsWith('$2b$'));
      console.log('Created at:', participant.createdAt);
      console.log('Updated at:', participant.updatedAt);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

async function testPasswordComparison(email, testPassword) {
  try {
    console.log(`\n🧪 Testing password comparison for ${email}`);
    
    const participant = await User.findOne({ email, role: 'participant' });
    if (!participant) {
      console.log('❌ Participant not found');
      return;
    }
    
    console.log('✅ Participant found:', participant.name);
    console.log('Stored hash:', participant.password);
    console.log('Test password:', testPassword);
    
    // Test using model method
    const modelResult = await participant.comparePassword(testPassword);
    console.log('Model comparePassword result:', modelResult);
    
    // Test using direct bcryptjs
    const directResult = await bcrypt.compare(testPassword, participant.password);
    console.log('Direct bcryptjs result:', directResult);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

// Run the debug
const args = process.argv.slice(2);
if (args.length >= 2) {
  // Test specific password: node debug-passwords.js email@example.com testPassword123
  testPasswordComparison(args[0], args[1]);
} else {
  // Debug all participants: node debug-passwords.js
  debugParticipantPasswords();
}