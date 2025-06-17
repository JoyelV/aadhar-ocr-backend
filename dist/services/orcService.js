import Tesseract from 'tesseract.js';
class OCRService {
    async recognizeText(buffer) {
        const result = await Tesseract.recognize(buffer, 'eng');
        return result.data.text;
    }
}
export default OCRService;
