import mongoose from 'mongoose';
const aadhaarScanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    frontImage: {
        type: String,
        required: true,
    },
    backImage: {
        type: String,
        required: true,
    },
    parsedData: {
        aadhaarNumber: { type: String, required: false },
        name: { type: String, required: false },
        dob: { type: String, required: false },
        gender: { type: String, required: false },
        address: { type: String, required: false },
        error: { type: String, required: false },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
export default mongoose.model('AadhaarScan', aadhaarScanSchema);
