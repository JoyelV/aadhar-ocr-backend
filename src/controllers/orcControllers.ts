import { Request, Response } from 'express';
import Tesseract from 'tesseract.js';
import AadhaarScan from '../models/AadhaarScan.js';
import { parseAadhaarData } from '../utils/aadhaarParser.js'; 

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const recognizeText = async (req: AuthRequest, res: Response) => {
  try {
    const frontFile = (req.files as any)?.front?.[0];
    const backFile = (req.files as any)?.back?.[0];

    if (!frontFile || !backFile) {
      res.status(400).json({ message: 'Both front and back images are required' });
      return;
    }

    // Perform OCR
    const frontResult = await Tesseract.recognize(frontFile.buffer, 'eng');
    const backResult = await Tesseract.recognize(backFile.buffer, 'eng');

    // Parse the OCR output using parseAadhaarData
    const parsedData = parseAadhaarData(frontResult.data.text, backResult.data.text);

    // Convert images to base64 for storage
    const frontImageBase64 = frontFile.buffer.toString('base64');
    const backImageBase64 = backFile.buffer.toString('base64');

    // Save scan data to database
    const scan = new AadhaarScan({
      userId: req.user?.userId,
      frontImage: `data:image/jpeg;base64,${frontImageBase64}`,
      backImage: `data:image/jpeg;base64,${backImageBase64}`,
      parsedData,
    });
    await scan.save();

    res.json(parsedData);
  } catch (error: any) {
    console.error('OCR Error:', error);
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        message: `Unexpected field in form data. Expected fields: 'front', 'back'. Received: ${error.field}`,
      });
    }
    res.status(500).json({ message: 'OCR processing failed', error: error.message });
  }
};

