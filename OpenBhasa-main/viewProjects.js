require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');
const User = require('./models/User');

const viewProjects = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/openbhasa');
    console.log('✅ Connected to MongoDB\n');

    // Get all projects
    const projects = await Project.find()
      .populate('createdBy', 'name email role')
      .populate('assignedReviewers', 'name email');

    console.log('📊 Total Projects:', projects.length);
    console.log('=' .repeat(80));

    projects.forEach((project, index) => {
      console.log(`\n🗂️  PROJECT ${index + 1}:`);
      console.log(`   ID: ${project._id}`);
      console.log(`   Title: ${project.title}`);
      console.log(`   Language: ${project.language}`);
      console.log(`   Dialects: ${project.dialects.join(', ')}`);
      console.log(`   Target Recordings: ${project.targetRecordings}`);
      console.log(`   Status: ${project.status}`);
      console.log(`   Created By: ${project.createdBy?.name} (${project.createdBy?.email})`);
      console.log(`   Assigned Reviewers: ${project.assignedReviewers?.length || 0}`);
      console.log(`   Created At: ${project.createdAt}`);
      console.log(`   Description: ${project.description.substring(0, 100)}...`);
      console.log('-'.repeat(80));
    });

    // Get admin user
    const admin = await User.findOne({ role: 'admin' });
    console.log(`\n👤 Admin User: ${admin?.email}`);
    console.log(`   Password: admin123`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

viewProjects();
