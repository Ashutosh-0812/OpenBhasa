// Password reset utility for participants
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function resetParticipantPassword(email, newPassword) {
  try {
    console.log(`🔄 Resetting password for ${email}`);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Find participant
    const participant = await User.findOne({ email, role: 'participant' });
    if (!participant) {
      console.log('❌ Participant not found');
      return;
    }

    console.log('✅ Found participant:', participant.name);
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    console.log('🔐 New password hash:', hashedPassword);
    
    // Update password directly (bypassing pre-save hook)
    await User.updateOne(
      { _id: participant._id },
      { password: hashedPassword }
    );
    
    console.log('✅ Password updated successfully!');
    console.log(`📝 You can now login with:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

// Usage: node reset-password.js email@example.com NewPassword123
const args = process.argv.slice(2);
if (args.length >= 2) {
  resetParticipantPassword(args[0], args[1]);
} else {
  console.log('Usage: node reset-password.js email@example.com NewPassword123');
  console.log('Available participants:');
  console.log('  - sharmaujjwal2024@gmail.com (Anjal patidar)');  
  console.log('  - vivek@gandi.chutka (vikas)');
}