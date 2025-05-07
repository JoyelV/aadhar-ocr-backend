import express from "express";
import { upload } from "../config/multerConfig.js";
import { uploadAadhaar } from "../controllers/orcControllers.js";
const router = express.Router();
router.post("/upload", upload.fields([{ name: "aadhaarFront" }, { name: "aadhaarBack" }]), uploadAadhaar);
export default router;
