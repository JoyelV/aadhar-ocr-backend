require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const Tesseract = require("tesseract.js");
const fs = require("fs");

const app = express();
//app.use(cors({ origin: "http://localhost:3000" }));
app.use(cors({ origin: "https://frontend-pied-phi-26.vercel.app" }));
app.use(express.json());

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Create Uploads Directory if Not Exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Aadhaar OCR API
app.post("/api/upload", upload.fields([{ name: "aadhaarFront" }, { name: "aadhaarBack" }]), async (req, res) => {
  if (!req.files.aadhaarFront || !req.files.aadhaarBack) {
    return res.status(400).json({ error: "Both front and back Aadhaar images are required!" });
  }
  const frontImagePath = req.files.aadhaarFront[0].path;
  const backImagePath = req.files.aadhaarBack[0].path;

  try {
    // Extract Text from Images
    const frontOCR = await Tesseract.recognize(frontImagePath, "eng");
    const backOCR = await Tesseract.recognize(backImagePath, "eng");

    // Parse Aadhaar Details
    const extractedData = parseAadhaarData(frontOCR.data.text, backOCR.data.text);
    console.log(extractedData, "extractedData");

    // Send Response
    res.json({ success: true, data: extractedData });
  } catch (error) {
    res.status(500).json({ error: "OCR Processing Failed!", details: error.message });
  } finally {
    // Cleanup uploaded files
    fs.unlinkSync(frontImagePath);
    fs.unlinkSync(backImagePath);
  }
});

// Function to extract Aadhaar details
function parseAadhaarData(frontText, backText) {  
  const nameRegex = /([A-Z][a-z]+ [A-Z][a-z]+)/;
  const dobRegex = /DOB[:\s]+(\d{2}\/\d{2}\/\d{4})/;
  const aadhaarRegex = /(\d{4}\s\d{4}\s\d{4})/;
  const genderRegex = /\b(Male|Female|Other)\b/;
  
  const nameMatch = frontText.match(nameRegex);
  const dobMatch = frontText.match(dobRegex);
  const aadhaarMatch = backText.match(aadhaarRegex);
  const genderMatch = frontText.match(genderRegex);

  // Extract and clean address
  const address = extractAddress(backText);

  return {
    name: nameMatch ? nameMatch[1] : "Not Found",
    dob: dobMatch ? dobMatch[1] : "Not Found",
    aadhaarNumber: aadhaarMatch ? aadhaarMatch[1] : "Not Found",
    gender: genderMatch ? genderMatch[1] : "Not Found",
    address: address.houseName,
    district: address.district,
    state: address.state,
    pinCode: address.pinCode
  };
}

// Function to extract a cleaned address
function extractAddress(rawText) {
  let cleanedText = rawText
    .replace(/[^A-Za-z0-9,\s-]/g, "") 
    .replace(/\s+/g, " ") 
    .trim();

  const addressRegex = /(.+?),\s*(DIST:?\s*[\w\s]+)?,\s*([\w\s]+)-\s*(\d{6})/i;
  const match = cleanedText.match(addressRegex);

  return {
    fullAddress: cleanedText,
    houseName: match ? match[1]?.replace("EE en Em N aR Rafts gga Sifter As 4 URGuEIGEnCationAuhoRty of India ZZ KAGHAAR Address EE oe or TE aE","").trim() : "Not Found",
    district: match ? match[2]?.replace("DIST ", "").trim() : "Not Found",
    state: match ? match[3]?.replace("a es", "").trim()  : "Not Found",
    pinCode: match ? match[4] : "Not Found"
  };
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
