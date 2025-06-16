export function parseAadhaarData(frontText: string, backText: string) {
  // Validate if the images are likely Aadhaar cards
  if (!isAadhaarCard(frontText, backText)) {
    throw new Error('Uploaded images do not appear to be Aadhaar cards');
  }

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

// New function to validate Aadhaar card images
function isAadhaarCard(frontText: string, backText: string): boolean {
  const lowerFrontText = frontText.toLowerCase();
  const lowerBackText = backText.toLowerCase();

  // Aadhaar-specific keywords
  const aadhaarKeywords = ['aadhaar', 'uidai', 'unique identification authority', 'government of india'];

  // Check for Aadhaar number (12 digits, typically formatted as XXXX XXXX XXXX)
  const aadhaarNumberRegex = /\d{4}\s\d{4}\s\d{4}/;

  // Check if either text contains Aadhaar keywords or an Aadhaar number
  const hasAadhaarKeyword =
    aadhaarKeywords.some(keyword => lowerFrontText.includes(keyword) || lowerBackText.includes(keyword));
  const hasAadhaarNumber =
    aadhaarNumberRegex.test(frontText) || aadhaarNumberRegex.test(backText);

  // Return true only if both conditions are met (for stricter validation)
  return hasAadhaarKeyword && hasAadhaarNumber;
}

function extractName(text: string): string {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const ignoreKeywords = [
    'government', 'india', 'aadhaar', 'uid',
    'date of birth', 'dob', 'male', 'female',
    'address', 'vid', 'year of birth', 'dob:', 'gender'
  ];

  const possibleNames: string[] = [];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Skip if line contains irrelevant keywords
    if (ignoreKeywords.some(keyword => lowerLine.includes(keyword))) {
      continue;
    }

    // Clean the line by removing common OCR noise
    const cleanedLine = line
      .replace(/[^A-Za-z\s'"|]/g, '') // Allow letters, spaces, quotes, and pipes
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    // Skip if line is too short or too long
    if (cleanedLine.length < 3 || cleanedLine.length > 50) {
      continue;
    }

    // Match name pattern within the line (two or more capitalized words)
    const nameMatch = cleanedLine.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
    if (nameMatch) {
      possibleNames.push(nameMatch[0]);
    }
  }

  // Return the longest possible match or fallback
  if (possibleNames.length > 0) {
    return possibleNames.sort((a, b) => b.length - a.length)[0];
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
  const addressRegex = /(?:[A-Za-z0-9\s,]+(?:House|Road|Street|Lane|Nagar|Village|PO:|DIST:|Kerala|Taluk|Block))/i;
  const pinCodeRegex = /\b\d{6}\b/;

  // Keywords to ignore in address lines
  const ignoreKeywords = [
    'government', 'india', 'aadhaar', 'uid', 'uidai',
    'vid', 'enrolment', 'enrollment', 'care of', 'c/o',
    'unique identification', 'authority', 'toll free',
    'website', 'email', 'barcode', 'qr code'
  ];

  // Iterate through lines to find address components and PIN code
  lines.forEach(line => {
    const lowerLine = line.toLowerCase();

    // Skip lines with irrelevant keywords
    if (ignoreKeywords.some(keyword => lowerLine.includes(keyword))) {
      return;
    }

    // Remove noise (random characters, emails, URLs, Aadhaar numbers, etc.)
    let cleanedLine = line
      .replace(/[^A-Za-z0-9\s,-]/g, '') // Allow only letters, numbers, spaces, commas, hyphens
      .replace(/help@uidai\.gov\.in/g, '')
      .replace(/www\.uidai\.gov\.in/g, '')
      .replace(/\b\d{4}\s\d{4}\s\d{4}\b/g, '') // Remove Aadhaar numbers
      .replace(/\b1947\b/g, '') // Remove specific years like 1947
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    // Check for PIN code
    const pinMatch = cleanedLine.match(pinCodeRegex);
    if (pinMatch) {
      pinCode = pinMatch[0];
      cleanedLine = cleanedLine.replace(pinCodeRegex, '').trim();
    }

    // Check if the line contains address-like components
    if (addressRegex.test(cleanedLine) && cleanedLine.length > 0) {
      // Split by commas or spaces for address parts
      const parts = cleanedLine
        .split(/[, ]+/)
        .map(part => {
          // Capitalize first letter of each part for consistency
          if (part.length > 0) {
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
          }
          return part;
        })
        .filter(part => part.length > 0 && !part.match(/^\d+$/)); // Remove standalone numbers
      addressParts.push(...parts);
    }
  });

  // Clean and format the address
  let fullAddress = addressParts
    .filter(part => {
      // Remove parts that are too short or likely noise
      return part.length > 2 && !ignoreKeywords.some(keyword => part.toLowerCase().includes(keyword));
    })
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