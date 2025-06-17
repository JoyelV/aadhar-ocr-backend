import { AadhaarDetails } from '../types/aadhaarTypes.js';

interface AadhaarScanRepositoryInterface {
  saveScan(userId: string, frontImage: string, backImage: string, parsedData: AadhaarDetails): Promise<void>;
  findByUserId(userId: string): Promise<any[]>;
}

export default AadhaarScanRepositoryInterface;