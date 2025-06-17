import { Request, Response } from 'express';
import AadhaarParseService from '../services/aadhaarParseService.js';
import OCRService from '../services/ocrService.js';
import AadhaarScanRepository from '../repositories/aadhaarScanRepository.js';
import { AadhaarDetails } from '../types/aadhaarTypes.js';

interface AuthRequest extends Request {
  user?: { userId: string };
}

interface MulterFile {
  buffer: Buffer;
  mimetype: string;
}

interface MulterFiles {
  front?: MulterFile[];
  back?: MulterFile[];
}

class AadhaarUploadController {
  private ocrService: OCRService;
  private aadhaarParseService: AadhaarParseService;
  private aadhaarScanRepository: AadhaarScanRepository;

  constructor(
    ocrService: OCRService,
    aadhaarParseService: AadhaarParseService,
    aadhaarScanRepository: AadhaarScanRepository
  ) {
    this.ocrService = ocrService;
    this.aadhaarParseService = aadhaarParseService;
    this.aadhaarScanRepository = aadhaarScanRepository;
  }

  async uploadAadhaar(req: AuthRequest, res: Response): Promise<void> {
    try {
      const files = req.files as MulterFiles;
      const frontFile = files?.front?.[0];
      const backFile = files?.back?.[0];

      if (!frontFile || !backFile) {
        res.status(400).json({ message: 'Both front and back images are required' });
        return;
      }

      // Validate file types
      const validImageTypes = ['image/jpeg', 'image/png'];
      if (!validImageTypes.includes(frontFile.mimetype) || !validImageTypes.includes(backFile.mimetype)) {
        res.status(400).json({ message: 'Only JPEG or PNG images are allowed' });
        return;
      }

      const frontText = await this.ocrService.recognizeText(frontFile.buffer);
      const backText = await this.ocrService.recognizeText(backFile.buffer);

      const parsedData = await this.aadhaarParseService.parseAadhaarData(frontText, backText);

      // Validate parsed data
      const requiredFields: (keyof AadhaarDetails)[] = ['name', 'aadhaarNumber', 'dob', 'gender', 'address', 'pinCode'];
      const isValid = requiredFields.every((field) => parsedData[field] && parsedData[field] !== 'Not Found');
      if (!isValid) {
        res.status(400).json({ message: 'Uploaded Aadhaar card images are not valid' });
        return;
      }

      const frontImageBase64 = `data:image/jpeg;base64,${frontFile.buffer.toString('base64')}`;
      const backImageBase64 = `data:image/jpeg;base64,${backFile.buffer.toString('base64')}`;

      await this.aadhaarScanRepository.saveScan(
        req.user!.userId,
        frontImageBase64,
        backImageBase64,
        parsedData
      );

      res.json(parsedData);
    } catch (error: any) {
      console.error('Upload Error:', error);
      if (error.message === 'Uploaded images do not appear to be Aadhaar cards') {
        res.status(400).json({ message: 'Uploaded images are not valid Aadhaar cards. Please upload correct Aadhaar images.' });
      } else {
        res.status(500).json({ message: 'Aadhaar processing failed', error: error.message });
      }
    }
  }
}

export default AadhaarUploadController;