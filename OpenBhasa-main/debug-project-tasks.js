const mongoose = require('mongoose');
require('dotenv').config();

const Project = require('./models/Project');
const Task = require('./models/Task');
const User = require('./models/User');

const checkProjectTasks = async () => {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected');

    const projectId = '690fc2c9ef05b44ee58f3517'; // The "bada project" ID

    // Find the project
    const project = await Project.findById(projectId)
      .populate('createdBy', 'name email role')
      .populate('assignedUsers', 'name email role');

    if (!project) {
      console.log('❌ Project not found');
      return;
    }

    console.log(`\n📂 Project: ${project.title}`);
    console.log(`   ID: ${project._id}`);
    console.log(`   Description: ${project.description}`);
    console.log(`   Language: ${project.language}`);
    console.log(`   Status: ${project.status}`);
    console.log(`   Created by: ${project.createdBy?.name} (${project.createdBy?.email})`);
    console.log(`   Assigned Users (${project.assignedUsers.length}):`);
    
    project.assignedUsers.forEach(user => {
      console.log(`     - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // Find all tasks for this project
    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo.user', 'name email')
      .sort({ createdAt: -1 });

    console.log(`\n📋 Tasks for this project (${tasks.length}):`);
    
    if (tasks.length === 0) {
      console.log('   ❌ No tasks found for this project');
    } else {
      tasks.forEach((task, index) => {
        console.log(`\n   ${index + 1}. Task: ${task.title}`);
        console.log(`      ID: ${task._id}`);
        console.log(`      Description: ${task.description || 'No description'}`);
        console.log(`      Status: ${task.status}`);
        console.log(`      Approval Status: ${task.approvalStatus || 'Not set'}`);
        console.log(`      Language: ${task.language}`);
        console.log(`      Difficulty: ${task.difficulty || 'Not set'}`);
        console.log(`      Created by: ${task.createdBy || 'Unknown'}`);
        console.log(`      Assigned to: ${task.assignedTo?.length || 0} users`);
        if (task.assignedTo && task.assignedTo.length > 0) {
          task.assignedTo.forEach(assignment => {
            console.log(`        - ${assignment.user.name} (${assignment.user.email})`);
          });
        }
        console.log(`      Created at: ${task.createdAt}`);
      });
    }

    // Check if participant vikas can access these tasks
    const participant = await User.findOne({ email: 'vivek@gandi.chutka' });
    if (participant) {
      console.log(`\n👤 Checking access for participant: ${participant.name} (${participant.email})`);
      console.log(`   Role: ${participant.role}`);
      
      // Check if participant is assigned to the project
      const isAssignedToProject = project.assignedUsers.some(user => 
        user._id.toString() === participant._id.toString()
      );
      console.log(`   Is assigned to project: ${isAssignedToProject}`);
      
      // Check which tasks are assigned to this participant
      const assignedTasks = tasks.filter(task => 
        task.assignedTo && task.assignedTo.some(user => 
          user._id.toString() === participant._id.toString()
        )
      );
      console.log(`   Tasks assigned directly to participant: ${assignedTasks.length}`);
      
      // Check tasks by status and approval
      const activeTasks = tasks.filter(task => task.status === 'active');
      const approvedTasks = tasks.filter(task => task.approvalStatus === 'approved');
      console.log(`   Active tasks in project: ${activeTasks.length}`);
      console.log(`   Approved tasks in project: ${approvedTasks.length}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Database disconnected');
    process.exit(0);
  }
};

checkProjectTasks();