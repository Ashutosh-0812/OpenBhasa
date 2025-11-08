const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('./models/Task');
const Project = require('./models/Project');
const User = require('./models/User');

const createTestTask = async () => {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected');

    // Find the project and student
    const project = await Project.findById('690fc2c9ef05b44ee58f3517');
    const student = await User.findOne({ email: 'sharmaujjwal2019@gmail.com' });

    if (!project) {
      console.log('❌ Project not found');
      return;
    }

    if (!student) {
      console.log('❌ Student not found');
      return;
    }

    console.log(`\n📂 Project: ${project.title} (${project._id})`);
    console.log(`👨‍🎓 Student: ${student.name} (${student.email})`);

    // Create a test task
    const taskData = {
      project: project._id,
      title: 'Urdu Sentence Reading Task',
      description: 'Read the given Urdu sentences clearly for speech recognition training',
      script: 'یہ ایک اردو جملہ ہے۔ اسے صاف آواز میں پڑھیں۔',
      language: 'Urdu',
      dialect: 'Standard Urdu',
      type: 'standard',
      difficulty: 'easy',
      estimatedDuration: 300, // 5 minutes in seconds
      targetRecordings: 10,
      tags: ['reading', 'urdu', 'speech'],
      priority: 2, // 1-5 scale, 2 = low-medium
      status: 'active',
      createdBy: student._id
    };

    console.log('\n📝 Creating task with data:');
    console.log(JSON.stringify(taskData, null, 2));

    const task = await Task.create(taskData);
    console.log('\n✅ Task created successfully!');
    console.log(`Task ID: ${task._id}`);
    console.log(`Title: ${task.title}`);

    // Auto-assign task to project's assigned users
    const projectWithUsers = await Project.findById(project._id).select('assignedUsers');
    if (projectWithUsers && projectWithUsers.assignedUsers && projectWithUsers.assignedUsers.length > 0) {
      console.log('\n🎯 Auto-assigning task to project users:', projectWithUsers.assignedUsers);
      const userAssignments = projectWithUsers.assignedUsers.map(userId => ({
        user: userId,
        assignedAt: new Date()
      }));
      task.assignedTo = userAssignments;
      await task.save();
      console.log('✅ Task auto-assigned to', userAssignments.length, 'users');
    }

    // Update project task count
    await Project.findByIdAndUpdate(project._id, {
      $inc: { 'metadata.totalTasks': 1 }
    });
    console.log('✅ Project task count updated');

    // Verify the task was created
    const createdTask = await Task.findById(task._id)
      .populate('project', 'title language')
      .populate('createdBy', 'name email')
      .populate('assignedTo.user', 'name email');

    console.log('\n📋 Final task details:');
    console.log(`Title: ${createdTask.title}`);
    console.log(`Project: ${createdTask.project.title}`);
    console.log(`Created by: ${createdTask.createdBy.name}`);
    console.log(`Status: ${createdTask.status}`);
    console.log(`Assigned to: ${createdTask.assignedTo.length} users`);
    createdTask.assignedTo.forEach(assignment => {
      console.log(`  - ${assignment.user.name} (${assignment.user.email})`);
    });

    console.log('\n🎉 Test task creation completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Database disconnected');
    process.exit(0);
  }
};

createTestTask();