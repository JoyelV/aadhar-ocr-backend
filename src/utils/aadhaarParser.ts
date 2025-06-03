export function parseAadhaarData(frontText: string, backText: string) {
  const details = {
    name: extractName(frontText),
    aadhaarNumber: extractAadhaarNumber(frontText, backText),
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

function extractDOB(text: string): string {
  const dobMatch = text.match(/(\d{2}[\/-]\d{2}[\/-]\d{4})/);
  return dobMatch ? dobMatch[0] : 'Not Found';
}

function extractGender(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('male') && lower.includes('female')) return 'FEMALE';
  if (lower.includes('female')) return 'FEMALE';
  if (lower.includes('male')) return 'MALE';
  if (lower.includes('other')) return 'OTHER';
  return 'Not Found';
}

function extractAadhaarNumber(frontText: string, backText: string): string {
  const matchFront = frontText.match(/\d{4}\s\d{4}\s\d{4}/);
  const matchBack = backText.match(/\d{4}\s\d{4}\s\d{4}/);
  return matchFront?.[0] || matchBack?.[0] || 'Not Found';
}

function extractAddress(text: string): { address: string; pinCode: string } {
  // Split text into lines and clean up noise
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Initialize variables
  let addressParts: string[] = [];
  let pinCode = 'Not Found';

  // Regular expression to match potential address components
  const addressRegex = /(?:[A-Za-z0-9\s,]+(?:House|Road|PO:|DIST:|Kerala))/i;
  const pinCodeRegex = /\b\d{6}\b/;

  // Iterate through lines to find address components and PIN code
  lines.forEach(line => {
    // Remove noise (random characters, email, etc.)
    let cleanedLine = line
      .replace(/[^A-Za-z0-9\s,:;-]/g, '') // Remove special characters except allowed ones
      .replace(/help@uidai\.gov\.in/g, '')
      .replace(/www\.uidai\.gov\.in/g, '')
      .replace(/\b\d{4}\s\d{4}\s\d{4}\b/g, '') // Remove 12-digit Aadhaar-like numbers
      .replace(/\b1947\b/g, '')
      .trim();

    // Check for PIN code
    const pinMatch = cleanedLine.match(pinCodeRegex);
    if (pinMatch) {
      pinCode = pinMatch[0];
      cleanedLine = cleanedLine.replace(pinCodeRegex, '').trim();
    }

    // Check if the line contains address-like components
    if (addressRegex.test(cleanedLine) && cleanedLine.length > 0) {
      // Split by commas and filter out empty parts
      const parts = cleanedLine
        .split(',')
        .map(part => part.trim())
        .filter(part => part.length > 0);
      addressParts.push(...parts);
    }
  });

  // Clean and format the address
  let fullAddress = addressParts
    .filter(part => part.length > 0 && !part.match(/^\d+$/)) // Remove standalone numbers
    .join(', ')
    .replace(/,\s*,+/g, ',') // Remove multiple commas
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/,(\s*,\s*)+/g, ',') // Remove consecutive commas
    .replace(/,\s*$/g, '') // Remove trailing comma
    .trim();

  // If no address found, return default
  if (!fullAddress) {
    return { address: 'Not Found', pinCode };
  }

  // Add a period at the end of the address
  fullAddress = fullAddress + '.';

  return {
    address: fullAddress,
    pinCode
  };
}