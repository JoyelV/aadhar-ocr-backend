import express from 'express';
import multer from 'multer';
import { recognizeText } from '../controllers/orcControllers.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-aadhaar', authMiddleware, upload.fields([
  { name: 'front', maxCount: 1 },
  { name: 'back', maxCount: 1 }
]), recognizeText);

export default router;