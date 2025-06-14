import AadhaarScan from '../models/AadhaarScan.js';
export const getScanHistory = async (req, res) => {
    try {
        const scans = await AadhaarScan.find({ userId: req.user?.userId })
            .select('frontImage backImage parsedData createdAt')
            .sort({ createdAt: -1 }); // Sort by newest first
        res.json(scans);
    }
    catch (error) {
        console.error('History Error:', error);
        res.status(500).json({ message: 'Failed to fetch scan history' });
    }
};
