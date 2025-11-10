const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const ParticipantInvite = require('./models/ParticipantInvite');

const debugParticipantsManagement = async () => {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected');

    // Find all participants
    const participants = await User.find({ role: 'participant' });
    console.log(`📋 Found ${participants.length} participants:`);
    
    for (const participant of participants) {
      console.log(`\n👤 Participant: ${participant.name} (${participant.email})`);
      console.log(`   ID: ${participant._id}`);
      console.log(`   Managed By: ${participant.managedBy || 'NOT SET'}`);
      
      if (participant.managedBy) {
        const manager = await User.findById(participant.managedBy);
        console.log(`   Manager: ${manager ? manager.name + ' (' + manager.email + ')' : 'MANAGER NOT FOUND'}`);
      }
    }

    // Find all students and their participants
    console.log('\n\n🎓 Students and their participants:');
    const students = await User.find({ role: 'student' });
    
    for (const student of students) {
      console.log(`\n👨‍🎓 Student: ${student.name} (${student.email})`);
      console.log(`   ID: ${student._id}`);
      
      const managedParticipants = await User.find({ 
        role: 'participant', 
        managedBy: student._id 
      });
      
      console.log(`   Manages ${managedParticipants.length} participants:`);
      managedParticipants.forEach(p => {
        console.log(`     - ${p.name} (${p.email})`);
      });
      
      // Check invitations
      const invites = await ParticipantInvite.find({ studentId: student._id });
      console.log(`   Created ${invites.length} invitations:`);
      invites.forEach(invite => {
        console.log(`     - ${invite.participantData.name} (${invite.participantData.email}) - Status: ${invite.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Database disconnected');
    process.exit(0);
  }
};

debugParticipantsManagement();