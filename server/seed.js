require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-reports');
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create test users
    const users = [
      {
        username: 'admin',
        email: 'admin@test.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      },
      {
        username: 'testuser',
        email: 'user@test.com',
        password: 'user123',
        firstName: 'Test',
        lastName: 'User',
        role: 'user'
      },
      {
        username: 'demo',
        email: 'demo@test.com',
        password: 'demo123',
        firstName: 'Demo',
        lastName: 'User',
        role: 'user'
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.username} (${userData.email})`);
    }

    console.log('\n=== Test Users Created ===');
    console.log('Admin User:');
    console.log('  Email: admin@test.com');
    console.log('  Password: admin123');
    console.log('\nTest User:');
    console.log('  Email: user@test.com');
    console.log('  Password: user123');
    console.log('\nDemo User:');
    console.log('  Email: demo@test.com');
    console.log('  Password: demo123');
    console.log('\nYou can now use these credentials to login!');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedUsers();
