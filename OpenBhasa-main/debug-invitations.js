// Debug invitations utility  
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/openbhasha', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const ParticipantInvite = require('./models/ParticipantInvite');

async function debugInvitations() {
  try {
    console.log('🔍 Finding all participant invitations...');
    
    const invitations = await ParticipantInvite.find({});
    console.log(`📊 Found ${invitations.length} invitations`);
    
    for (const invite of invitations) {
      console.log('\n--- Invitation Debug ---');
      console.log('Token:', invite.token);
      console.log('Status:', invite.status);
      console.log('Participant name:', invite.participantData.name);
      console.log('Participant email:', invite.participantData.email);
      console.log('Created at:', invite.createdAt);
      console.log('Expires at:', invite.expiresAt);
      console.log('Accepted at:', invite.acceptedAt);
      console.log('Participant ID:', invite.participantId);
      console.log('Is expired (method):', invite.isExpired());
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

debugInvitations();