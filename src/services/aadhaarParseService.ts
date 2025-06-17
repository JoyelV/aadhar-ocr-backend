import AadhaarParserInterface from '../interfaces/aadhaarParserInterface.js';
import { AadhaarDetails } from '../types/aadhaarTypes.js';

class AadhaarParseService {
  private aadhaarParser: AadhaarParserInterface;

  constructor(aadhaarParser: AadhaarParserInterface) {
    this.aadhaarParser = aadhaarParser;
  }

  async parseAadhaarData(frontText: string, backText: string): Promise<AadhaarDetails> {
    return this.aadhaarParser.parseAadhaarData(frontText, backText);
  }
}

export default AadhaarParseService;