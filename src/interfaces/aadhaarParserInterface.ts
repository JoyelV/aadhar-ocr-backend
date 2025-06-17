import { AadhaarDetails } from '../types/aadhaarTypes.js';

interface AadhaarParserInterface {
  parseAadhaarData(frontText: string, backText: string): AadhaarDetails;
}

export default AadhaarParserInterface;