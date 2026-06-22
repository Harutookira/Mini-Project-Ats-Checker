const fs = require('fs');
const path = require('path');

async function testCVUpload() {
  try {
    console.log('Testing CV upload: CV Mardika Maulana Syarif 2025.pdf');
    
    // Path to the CV file in public folder
    const filePath = path.join(__dirname, 'public', 'CV Mardika Maulana Syarif 2025.pdf');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return;
    }
    
    // Read file buffer
    const fileBuffer = fs.readFileSync(filePath);
    
    // Create a proper File object (Node.js doesn't have File, so we'll create a mock)
    const file = {
      arrayBuffer: async () => fileBuffer,
      name: 'CV Mardika Maulana Syarif 2025.pdf',
      type: 'application/pdf',
      size: fileBuffer.length
    };
    
    // Create form data using a simple approach
    const formData = new URLSearchParams();
    
    // For testing purposes, we'll send the file as a base64 encoded string
    const base64File = fileBuffer.toString('base64');
    
    console.log('Uploading file to API...');
    
    // Upload to the API endpoint
    const response = await fetch('http://localhost:3000/api/analyze-cv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileData: base64File,
        jobName: 'Software Engineer',
        jobDescription: 'Looking for experienced software engineer'
      })
    });
    
    console.log('Response status:', response.status);
    
    if (response.status === 200) {
      const result = await response.json();
      console.log('Success! File processed.');
      console.log('Overall score:', result.analysis.overallScore);
      console.log('Extracted text length:', result.analysis.extractedText.length);
      
      if (result.analysis.extractedText.length > 0) {
        console.log('First 500 characters of extracted text:');
        console.log(result.analysis.extractedText.substring(0, 500));
      } else {
        console.log('No text was extracted from the file.');
      }
      
      // Check if OCR was used
      if (result.analysis.extractedText.length > 0) {
        console.log('✓ Text was successfully extracted from the PDF (likely using OCR for image-based PDF)');
      }
    } else {
      const text = await response.text();
      console.log('Error response:', text);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testCVUpload();