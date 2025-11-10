const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const ParticipantInvite = require('./models/ParticipantInvite');

const fixParticipantsManagement = async () => {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected');

    // Find participants without managedBy set
    const participantsWithoutManager = await User.find({ 
      role: 'participant',
      $or: [
        { managedBy: { $exists: false } },
        { managedBy: null }
      ]
    });

    console.log(`📋 Found ${participantsWithoutManager.length} participants without manager:`);
    
    for (const participant of participantsWithoutManager) {
      console.log(`\n👤 Fixing participant: ${participant.name} (${participant.email})`);
      
      // Find the invitation that created this participant
      const invite = await ParticipantInvite.findOne({
        'participantData.email': participant.email,
        status: 'accepted',
        participantId: participant._id
      });

      if (invite) {
        console.log(`   Found matching invitation from student: ${invite.studentId}`);
        
        // Update participant with managedBy field
        await User.findByIdAndUpdate(participant._id, {
          managedBy: invite.studentId,
          isVerified: true
        });
        
        // Add participant to student's participants array
        await User.findByIdAndUpdate(invite.studentId, {
          $addToSet: { participants: participant._id }
        });
        
        console.log('   ✅ Fixed management relationship');
      } else {
        console.log('   ❌ No matching invitation found - cannot determine manager');
      }
    }

    console.log('\n🔍 Verification - checking all participants after fix:');
    const allParticipants = await User.find({ role: 'participant' });
    
    for (const participant of allParticipants) {
      console.log(`\n👤 ${participant.name} (${participant.email})`);
      if (participant.managedBy) {
        const manager = await User.findById(participant.managedBy);
        console.log(`   ✅ Managed by: ${manager ? manager.name + ' (' + manager.email + ')' : 'MANAGER NOT FOUND'}`);
      } else {
        console.log('   ❌ Still no manager assigned');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Database disconnected');
    process.exit(0);
  }
};

fixParticipantsManagement();