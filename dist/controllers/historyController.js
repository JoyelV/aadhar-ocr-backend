class HistoryController {
    constructor(historyService) {
        this.historyService = historyService;
    }
    async getScanHistory(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const scans = await this.historyService.getScanHistory(userId);
            res.json(scans);
        }
        catch (error) {
            console.error('History Error:', error);
            res.status(500).json({ message: 'Failed to fetch scan history' });
        }
    }
}
export default HistoryController;
