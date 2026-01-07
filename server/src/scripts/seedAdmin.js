import dotenv from 'dotenv';
import { connectDB } from '../config/database.js';
import User from '../models/User.js';
import Role from '../models/Role.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    // Create admin role with all permissions
    const adminRole = await Role.findOneAndUpdate(
      { name: 'admin' },
      {
        name: 'admin',
        description: 'Administrator with all permissions',
        permissions: [
          'user.read',
          'user.create',
          'user.update',
          'user.delete',
          'report.view',
          'report.download',
          'billing.view',
          'billing.manage',
          'role.read',
          'role.create',
          'role.update',
          'role.delete',
          'admin.manage',
        ],
      },
      { upsert: true, new: true }
    );

    console.log('Admin role created/updated:', adminRole.name);

    // Check if admin user exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (!existingAdmin) {
      // Create admin user
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        passwordHash: 'admin123', // Will be hashed by pre-save hook
        role: adminRole._id,
        isSuperAdmin: true,
        isActive: true,
      });

      console.log('Admin user created:');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      console.log('User ID:', adminUser._id);
    } else {
      console.log('Admin user already exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();

