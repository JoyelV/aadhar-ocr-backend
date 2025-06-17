import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import aadhaarParseRoutes from './routes/aadhaarParseRoutes';
import authRoutes from './routes/authRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import { connectDB } from './config/db.js';
import { getAllowedOrigins } from './config/cors.js';
const app = express();
// Connect to MongoDB
connectDB().catch((err) => {
    console.error('Failed to start server due to MongoDB connection error:', err);
    process.exit(1);
});
// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
    origin: getAllowedOrigins(),
    credentials: true,
}));
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
// Custom error handling middleware
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    // Handle specific error types
    if (err.name === 'AadhaarValidationError') {
        res.status(400).json({ message: err.message, error: 'Invalid Aadhaar data' });
        return;
    }
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ message: 'Unauthorized access', error: err.message });
        return;
    }
    if (err.name === 'RateLimitError') {
        res.status(429).json({ message: err.message });
        return;
    }
    res.status(500).json({ message: 'Internal server error' });
});
export default app;
