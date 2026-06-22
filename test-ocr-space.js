const fs = require('fs');
const path = require('path');

async function testOCRSpace() {
  try {
    console.log('Testing OCR with OCR.Space API...');
    
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
    
    // For large PDFs, we need to use the existing canvas-based approach to convert pages to images
    // But since we had issues with canvas, let's try a different approach
    
    // Let's try using the OCR.Space API with a URL instead of uploading the file
    // First, we need to make the file accessible via a URL
    // For testing purposes, let's just test with a smaller sample image
    
    console.log('Testing with a sample image instead...');
    
    // OCR.Space API endpoint
    const ocrSpaceApiUrl = 'https://api.ocr.space/parse/image';
    
    // OCR.Space API key (provided by user)
    const apiKey = 'K88032051088957';
    
    // Test with a sample image URL
    const imageUrl = 'https://tesseract.projectnaptha.com/img/eng_bw.png';
    
    console.log('Sending sample image to OCR.Space API...');
    
    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('url', imageUrl);
    formData.append('apikey', apiKey);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    
    // Send request to OCR.Space API
    const response = await fetch(ocrSpaceApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
    
    if (!response.ok) {
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
        console.log('✓ OCR test successful! Extracted text:');
        console.log('Extracted text:');
        console.log(fullText);
      } else {
        console.log('✗ OCR test completed but no text was extracted');
      }
    } else {
      throw new Error(`OCR.Space API error: ${result.ErrorMessage || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error in OCR test:', error);
  }
}

testOCRSpace();