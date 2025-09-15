const fs = require('fs');
const path = require('path');

async function testOCRFallback() {
  try {
    console.log('Testing OCR fallback mechanism...');
    
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
    
    // Test the existing OCR fallback (OCR.Space)
    console.log('Testing OCR.Space fallback...');
    
    try {
      // OCR.Space API key
      const apiKey = 'K88032051088957';
      
      console.log('Sending PDF to OCR.Space API...');
      
      // Convert PDF buffer to base64
      const base64Pdf = fileBuffer.toString('base64');
      
      // OCR.Space API endpoint
      const ocrSpaceApiUrl = 'https://api.ocr.space/parse/image';
      
      // Prepare form data
      const formData = new FormData();
      formData.append('base64Image', `data:application/pdf;base64,${base64Pdf}`);
      formData.append('apikey', apiKey);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      formData.append('filetype', 'PDF');
      
      // Send request to OCR.Space API
      const response = await fetch(ocrSpaceApiUrl, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        // If the file is too large, we'll get a specific error
        const errorText = await response.text();
        console.error(`OCR.Space API request failed: ${response.status} - ${errorText}`);
        throw new Error(`OCR.Space API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      
      console.log('OCR.Space API response:', JSON.stringify(result, null, 2));
      
      // Check if OCR was successful
      if (result.OCRExitCode === 1) {
        // Extract text from all pages
        let fullText = '';
        if (result.ParsedResults && Array.isArray(result.ParsedResults)) {
          fullText = result.ParsedResults.map((page) => page.ParsedText).join('\n\n');
        }
        
        console.log(`OCR completed, total extracted text length: ${fullText.length}`);
        
        if (fullText.trim().length > 0) {
          console.log('✓ OCR.Space test successful! Extracted text:');
          console.log('First 500 characters:');
          console.log(fullText.substring(0, 500));
        } else {
          console.log('✗ OCR.Space test failed - no text extracted');
        }
      } else {
        throw new Error(`OCR.Space API error: ${result.ErrorMessage || 'Unknown error'}`);
      }
    } catch (ocrError) {
      console.error('Error in OCR.Space test:', ocrError);
    }
    
  } catch (error) {
    console.error('Error in OCR fallback test:', error);
  }
}

testOCRFallback();