import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import ocrRoutes from './routes/authRoutes.js';
import authRoutes from './routes/authRoutes.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aadhaar-app', {})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', ocrRoutes);
export default app;
