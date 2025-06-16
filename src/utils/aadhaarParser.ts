export function parseAadhaarData(frontText: string, backText: string) {
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

function isAadhaarCard(frontText: string, backText: string): boolean {
  const lowerFrontText = frontText.toLowerCase();
  const lowerBackText = backText.toLowerCase();

  const aadhaarKeywords = ['aadhaar', 'uidai', 'unique identification authority', 'government of india'];

  const aadhaarNumberRegex = /\d{4}\s\d{4}\s\d{4}/;

  const hasAadhaarKeyword =
    aadhaarKeywords.some(keyword => lowerFrontText.includes(keyword) || lowerBackText.includes(keyword));
  const hasAadhaarNumber =
    aadhaarNumberRegex.test(frontText) || aadhaarNumberRegex.test(backText);

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

    if (ignoreKeywords.some(keyword => lowerLine.includes(keyword))) {
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

// function extractAddress(text: string): { address: string; pinCode: string } {
//   const lines = text
//     .split('\n')
//     .map(line => line.trim())
//     .filter(line => line.length > 0);

//   let addressParts: string[] = [];
//   let pinCode = 'Not Found';

//   const addressRegex = /(?:[A-Za-z0-9\s,]+(?:House|Road|Street|Lane|Nagar|Village|PO:|DIST:|Kerala|Taluk|Block))/i;
//   const pinCodeRegex = /\b\d{6}\b/;

//   const ignoreKeywords = [
//     'government', 'india', 'aadhaar', 'uid', 'uidai',
//     'vid', 'enrolment', 'enrollment', 'care of', 'c/o',
//     'unique identification', 'authority', 'toll free',
//     'website', 'email', 'barcode', 'qr code'
//   ];

//   lines.forEach(line => {
//     const lowerLine = line.toLowerCase();

//     if (ignoreKeywords.some(keyword => lowerLine.includes(keyword))) {
//       return;
//     }

//     let cleanedLine = line
//       .replace(/[^A-Za-z0-9\s,-]/g, '') 
//       .replace(/help@uidai\.gov\.in/g, '')
//       .replace(/www\.uidai\.gov\.in/g, '')
//       .replace(/\b\d{4}\s\d{4}\s\d{4}\b/g, '') 
//       .replace(/\b1947\b/g, '') 
//       .replace(/\s+/g, ' ') 
//       .trim();

//     const pinMatch = cleanedLine.match(pinCodeRegex);
//     if (pinMatch) {
//       pinCode = pinMatch[0];
//       cleanedLine = cleanedLine.replace(pinCodeRegex, '').trim();
//     }

//     if (addressRegex.test(cleanedLine) && cleanedLine.length > 0) {
//       const parts = cleanedLine
//         .split(/[, ]+/)
//         .map(part => {
//           if (part.length > 0) {
//             return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
//           }
//           return part;
//         })
//         .filter(part => part.length > 0 && !part.match(/^\d+$/)); 
//       addressParts.push(...parts);
//     }
//   });

//   let fullAddress = addressParts
//     .filter(part => {
//       return part.length > 2 && !ignoreKeywords.some(keyword => part.toLowerCase().includes(keyword));
//     })
//     .join(', ')
//     .replace(/,\s*,+/g, ',') 
//     .replace(/\s+/g, ' ') 
//     .replace(/,(\s*,\s*)+/g, ',') 
//     .replace(/,\s*$/g, '') 
//     .trim();

//   if (!fullAddress) {
//     return { address: 'Not Found', pinCode };
//   }

//   fullAddress = fullAddress + '.';

//   return {
//     address: fullAddress,
//     pinCode
//   };
// }

function extractAddress(text: string): { address: string; pinCode: string } {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  let collecting = false;
  let addressLines: string[] = [];
  let pinCode = 'Not Found';

  const pinCodeRegex = /\b\d{6}\b/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Start collecting from "Address:" OR if line starts with S/O or C/O
    if (/^Address[:：]?$/.test(line) || /^[SC]\/O[:：]?/i.test(line)) {
      collecting = true;
    }

    if (collecting) {
      if (pinCodeRegex.test(line)) {
        const match = line.match(pinCodeRegex);
        if (match) pinCode = match[0];
      }

      addressLines.push(line);

      // Heuristic stop if pincode or a state keyword like Kerala is found
      if (line.toLowerCase().includes('kerala') || pinCodeRegex.test(line)) {
        break;
      }
    }
  }

  // Clean up and format the address
  const address = addressLines
    .join(', ')
    .replace(/\s+/g, ' ')
    .replace(/,+/g, ',')
    .replace(/,\s*$/, '') // remove trailing comma
    .trim();

  return {
    address: address || 'Not Found',
    pinCode
  };
}
