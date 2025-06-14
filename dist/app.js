import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import ocrRoutes from './routes/orcRoutes.js';
import authRoutes from './routes/authRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aadhaar-app', {})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));
app.use(cors({
    origin: 'https://aadhaar-ocr-system-frontend-sand.vercel.app',
    credentials: true
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', ocrRoutes);
app.use('/api/history', historyRoutes);
export default app;
