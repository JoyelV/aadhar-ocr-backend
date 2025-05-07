import { Request } from "express";
import { recognizeText } from "../repositories/orcRepository.js";
import { parseAadhaarData } from "../utils/aadhaarParser.js";
import { deleteFiles } from "../utils/fileUtils.js";

export const performOCR = async (req: Request) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  if (!files.aadhaarFront || !files.aadhaarBack) {
    throw new Error("Both front and back Aadhaar images are required!");
  }

  const frontImage = files.aadhaarFront[0].path;
  const backImage = files.aadhaarBack[0].path;

  try {
    const frontText = await recognizeText(frontImage);
    const backText = await recognizeText(backImage);

    return parseAadhaarData(frontText, backText);
  } finally {
    deleteFiles([frontImage, backImage]);
  }
};
