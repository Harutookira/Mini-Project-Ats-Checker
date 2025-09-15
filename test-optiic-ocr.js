const fs = require('fs');
const path = require('path');
const Optiic = require('optiic');

async function testOptiicOCR() {
  try {
    console.log('Testing Optiic OCR extraction using npm package...');
    
    // Path to the CV file in public folder
    const filePath = path.join(__dirname, 'public', 'CV Mardika Maulana Syarif 2025.pdf');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return;
    }
    
    // Read file buffer
    const fileBuffer = fs.readFileSync(filePath);
    console.log('File loaded, size:', fileBuffer.length, 'bytes');
    
    // Test Optiic OCR directly using the npm package
    console.log('Testing Optiic OCR with API key...');
    
    // Initialize Optiic with API key
    const optiic = new Optiic({
      apiKey: 'FKnrnrtmav8r5bDPyuTm37Kt5Y62mbWpzA2Jkz7JtsH2'
    });
    
    console.log('Sending PDF to Optiic API using npm package...');
    
    // Process the PDF file
    const result = await optiic.process({
      image: filePath, // Local file path
      mode: 'ocr'
    });
    
    console.log('Optiic API response:', JSON.stringify(result, null, 2));
    
    // Extract text from the response
    let fullText = '';
    if (result.text) {
      fullText = result.text;
    }
    
    console.log(`OCR completed, total extracted text length: ${fullText.length}`);
    
    if (fullText.trim().length > 0) {
      console.log('✓ Optiic OCR test successful! Extracted text:');
      console.log('First 500 characters:');
      console.log(fullText.substring(0, 500));
    } else {
      console.log('✗ Optiic OCR test failed - no text extracted');
    }
    
  } catch (error) {
    console.error('Error in Optiic OCR test:', error);
  }
}

testOptiicOCR();