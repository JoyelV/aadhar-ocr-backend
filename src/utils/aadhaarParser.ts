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
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('government') ||
        line.toLowerCase().includes('india') ||
        line.toLowerCase().includes('aadhaar') ||
        line.toLowerCase().includes('uid')) {
      continue;
    }
    if (line.match(/^[A-Za-z\s]{2,50}$/)) {
      return line.trim();
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
  const lines = text.split('\n');
  let addressLines: string[] = [];
  let isAddress = false;

  lines.forEach(line => {
    if (line.toLowerCase().includes('address:') || line.toLowerCase().includes('add:')) {
      isAddress = true;
      line = line.replace(/address:|add:/i, '').trim();
      if (line) addressLines.push(line);
    } else if (isAddress && line.trim()) {
      addressLines.push(line.trim());
    }
  });

  if (addressLines.length === 0) {
    return { address: 'Not Found', pinCode: 'Not Found' };
  }

  let fullAddress = addressLines.join(', ');
  const { pincode } = extractPincode(fullAddress);

  fullAddress = cleanAddress(fullAddress);
  const formatted = formatFinalAddress(fullAddress);

  return {
    address: formatted,
    pinCode: pincode || 'Not Found'
  };
}

function extractPincode(address: string): { pincode: string; index: number } {
  const match = address.match(/\b\d{6}\b/);
  return {
    pincode: match ? match[0] : '',
    index: match ? address.indexOf(match[0]) : -1
  };
}

function cleanAddress(address: string): string {
  return address
    .replace(/help@uidai\.gov\.in/g, '')
    .replace(/www\.uidai\.gov\.in/g, '')
    .replace(/\b\d{6}\b/g, '')
    .replace(/\b\d{4}\s\d{4}\s\d{4}\b/g, '')
    .replace(/\b1947\b/g, '')
    .replace(/Testing\s*/i, '')
    .replace(/,\s*,+/g, ',')
    .replace(/\s+/g, ' ')
    .replace(/,\s*\./g, '.')
    .replace(/\s*\.\s*$/g, '')
    .replace(/,(\s*,\s*)+/g, ',')
    .replace(/,\s*$/g, '')
    .trim();
}

function formatFinalAddress(address: string): string {
  return address
    .split(',')
    .map(part => part.trim())
    .filter(part => part.length > 0)
    .join(', ') + '.';
}
