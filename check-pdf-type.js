const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function checkPDFType() {
  try {
    console.log('Checking PDF type for: CV Mardika Maulana Syarif 2025.pdf');
    
    // Path to the CV file in public folder
    const filePath = path.join(__dirname, 'public', 'CV Mardika Maulana Syarif 2025.pdf');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return;
    }
    
    // Read file buffer
    const fileBuffer = fs.readFileSync(filePath);
    
    console.log('File size:', fileBuffer.length, 'bytes');
    
    // Try to extract text using pdf-parse
    console.log('Attempting to extract text with pdf-parse...');
    const pdfData = await pdfParse(fileBuffer);
    
    console.log('PDF Info:');
    console.log('- Number of pages:', pdfData.numpages);
    console.log('- Text length:', pdfData.text.length);
    console.log('- Metadata:', pdfData.info);
    
    if (pdfData.text.trim().length > 0) {
      console.log('✓ This is a text-based PDF');
      console.log('First 500 characters of extracted text:');
      console.log(pdfData.text.substring(0, 500));
    } else {
      console.log('✗ This appears to be an image-based PDF (scanned document)');
      console.log('No text could be extracted - OCR will be needed');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPDFType();