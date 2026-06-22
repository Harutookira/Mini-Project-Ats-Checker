// Full test of the OCR process
const fs = require('fs');
const path = require('path');

async function testFullOCRProcess() {
  console.log('Testing full OCR process with OCR.Space API...');
  
  try {
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
    
    // Test the direct PDF processing approach first
    console.log('Testing direct PDF processing with OCR.Space API...');
    
    // OCR.Space API key (provided by user)
    const apiKey = 'K88032051088957';
    
    // Convert PDF buffer to base64
    const base64Pdf = fileBuffer.toString('base64');
    
    // OCR.Space API endpoint
    const ocrSpaceApiUrl = 'https://api.ocr.space/parse/image';
    
    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('base64Image', `data:application/pdf;base64,${base64Pdf}`);
    formData.append('apikey', apiKey);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('filetype', 'PDF');
    
    console.log('Sending request to OCR.Space API...');
    
    // Send request to OCR.Space API
    const response = await fetch(ocrSpaceApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      // If the file is too large, we'll get a specific error
      const errorText = await response.text();
      console.error('OCR.Space API request failed:', errorText);
      
      // Check if it's a file size error
      if (errorText.includes('File size exceeds')) {
        console.log('File too large for direct processing, would need page-by-page processing');
        console.log('In a real implementation, we would split the PDF into pages and process each page individually');
        return;
      }
      
      throw new Error(`OCR.Space API request failed with status ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('OCR.Space API response received');
    
    // Check if OCR was successful
    if (result.OCRExitCode === 1) {
      // Extract text from all pages
      let fullText = '';
      if (result.ParsedResults && Array.isArray(result.ParsedResults)) {
        fullText = result.ParsedResults.map((page) => page.ParsedText).join('\n\n');
      }
      
      console.log(`OCR completed, total extracted text length: ${fullText.length}`);
      
      if (fullText.trim().length > 0) {
        console.log('✓ OCR process successful! Extracted text:');
        console.log('First 500 characters:');
        console.log(fullText.substring(0, 500));
      } else {
        console.log('✗ OCR process completed but no text was extracted');
      }
    } else {
      console.log('OCR failed with exit code:', result.OCRExitCode);
      console.log('Error message:', result.ErrorMessage);
      
      // Check if it's a file size error
      if (result.ErrorMessage && result.ErrorMessage.includes('File size exceeds')) {
        console.log('File too large for direct processing, would need page-by-page processing');
        console.log('In a real implementation, we would split the PDF into pages and process each page individually');
      }
    }
  } catch (error) {
    console.error('Error in full OCR process test:', error);
  }
}

testFullOCRProcess();