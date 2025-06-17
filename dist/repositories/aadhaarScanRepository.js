import AadhaarScan from '../models/AadhaarScan.js';
class AadhaarScanRepository {
    async saveScan(userId, frontImage, backImage, parsedData) {
        const scan = new AadhaarScan({
            userId,
            frontImage,
            backImage,
            parsedData,
        });
        await scan.save();
    }
    async findByUserId(userId) {
        return await AadhaarScan.find({ userId })
            .select('frontImage backImage parsedData createdAt')
            .sort({ createdAt: -1 });
    }
}
export default AadhaarScanRepository;
