class AadhaarParseController {
    constructor(aadhaarParseService) {
        this.aadhaarParseService = aadhaarParseService;
    }
    async parseAadhaar(req, res) {
        try {
            const { frontText, backText } = req.body;
            if (!frontText || !backText) {
                res.status(400).json({ message: 'Front and back text are required' });
                return;
            }
            const details = await this.aadhaarParseService.parseAadhaarData(frontText, backText);
            res.json(details);
        }
        catch (error) {
            console.error('Parse Error:', error);
            res.status(400).json({ message: error.message || 'Failed to parse Aadhaar data' });
        }
    }
}
export default AadhaarParseController;
