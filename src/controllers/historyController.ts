import { Request, Response } from 'express';
import AadhaarScan from '../models/AadhaarScan.js';

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const getScanHistory = async (req: AuthRequest, res: Response) => {
  try {
    const scans = await AadhaarScan.find({ userId: req.user?.userId })
      .select('frontImage backImage parsedData createdAt')
      .sort({ createdAt: -1 }); // Sort by newest first
    res.json(scans);
  } catch (error) {
    console.error('History Error:', error);
    res.status(500).json({ message: 'Failed to fetch scan history' });
  }
};

export const deleteScan = async (req: AuthRequest, res: Response) => {
  try {
    const { scanId } = req.params;
    const userId = req.user?.userId;

    if (!scanId) {
       res.status(400).json({ message: 'Scan ID is required' });
       return;
    }
    const scan = await AadhaarScan.findOneAndDelete({ _id: scanId, userId });
    if (!scan) {
       res.status(404).json({ message: 'Scan not found or you do not have permission to delete it' });
       return;
    }

    res.status(200).json({ message: 'Scan deleted successfully' });
  } catch (error: any) {
    console.error('Delete Scan Error:', error);
    res.status(500).json({ message: 'Failed to delete scan', error: error.message });
  }
};