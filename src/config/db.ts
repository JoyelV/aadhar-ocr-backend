import mongoose from 'mongoose';
import { validateEnv } from './env.js';

export async function connectDB(): Promise<void> {
  const { MONGODB_URI } = validateEnv();
  try {
    await mongoose.connect(MONGODB_URI, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}