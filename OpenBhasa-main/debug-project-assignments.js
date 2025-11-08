const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Project = require('./models/Project');

const checkProjectAssignments = async () => {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected');

    // Find all projects
    const projects = await Project.find()
      .populate('assignedUsers', 'name email role')
      .populate('createdBy', 'name email role');

    console.log(`\n📋 Found ${projects.length} projects:`);
    
    for (const project of projects) {
      console.log(`\n📂 Project: ${project.title}`);
      console.log(`   ID: ${project._id}`);
      console.log(`   Created by: ${project.createdBy?.name} (${project.createdBy?.email})`);
      console.log(`   Status: ${project.status}`);
      console.log(`   Assigned Users (${project.assignedUsers.length}):`);
      
      if (project.assignedUsers.length === 0) {
        console.log('     ❌ No users assigned to this project');
      } else {
        project.assignedUsers.forEach(user => {
          console.log(`     - ${user.name} (${user.email}) - Role: ${user.role}`);
        });
      }
    }

    // Find participants and check which projects they should see
    const participants = await User.find({ role: 'participant' });
    
    console.log(`\n👥 Checking participant project visibility:`);
    
    for (const participant of participants) {
      console.log(`\n👤 Participant: ${participant.name} (${participant.email})`);
      console.log(`   ID: ${participant._id}`);
      
      // Find projects assigned to this participant
      const assignedProjects = await Project.find({ 
        assignedUsers: participant._id 
      }).select('title status');
      
      console.log(`   Assigned Projects (${assignedProjects.length}):`);
      if (assignedProjects.length === 0) {
        console.log('     ❌ No projects assigned to this participant');
      } else {
        assignedProjects.forEach(project => {
          console.log(`     - ${project.title} (Status: ${project.status})`);
        });
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

checkProjectAssignments();