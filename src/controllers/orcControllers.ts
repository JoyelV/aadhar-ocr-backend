import { Request, Response } from "express";
import { performOCR } from "../services/orcService.js";

export const uploadAadhaar = async (req: Request, res: Response) => {
  try {
    const result = await performOCR(req);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: "OCR Processing Failed!", details: (error as Error).message });
  }
};
