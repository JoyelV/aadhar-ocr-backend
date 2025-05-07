export function parseAadhaarData(frontText: string, backText: string) {
    const nameRegex = /([A-Z][a-z]+ [A-Z][a-z]+)/;
    const dobRegex = /DOB[:\s]+(\d{2}\/\d{2}\/\d{4})/;
    const aadhaarRegex = /(\d{4}\s\d{4}\s\d{4})/;
    const genderRegex = /\b(Male|Female|Other)\b/;
  
    const name = frontText.match(nameRegex)?.[1] ?? "Not Found";
    const dob = frontText.match(dobRegex)?.[1] ?? "Not Found";
    const gender = frontText.match(genderRegex)?.[1] ?? "Not Found";
    const aadhaarNumber = backText.match(aadhaarRegex)?.[1] ?? "Not Found";
    const address = extractAddress(backText);
  
    return { name, dob, gender, aadhaarNumber, ...address };
  }
  
  function extractAddress(text: string) {
    const cleaned = text.replace(/[^A-Za-z0-9,\s-]/g, "").replace(/\s+/g, " ").trim();
    const match = cleaned.match(/(.+?),\s*(DIST:?\s*[\w\s]+)?,\s*([\w\s]+)-\s*(\d{6})/i);
  
    return {
      address: match?.[1]?.trim() ?? "Not Found",
      district: match?.[2]?.replace("DIST", "").trim() ?? "Not Found",
      state: match?.[3]?.trim() ?? "Not Found",
      pinCode: match?.[4] ?? "Not Found"
    };
  }
  