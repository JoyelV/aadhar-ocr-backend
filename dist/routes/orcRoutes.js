import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/authMiddleware.js';
import AadhaarUploadController from '../controllers/aadhaarUploadController.js';
import AadhaarParseService from '../services/aadhaarParseService.js';
import OCRService from '../services/orcService.js';
import AadhaarScanRepository from '../repositories/aadhaarScanRepository.js';
import AadhaarParser from '../parsers/aadhaarParser.js';
const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});
// Dependency Injection
const aadhaarParser = new AadhaarParser();
const aadhaarParseService = new AadhaarParseService(aadhaarParser);
const ocrService = new OCRService();
const aadhaarScanRepository = new AadhaarScanRepository();
const aadhaarUploadController = new AadhaarUploadController(ocrService, aadhaarParseService, aadhaarScanRepository);
router.post('/upload', authMiddleware, upload.fields([{ name: 'front', maxCount: 1 }, { name: 'back', maxCount: 1 }]), (req, res) => aadhaarUploadController.uploadAadhaar(req, res));
export default router;
