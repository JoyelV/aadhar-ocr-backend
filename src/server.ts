import app from './app.js';
import { validateEnv } from './config/env.js';
import mongoose from 'mongoose';

const { PORT } = validateEnv();

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false).finally(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false).finally(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});