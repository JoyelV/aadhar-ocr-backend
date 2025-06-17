import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import HistoryController from '../controllers/historyController.js';
import HistoryService from '../services/historyService.js';
import AadhaarScanRepository from '../repositories/aadhaarScanRepository.js';
const router = express.Router();
// Dependency Injection
const aadhaarScanRepository = new AadhaarScanRepository();
const historyService = new HistoryService(aadhaarScanRepository);
const historyController = new HistoryController(historyService);
router.get('/scans', authMiddleware, (req, res) => historyController.getScanHistory(req, res));
export default router;
