import { performOCR } from "../services/orcService.js";
export const uploadAadhaar = async (req, res) => {
    try {
        const result = await performOCR(req);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ error: "OCR Processing Failed!", details: error.message });
    }
};
