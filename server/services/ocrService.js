import Tesseract from 'tesseract.js';

/**
 * Extracts all visible printed text from an image file
 * @param {string} imagePath - Path to the image on local disk
 * @returns {Promise<string>} - Cleaned extracted text string
 */
export async function extractTextFromImage(imagePath) {
  try {
    console.log(`📑 Running OCR on: ${imagePath}...`);

    // Recognize text using Tesseract English model
    const result = await Tesseract.recognize(imagePath, 'eng', {
      logger: (m) => {
        // Optional: logs OCR progress (e.g. 50%, 100%)
        if (m.status === 'recognizing text' && m.progress % 0.5 === 0) {
          console.log(`   OCR Progress: ${(m.progress * 100).toFixed(0)}%`);
        }
      },
    });

    // Clean up extracted text (remove extra spaces and empty newlines)
    const rawText = result.data.text || '';
    const cleanedText = rawText.replace(/\s+/g, ' ').trim();

    console.log(`✅ OCR Complete! Extracted: "${cleanedText.slice(0, 80)}..."`);
    return cleanedText;
  } catch (error) {
    console.warn('⚠️ OCR extraction failed (continuing without text):', error.message);
    return ''; // Return empty string if OCR fails so photo upload still succeeds
  }
}