export function parseAadhaarData(frontText: string, backText: string) {
  const details = {
    aadhaarName: extractName(frontText),
    aadhaarNumber: extractAadhaarNumber(frontText, backText),
    aadhaarCode: extractAadhaarCode(frontText),
    dob: extractDOB(frontText),
    gender: extractGender(frontText),
    address: '',
    pinCode: ''
  };

  const { address, pinCode } = extractAddress(backText);
  details.address = address;
  details.pinCode = pinCode;

  return details;
}

// Aadhaar name extraction
function extractName(text: string): string {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const addressKeywords = /(House|Road|Street|PO:|DIST:|Pin|Kerala)/i;

  for (const line of lines) {
    if (
      line.toLowerCase().includes('government') ||
      line.toLowerCase().includes('india') ||
      line.toLowerCase().includes('aadhaar') ||
      line.toLowerCase().includes('uid') ||
      line.toLowerCase().includes('vid') ||
      line.includes('help@uidai.gov.in') ||
      line.includes('www.uidai.gov.in')
    ) {
      continue;
    }

    const cleanedLine = line
      .replace(/[^A-Za-z\s.]/g, '') 
      .replace(/\s+/g, ' ') 
      .trim();

    if (cleanedLine.match(/^[A-Za-z\s.]{2,50}$/) && !addressKeywords.test(cleanedLine)) {
      return cleanedLine;
    }
  }

  return 'Not Found';
}

// Extract DOB
function extractDOB(text: string): string {
  const dobMatch = text.match(/(\d{2}[\/-]\d{2}[\/-]\d{4})/);
  return dobMatch ? dobMatch[0] : 'Not Found';
}

// Extract gender
function extractGender(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('male') && lower.includes('female')) return 'FEMALE';
  if (lower.includes('female')) return 'FEMALE';
  if (lower.includes('male')) return 'MALE';
  if (lower.includes('other')) return 'OTHER';
  return 'Not Found';
}

// Extract Aadhaar Number
function extractAadhaarNumber(frontText: string, backText: string): string {
  const matchFront = frontText.match(/\d{4}\s\d{4}\s\d{4}/);
  const matchBack = backText.match(/\d{4}\s\d{4}\s\d{4}/);
  return matchFront?.[0] || matchBack?.[0] || 'Not Found';
}

// Extract Aadhaar Code (VID)
function extractAadhaarCode(text: string): string {
  const vidRegex = /(?:VID|Virtual ID)[:\s]*([0-9]{16})/i;
  const match = text.match(vidRegex);

  if (match && match[1]) {
    return match[1];
  }

  const generic16Digit = text.match(/\b\d{16}\b/);
  return generic16Digit ? generic16Digit[0] : 'Not Found';
}

// Extract address and pincode
function extractAddress(text: string): { address: string; pinCode: string } {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  let addressParts: string[] = [];
  let pinCode = 'Not Found';

  const addressRegex = /(?:[A-Za-z0-9\s,]+(?:House|Road|PO:|DIST:|Kerala))/i;
  const pinCodeRegex = /\b\d{6}\b/;

  lines.forEach(line => {
    let cleanedLine = line
      .replace(/[^A-Za-z0-9\s,:;-]/g, '')
      .replace(/help@uidai\.gov\.in/g, '')
      .replace(/www\.uidai\.gov\.in/g, '')
      .replace(/\b\d{4}\s\d{4}\s\d{4}\b/g, '')
      .replace(/\b1947\b/g, '')
      .trim();

    const pinMatch = cleanedLine.match(pinCodeRegex);
    if (pinMatch) {
      pinCode = pinMatch[0];
      cleanedLine = cleanedLine.replace(pinCodeRegex, '').trim();
    }

    if (addressRegex.test(cleanedLine) && cleanedLine.length > 0) {
      const parts = cleanedLine
        .split(',')
        .map(part => part.trim())
        .filter(part => part.length > 0);
      addressParts.push(...parts);
    }
  });

  let fullAddress = addressParts
    .filter(part => part.length > 0 && !part.match(/^\d+$/))
    .join(', ')
    .replace(/,\s*,+/g, ',')
    .replace(/\s+/g, ' ')
    .replace(/,(\s*,\s*)+/g, ',')
    .replace(/,\s*$/g, '')
    .trim();

  if (!fullAddress) {
    return { address: 'Not Found', pinCode };
  }

  fullAddress = fullAddress + '.';

  return {
    address: fullAddress,
    pinCode
  };
}
