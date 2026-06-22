const fs = require('fs');
const path = require('path');

async function testTesseractDebug() {
  try {
    // Check if test PDF file exists
    const pdfPath = path.join(__dirname, 'test-cv.pdf');
    if (!fs.existsSync(pdfPath)) {
      console.log('Test PDF file not found. Looking for other PDF files...');
      
      // Look for any PDF file in the directory
      const files = fs.readdirSync(__dirname);
      const pdfFiles = files.filter(file => file.endsWith('.pdf'));
      
      if (pdfFiles.length > 0) {
        pdfPath = path.join(__dirname, pdfFiles[0]);
        console.log(`Using PDF file: ${pdfFiles[0]}`);
      } else {
        console.log('No PDF files found in directory. Skipping Tesseract test.');
        return;
      }
    }
    
    // Read the PDF file
    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log('PDF file loaded, size:', pdfBuffer.length, 'bytes');
    
    // Test basic PDF parsing first
    console.log('Testing basic PDF parsing...');
    try {
      const pdfParse = require('pdf-parse');
      const pdfData = await pdfParse(pdfBuffer);
      console.log('Basic PDF parsing successful, text length:', pdfData.text.length);
      if (pdfData.text.length > 0) {
        console.log('Text sample:', pdfData.text.substring(0, 200) + '...');
      }
    } catch (parseError) {
      console.error('Basic PDF parsing failed:', parseError.message);
    }
    
    // Test Tesseract.js OCR
    console.log('Testing Tesseract.js OCR...');
    try {
      const { createWorker } = require('tesseract.js');
      const worker = await createWorker('eng');
      console.log('Tesseract worker created successfully');
      
      // Test with a simple text
      const ret = await worker.recognize('Hello World');
      await worker.terminate();
      console.log('Tesseract basic test successful:', ret.data.text);
    } catch (tesseractError) {
      console.error('Tesseract basic test failed:', tesseractError.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testTesseractDebug();