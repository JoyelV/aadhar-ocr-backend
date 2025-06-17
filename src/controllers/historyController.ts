import { Request, Response } from 'express';
import HistoryService from '../services/historyService.js';

interface AuthRequest extends Request {
  user?: { userId: string };
}

class HistoryController {
  private historyService: HistoryService;

  constructor(historyService: HistoryService) {
    this.historyService = historyService;
  }

  async getScanHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const scans = await this.historyService.getScanHistory(userId);
      res.json(scans);
    } catch (error: any) {
      console.error('History Error:', error);
      res.status(500).json({ message: 'Failed to fetch scan history' });
    }
  }
}

export default HistoryController;