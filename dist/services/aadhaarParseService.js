class AadhaarParseService {
    constructor(aadhaarParser) {
        this.aadhaarParser = aadhaarParser;
    }
    async parseAadhaarData(frontText, backText) {
        return this.aadhaarParser.parseAadhaarData(frontText, backText);
    }
}
export default AadhaarParseService;
