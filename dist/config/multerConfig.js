import multer from "multer";
import fs from "fs";
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}
// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}.jpg`);
    },
});
export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Only JPEG and PNG images are allowed'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
});
