import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { deleteScan, getScanHistory } from '../controllers/historyController.js';

const router = express.Router();

router.get('/scans', authMiddleware, getScanHistory);
router.delete('/scans/:scanId', authMiddleware, deleteScan);

export default router;