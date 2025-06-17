class HistoryService {
    constructor(aadhaarScanRepository) {
        this.aadhaarScanRepository = aadhaarScanRepository;
    }
    async getScanHistory(userId) {
        return await this.aadhaarScanRepository.findByUserId(userId);
    }
}
export default HistoryService;
