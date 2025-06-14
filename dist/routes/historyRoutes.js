import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getScanHistory } from '../controllers/historyController.js';
const router = express.Router();
router.get('/scans', authMiddleware, getScanHistory);
export default router;
