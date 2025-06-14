import mongoose, { Schema, Document } from 'mongoose';

interface IAadhaarScan extends Document {
  userId: string;
  frontImage: string;
  backImage: string;
  parsedData: {
    name: string;
    aadhaarNumber: string;
    dob: string;
    gender: string;
    address: string;
    pinCode: string;
  };
  createdAt: Date;
}

const aadhaarScanSchema: Schema = new Schema({
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

export default mongoose.model<IAadhaarScan>('AadhaarScan', aadhaarScanSchema);