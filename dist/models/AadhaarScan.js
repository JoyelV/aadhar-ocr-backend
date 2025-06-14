import mongoose, { Schema } from 'mongoose';
const aadhaarScanSchema = new Schema({
    userId: { type: String, required: true },
    frontImage: { type: String, required: true }, // Base64-encoded image
    backImage: { type: String, required: true },
    parsedData: {
        name: String,
        aadhaarNumber: String,
        dob: String,
        gender: String,
        address: String,
        pinCode: String,
    },
    createdAt: { type: Date, default: Date.now },
});
export default mongoose.model('AadhaarScan', aadhaarScanSchema);
