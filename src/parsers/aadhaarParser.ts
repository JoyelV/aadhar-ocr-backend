import AadhaarParserInterface from '../interfaces/aadhaarParserInterface.js';
import { AadhaarDetails } from '../types/aadhaarTypes.js';

class AadhaarParser implements AadhaarParserInterface {
  private isAadhaarCard(frontText: string, backText: string): boolean {
    const lowerFrontText = frontText.toLowerCase();
    const lowerBackText = backText.toLowerCase();
    const aadhaarKeywords = ['aadhaar', 'uidai', 'unique identification authority', 'government of india'];
    const aadhaarNumberRegex = /\d{4}\s\d{4}\s\d{4}/;

    const hasAadhaarKeyword = aadhaarKeywords.some(
      (keyword) => lowerFrontText.includes(keyword) || lowerBackText.includes(keyword)
    );
    const hasAadhaarNumber = aadhaarNumberRegex.test(frontText) || aadhaarNumberRegex.test(backText);

    return hasAadhaarKeyword && hasAadhaarNumber;
  }

  private extractName(text: string): string {
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const ignoreKeywords = [
      'government', 'india', 'aadhaar', 'uid',
      'date of birth', 'dob', 'male', 'female',
      'address', 'vid', 'year of birth', 'dob:', 'gender'
    ];

    const possibleNames: string[] = [];

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      if (ignoreKeywords.some((keyword) => lowerLine.includes(keyword))) {
        continue;
      }

      const cleanedLine = line
        .replace(/[^A-Za-z\s'"|]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanedLine.length < 3 || cleanedLine.length > 50) {
        continue;
      }

      const nameMatch = cleanedLine.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
      if (nameMatch) {
        possibleNames.push(nameMatch[0]);
      }
    }

    return possibleNames.length > 0
      ? possibleNames.sort((a, b) => b.length - a.length)[0]
      : 'Not Found';
  }

  private extractDOB(text: string): string {
    const dobMatch = text.match(/(\d{2}[\/-]\d{2}[\/-]\d{4})/);
    return dobMatch ? dobMatch[0] : 'Not Found';
  }

  private extractGender(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('male') && lower.includes('female')) return 'FEMALE';
    if (lower.includes('female')) return 'FEMALE';
    if (lower.includes('male')) return 'MALE';
    if (lower.includes('other')) return 'OTHER';
    return 'Not Found';
  }

  private extractAadhaarNumber(frontText: string, backText: string): string {
    const matchFront = frontText.match(/\d{4}\s\d{4}\s\d{4}/);
    const matchBack = backText.match(/\d{4}\s\d{4}\s\d{4}/);
    return matchFront?.[0] || matchBack?.[0] || 'Not Found';
  }

  private extractAddress(text: string): { address: string; pinCode: string } {
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let collecting = false;
    let addressLines: string[] = [];
    let pinCode = 'Not Found';

    const pinCodeRegex = /\b\d{6}\b/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (/^Address[:：]?$/.test(line) || /^[SC]\/O[:：]?/i.test(line)) {
        collecting = true;
      }

      if (collecting) {
        if (pinCodeRegex.test(line)) {
          const match = line.match(pinCodeRegex);
          if (match) pinCode = match[0];
        }

        addressLines.push(line);

        if (line.toLowerCase().includes('kerala') || pinCodeRegex.test(line)) {
          break;
        }
      }
    }

    const address = addressLines
      .join(', ')
      .replace(/\s+/g, ' ')
      .replace(/,+/g, ',')
      .replace(/,\s*$/, '')
      .trim();

    return {
      address: address || 'Not Found',
      pinCode,
    };
  }

  parseAadhaarData(frontText: string, backText: string): AadhaarDetails {
    if (!this.isAadhaarCard(frontText, backText)) {
      throw new Error('Uploaded images do not appear to be Aadhaar cards');
    }

    const { address, pinCode } = this.extractAddress(backText);

    return {
      name: this.extractName(frontText),
      aadhaarNumber: this.extractAadhaarNumber(frontText, backText),
      dob: this.extractDOB(frontText),
      gender: this.extractGender(frontText),
      address,
      pinCode,
    };
  }
}

export default AadhaarParser;