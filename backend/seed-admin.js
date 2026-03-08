/**
 * Seed Database with Admin User
 * Run this to create an admin user for testing
 * Command: node seed-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const ADMIN_USER = {
  username: 'admin',
  email: 'admin@redstore.com',
  password: 'admin123', // Will be hashed by User model
  role: 'admin'
};

const TEST_USER = {
  username: 'testuser',
  email: 'testuser@redstore.com',
  password: 'password123',
  role: 'user'
};

async function seedAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/redstore');
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
    } else {
      // Create admin user
      const admin = await User.create(ADMIN_USER);
      console.log('✅ Created admin user:');
      console.log(`  - Username: ${admin.username}`);
      console.log(`  - Email: ${admin.email}`);
      console.log(`  - Role: ${admin.role}`);
      console.log(`  - ID: ${admin._id}`);
    }

    // Check if test user already exists
    const existingTestUser = await User.findOne({ username: 'testuser' });
    if (existingTestUser) {
      console.log('⚠️  Test user already exists');
    } else {
      // Create test user
      const testUser = await User.create(TEST_USER);
      console.log('✅ Created test user:');
      console.log(`  - Username: ${testUser.username}`);
      console.log(`  - Email: ${testUser.email}`);
      console.log(`  - Role: ${testUser.role}`);
      console.log(`  - ID: ${testUser._id}`);
    }

    // Show all users
    console.log('\n📊 All users in database:');
    const users = await User.find().select('-password');
    users.forEach(u => {
      console.log(`  - ${u.username} (${u.email}) - Role: ${u.role}`);
    });

    console.log('\n✅ Admin seeding complete!');
    console.log('\n🔐 Test Credentials:');
    console.log(`  Admin: username="admin", password="admin123"`);
    console.log(`  User: username="testuser", password="password123"`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdminUser();
