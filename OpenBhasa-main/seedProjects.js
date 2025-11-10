require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');
const Project = require('./models/Project');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/openbhasa', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed data
const seedProjects = async () => {
  try {
    await connectDB();

    // Check if admin exists, if not create one
    let admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('📝 Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@openbhasa.com',
        password: hashedPassword,
        phone: '9999999999',
        college: 'OpenBhasa Organization',
        age: 30,
        gender: 'male',
        native: 'English',
        language: ['English', 'Hindi'],
        dialects: ['Standard English', 'Hindi'],
        accent: ['Neutral'],
        role: 'admin',
        isVerified: true
      });
      console.log('✅ Admin user created:', admin.email);
    } else {
      console.log('✅ Admin user already exists:', admin.email);
    }

    // Check if projects already exist
    const existingProjects = await Project.countDocuments();
    
    if (existingProjects >= 2) {
      console.log('ℹ️  Projects already exist. Skipping...');
      console.log('📊 Total projects in database:', existingProjects);
      
      // Show existing projects
      const projects = await Project.find().select('title language status').limit(5);
      console.log('\n📋 Existing Projects:');
      projects.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.title} (${p.language}) - ${p.status}`);
      });
      
      process.exit(0);
    }

    console.log('\n📦 Creating 2 sample projects...\n');

    // Project 1: Hindi Voice Collection
    const project1 = await Project.create({
      title: 'Hindi Voice Data Collection - Phase 1',
      description: 'Collecting voice samples for Hindi language model training. Focus on common phrases, sentences, and conversational speech from native Hindi speakers across different regions.',
      language: 'Hindi',
      dialects: ['Standard Hindi', 'Haryanvi', 'Bhojpuri', 'Awadhi', 'Marwari'],
      targetRecordings: 10000,
      status: 'active',
      createdBy: admin._id,
      assignedReviewers: [],
      targetAgeGroups: ['18-25', '26-35', '36-45', '46-60', '60+'],
      targetGenders: ['male', 'female', 'other'],
      recordingGuidelines: [
        'Speak clearly and at a natural pace',
        'Record in a quiet environment',
        'Minimum 15 seconds per recording',
        'Use standard pronunciation',
        'Avoid background noise'
      ],
      qualityRequirements: {
        minDuration: 15,
        maxDuration: 900,
        minSampleRate: 16000,
        allowedFormats: ['m4a', 'wav', 'webm'],
        noiseThreshold: -30
      },
      metadata: {
        domain: 'General',
        purpose: 'Speech Recognition Model Training',
        totalRecordings: 0,
        completedRecordings: 0,
        approvedRecordings: 0,
        averageRecordingDuration: 0,
        uniqueContributors: 0
      }
    });

    console.log('✅ Project 1 created:');
    console.log(`   📌 Title: ${project1.title}`);
    console.log(`   🗣️  Language: ${project1.language}`);
    console.log(`   🎯 Target: ${project1.targetRecordings} recordings`);
    console.log(`   📊 Status: ${project1.status}`);

    // Project 2: English Voice Collection
    const project2 = await Project.create({
      title: 'English Voice Collection - Accent Diversity',
      description: 'Building a diverse English voice dataset with multiple accents including Indian English, American, British, and Australian accents. Focus on clear pronunciation and natural speech patterns.',
      language: 'English',
      dialects: ['Indian English', 'American English', 'British English', 'Australian English', 'Canadian English'],
      targetRecordings: 8000,
      status: 'active',
      createdBy: admin._id,
      assignedReviewers: [],
      targetAgeGroups: ['18-25', '26-35', '36-45', '46-60'],
      targetGenders: ['male', 'female', 'other'],
      recordingGuidelines: [
        'Speak in your natural accent',
        'Maintain consistent volume',
        'Minimum 10 seconds per recording',
        'Clear pronunciation required',
        'Background noise should be minimal'
      ],
      qualityRequirements: {
        minDuration: 10,
        maxDuration: 900,
        minSampleRate: 16000,
        allowedFormats: ['m4a', 'wav', 'webm'],
        noiseThreshold: -30
      },
      metadata: {
        domain: 'General',
        purpose: 'Multi-Accent Speech Recognition',
        totalRecordings: 0,
        completedRecordings: 0,
        approvedRecordings: 0,
        averageRecordingDuration: 0,
        uniqueContributors: 0
      }
    });

    console.log('\n✅ Project 2 created:');
    console.log(`   📌 Title: ${project2.title}`);
    console.log(`   🗣️  Language: ${project2.language}`);
    console.log(`   🎯 Target: ${project2.targetRecordings} recordings`);
    console.log(`   📊 Status: ${project2.status}`);

    console.log('\n🎉 Successfully created 2 projects!');
    console.log('\n📋 Summary:');
    console.log(`   Total Projects: 2`);
    console.log(`   Admin User: ${admin.email}`);
    console.log(`   Project IDs:`);
    console.log(`     1. ${project1._id}`);
    console.log(`     2. ${project2._id}`);

    console.log('\n💡 You can now:');
    console.log('   1. Login as admin: admin@openbhasa.com / admin123');
    console.log('   2. View projects in admin dashboard');
    console.log('   3. Create tasks for these projects');
    console.log('   4. Assign reviewers to projects');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding projects:', error);
    process.exit(1);
  }
};

// Run the seed script
seedProjects();
