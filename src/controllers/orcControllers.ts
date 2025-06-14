import { Request, Response } from 'express';
import Tesseract, { PSM } from 'tesseract.js';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { imageSize } from 'image-size';
import sharp from 'sharp';
import AadhaarScan from '../models/AadhaarScan.js';
import { parseAadhaarData } from '../utils/aadhaarParser.js';

interface AuthRequest extends Request {
  user?: { userId: string };
}

async function isAadhaarCard(frontText: string, backText: string, frontFile: any, backFile: any): Promise<boolean> {
  // Step 1: Image metadata check
  try {
    const frontDimensions = imageSize(frontFile.buffer);
    const backDimensions = imageSize(backFile.buffer);
    const minWidth = 300;
    const minHeight = 200;
    const aspectRatio = frontDimensions.width / frontDimensions.height;

    if (
      frontDimensions.width < minWidth ||
      frontDimensions.height < minHeight ||
      backDimensions.width < minWidth ||
      backDimensions.height < minHeight ||
      aspectRatio < 1.2 || aspectRatio > 2.0
    ) {
      console.log('Image dimensions or aspect ratio suggest non-Aadhaar image');
      return false;
    }
  } catch (error) {
    console.error('Image metadata error:', error);
    return false;
  }

  // Step 2: QR code detection (front image only)
  try {
    const png = PNG.sync.read(frontFile.buffer);
    const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
    if (!code) {
      console.log('No QR code found in front image');
      return false;
    }
    if (!code.data.match(/\d{12}/)) {
      console.log('QR code does not contain valid Aadhaar number');
      return false;
    }
  } catch (error) {
    console.error('QR code detection error:', error);
    return false;
  }

  // Step 3: Color profile check
  try {
    const stats = await sharp(frontFile.buffer).stats();
    const brightness = stats.channels[0].mean;
    if (brightness < 50 || brightness > 200) {
      console.log('Image brightness suggests non-Aadhaar image (too dark or colorful)');
      return false;
    }
  } catch (error) {
    console.error('Color profile error:', error);
    return false;
  }

  // Step 4: OCR-based validation
  const text = (frontText + ' ' + backText).toLowerCase();
  const keywords = [
    'government of india',
    'uidai',
    'aadhaar',
    'unique identification authority',
    'date of birth',
    'dob',
    'male',
    'female',
    'address',
    'help@uidai.gov.in',
    'www.uidai.gov.in',
  ];
  const aadhaarNumberRegex = /\b\d{4}\s\d{4}\s\d{4}\b/;
  const hasAadhaarNumber = aadhaarNumberRegex.test(frontText) || aadhaarNumberRegex.test(backText);
  const hasCoreKeyword = text.includes('aadhaar') || text.includes('uidai');
  const keywordCount = keywords.filter(keyword => text.includes(keyword)).length;

  // Step 5: Text length and structure check
  const minTextLength = 50;
  if (frontText.length + backText.length < minTextLength) {
    console.log('OCR output too short, likely not a document');
    return false;
  }
  const textStructureRegex = /(name:|dob:|date of birth:|address:|gender:)/i;
  if (!textStructureRegex.test(text)) {
    console.log('No structured Aadhaar fields found');
    return false;
  }

  // Require QR code, Aadhaar number, core keyword, and at least two other keywords
  const isValid = hasAadhaarNumber && hasCoreKeyword && keywordCount >= 2;
  if (!isValid) {
    console.log('Validation failed: Missing Aadhaar number or keywords');
  }
  return isValid;
}

export const recognizeText = async (req: AuthRequest, res: Response) => {
  try {
    const frontFile = (req.files as any)?.front?.[0];
    const backFile = (req.files as any)?.back?.[0];

    if (!frontFile || !backFile) {
      res.status(400).json({ message: 'Please upload both front and back Aadhaar images. No cat selfies or butter chicken allowed!' });
      return;
    }

    // Create Tesseract workers
    const frontWorker = await Tesseract.createWorker('eng');
    const backWorker = await Tesseract.createWorker('eng');

    try {
      // Set Tesseract parameters
      await frontWorker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 /-,.:@',
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      });
      await backWorker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 /-,.:@',
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      });

      // Perform OCR
      const frontResult = await frontWorker.recognize(frontFile.buffer);
      const backResult = await backWorker.recognize(backFile.buffer);

      // Check OCR confidence
      if (frontResult.data.confidence < 60 || backResult.data.confidence < 60) {
        res.status(400).json({ message: 'Image quality too low. Please upload clearer Aadhaar images, not blurry curry shots!' });
        return;
      }

      // Validate Aadhaar card
      if (!(await isAadhaarCard(frontResult.data.text, backResult.data.text, frontFile, backFile))) {
        res.status(400).json({
          message: 'Uploaded images do not appear to be Aadhaar cards. Try actual Aadhaar images, not your pet or dinner!',
        });
        return;
      }

      // Parse the OCR output
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
    } finally {
      // Terminate workers
      await frontWorker.terminate();
      await backWorker.terminate();
    }
  } catch (error: any) {
    console.error('OCR Error:', error);
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        message: `Unexpected field in form data. Expected fields: 'front', 'back'. Received: ${error.field}`,
      });
    }
    res.status(500).json({ message: 'Aadhaar processing failed. Please try again with valid Aadhaar images!', error: error.message });
  }
};