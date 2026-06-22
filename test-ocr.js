const fs = require('fs');
const path = require('path');

async function testOCR() {
  try {
    // Use our newly created test file
    const filePath = path.join(__dirname, 'test-ocr-document.pdf');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('Test file not found. Please run create-test-pdf.js first.');
      return;
    }
    
    const fileBuffer = fs.readFileSync(filePath);
    
    // Create a proper File object with correct MIME type
    const file = new File([fileBuffer], 'test-ocr-document.pdf', { type: 'application/pdf' });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobName', 'Software Engineer');
    formData.append('jobDescription', 'Looking for experienced software engineer with OCR capabilities');
    
    console.log('Uploading file for OCR testing...');
    
    const response = await fetch('http://localhost:3001/api/analyze-cv', {
      method: 'POST',
      body: formData
    });
    
    console.log('Response status:', response.status);
    
    if (response.status === 200) {
      const result = await response.json();
      console.log('Success! File processed.');
      console.log('Extracted text length:', result.analysis.extractedText.length);
      console.log('First 500 characters of extracted text:');
      console.log(result.analysis.extractedText.substring(0, 500));
      
      // Check if OCR was used (this is a heuristic check)
      if (result.analysis.extractedText.length > 0) {
        console.log('✓ Text was successfully extracted from the PDF');
      }
    } else {
      const text = await response.text();
      console.log('Error response:', text);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testOCR();