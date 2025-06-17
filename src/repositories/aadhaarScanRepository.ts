import AadhaarScan from '../models/AadhaarScan.js';
import AadhaarScanRepositoryInterface from '../interfaces/aadhaarScanRepositoryInterface.js';
import { AadhaarDetails } from '../types/aadhaarTypes.js';

class AadhaarScanRepository implements AadhaarScanRepositoryInterface {
  async saveScan(userId: string, frontImage: string, backImage: string, parsedData: AadhaarDetails): Promise<void> {
    const scan = new AadhaarScan({
      userId,
      frontImage,
      backImage,
      parsedData,
    });
    await scan.save();
  }

  async findByUserId(userId: string): Promise<any[]> {
    return await AadhaarScan.find({ userId })
      .select('frontImage backImage parsedData createdAt')
      .sort({ createdAt: -1 });
  }
}

export default AadhaarScanRepository;