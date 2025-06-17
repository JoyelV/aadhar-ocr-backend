import Tesseract from 'tesseract.js';
import OCRServiceInterface from '../interfaces/ocrServiceInterface.js';

class OCRService implements OCRServiceInterface {
  async recognizeText(buffer: Buffer): Promise<string> {
    const result = await Tesseract.recognize(buffer, 'eng');
    return result.data.text;
  }
}

export default OCRService;