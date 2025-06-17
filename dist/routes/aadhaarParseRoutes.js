import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import AadhaarUploadController from '../controllers/aadhaarUploadController.js';
import AadhaarParseService from '../services/aadhaarParseService.js';
import OCRService from '../services/ocrService.js';
import AadhaarScanRepository from '../repositories/aadhaarScanRepository.js';
import AadhaarParser from '../parsers/aadhaarParser.js';
import upload from '../config/multerConfig.js';
import rateLimit from 'express-rate-limit';
import { RateLimitError, AadhaarValidationError } from '../utlis/errors.js';
const router = express.Router();
// Dependency Injection
const aadhaarParser = new AadhaarParser();
const aadhaarParseService = new AadhaarParseService(aadhaarParser);
const ocrService = new OCRService();
const aadhaarScanRepository = new AadhaarScanRepository();
const aadhaarUploadController = new AadhaarUploadController(ocrService, aadhaarParseService, aadhaarScanRepository);
// Rate limiting for uploading endpoints
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    handler: (req, res, next) => {
        next(new RateLimitError('Too many upload requests, please try again later.'));
    },
});
router.post('/upload', authMiddleware, uploadLimiter, upload.fields([{ name: 'front', maxCount: 1 }, { name: 'back', maxCount: 1 }]), async (req, res, next) => {
    try {
        // Assert req.files as an object with fieldname keys
        const files = req.files;
        if (!files || !files['front']?.length || !files['back']?.length) {
            throw new AadhaarValidationError('Both front and back images are required');
        }
        await aadhaarUploadController.uploadAadhaar(req, res);
    }
    catch (err) {
        next(err);
    }
});
export default router;
