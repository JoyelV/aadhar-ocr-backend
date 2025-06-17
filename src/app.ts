import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import aadhaarParseRoutes from './routes/orcRoutes.js';
import authRoutes from './routes/authRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import { connectDB } from './config/db.js';
import { getAllowedOrigins } from './config/cors.js';

const app: Express = express();

// Connect to MongoDB
connectDB().catch((err) => {
  console.error('Failed to start server due to MongoDB connection error:', err);
  process.exit(1);
});

// Middleware
app.use(helmet());
app.use(morgan('combined')); 
app.use(
  cors({
    origin: getAllowedOrigins(),
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/aadhaar', aadhaarParseRoutes); 
app.use('/api/history', historyRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ status: 'ok', mongodb: dbStatus });
});

// Global error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;