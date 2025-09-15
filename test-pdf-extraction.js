const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function testPDFExtraction() {
  try {
    console.log('Testing CV file: CV Mardika Maulana Syarif 2025.pdf');
    
    // Path to the CV file in public folder
    const filePath = path.join(__dirname, 'public', 'CV Mardika Maulana Syarif 2025.pdf');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return;
    }
    
    // Get file stats
    const stats = fs.statSync(filePath);
    console.log('File size:', stats.size, 'bytes');
    
    // Read file buffer
    const fileBuffer = fs.readFileSync(filePath);
    console.log('Buffer size:', fileBuffer.length, 'bytes');
    
    // Try to extract text from PDF using pdf-parse
    console.log('Attempting to extract text from PDF using pdf-parse...');
    const pdfData = await pdfParse(fileBuffer);
    
    console.log('PDF parsing completed.');
    console.log('Number of pages:', pdfData.numpages);
    console.log('Extracted text length:', pdfData.text.length);
    
    if (pdfData.text.trim().length === 0) {
      console.log('WARNING: No text was extracted from the PDF!');
      console.log('This could indicate that the PDF is image-based and requires OCR.');
    } else {
      console.log('Sample of extracted text:');
      console.log('--- START SAMPLE ---');
      console.log(pdfData.text.substring(0, 1000));
      console.log('--- END SAMPLE ---');
    }
    
  } catch (error) {
    console.error('Error testing PDF extraction:', error);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

testPDFExtraction();