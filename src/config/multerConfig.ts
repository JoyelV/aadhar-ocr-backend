import multer from "multer";
import { AadhaarValidationError } from '../utlis/errors';

// Configure Multer for file uploads
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AadhaarValidationError('Only JPEG and PNG images are allowed'));
    }
  },
});

export default upload;