import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import { User } from '../models/User';
import { Task } from '../models/Task';
import mongoose from 'mongoose';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const admin = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });
    await admin.save();

    // Create member users
    const member1 = new User({
      username: 'john_doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'member'
    });

    const member2 = new User({
      username: 'jane_smith',
      email: 'jane@example.com',
      password: 'password123',
      role: 'member'
    });

    const member3 = new User({
      username: 'bob_wilson',
      email: 'bob@example.com',
      password: 'password123',
      role: 'member'
    });

    await Promise.all([member1.save(), member2.save(), member3.save()]);

    console.log('Created users');

    // Create sample tasks
    const tasks = [
      {
        title: 'Setup Development Environment',
        description: 'Install and configure development tools for the new project',
        assignedTo: member1._id,
        assignedBy: admin._id,
        priority: 'high',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // Due in 2 days
      },
      {
        title: 'Write API Documentation',
        description: 'Create comprehensive API documentation for the REST endpoints',
        assignedTo: member2._id,
        assignedBy: admin._id,
        priority: 'medium',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // Due in 5 days
      },
      {
        title: 'Code Review',
        description: 'Review the authentication module implementation',
        assignedTo: member1._id,
        assignedBy: admin._id,
        priority: 'medium',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // Due in 1 day
      },
      {
        title: 'Database Migration',
        description: 'Create and run database migration scripts for user management',
        assignedTo: member3._id,
        assignedBy: admin._id,
        priority: 'high',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Due in 3 days
      },
      {
        title: 'Unit Testing',
        description: 'Write unit tests for the task management service',
        assignedTo: member2._id,
        assignedBy: admin._id,
        priority: 'low',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Due in 7 days
      }
    ];

    await Task.insertMany(tasks);

    console.log('Created sample tasks');
    console.log('\nSeed data created successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Member 1: john@example.com / password123');
    console.log('Member 2: jane@example.com / password123');
    console.log('Member 3: bob@example.com / password123');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
