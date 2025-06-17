import AadhaarScanRepositoryInterface from '../interfaces/aadhaarScanRepositoryInterface.js';

class HistoryService {
  private aadhaarScanRepository: AadhaarScanRepositoryInterface;

  constructor(aadhaarScanRepository: AadhaarScanRepositoryInterface) {
    this.aadhaarScanRepository = aadhaarScanRepository;
  }

  async getScanHistory(userId: string): Promise<any[]> {
    return await this.aadhaarScanRepository.findByUserId(userId);
  }
}

export default HistoryService;