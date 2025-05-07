import Tesseract from "tesseract.js";
export const recognizeText = async (imagePath) => {
    const result = await Tesseract.recognize(imagePath, "eng");
    return result.data.text;
};
