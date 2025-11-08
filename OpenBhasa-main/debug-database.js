// Database debug utility  
const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔗 MongoDB URI:', process.env.MONGODB_URI);

const User = require('./models/User');
const ParticipantInvite = require('./models/ParticipantInvite');

async function debugDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/openbhasha', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to database:', mongoose.connection.db.databaseName);
    console.log('📊 Checking all collections...');
    
    // Check users
    const totalUsers = await User.countDocuments({});
    const studentUsers = await User.countDocuments({ role: 'student' });
    const participantUsers = await User.countDocuments({ role: 'participant' });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    console.log(`👥 Total users: ${totalUsers}`);
    console.log(`🎓 Students: ${studentUsers}`);
    console.log(`👤 Participants: ${participantUsers}`);
    console.log(`🔐 Admins: ${adminUsers}`);
    
    // Check invitations
    const totalInvites = await ParticipantInvite.countDocuments({});
    const pendingInvites = await ParticipantInvite.countDocuments({ status: 'pending' });
    const acceptedInvites = await ParticipantInvite.countDocuments({ status: 'accepted' });
    
    console.log(`📬 Total invitations: ${totalInvites}`);
    console.log(`⏳ Pending invitations: ${pendingInvites}`);
    console.log(`✅ Accepted invitations: ${acceptedInvites}`);
    
    // Show some sample data
    if (studentUsers > 0) {
      console.log('\n📋 Sample students:');
      const students = await User.find({ role: 'student' }).limit(3);
      students.forEach(student => {
        console.log(`  - ${student.name} (${student.email})`);
      });
    }
    
    if (totalInvites > 0) {
      console.log('\n📋 Sample invitations:');
      const invites = await ParticipantInvite.find({}).limit(3);
      invites.forEach(invite => {
        console.log(`  - ${invite.participantData.name} (${invite.participantData.email}) - ${invite.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

debugDatabase();