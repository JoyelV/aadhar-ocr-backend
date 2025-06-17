interface OCRServiceInterface {
  recognizeText(buffer: Buffer): Promise<string>;
}

export default OCRServiceInterface;