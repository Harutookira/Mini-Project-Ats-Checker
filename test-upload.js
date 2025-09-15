const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    const filePath = path.join(__dirname, 'test-cv.pdf');
    const fileBuffer = fs.readFileSync(filePath);
    
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer]), 'test-cv.pdf');
    formData.append('jobName', 'Software Engineer');
    formData.append('jobDescription', 'Looking for experienced software engineer');
    
    const response = await fetch('http://localhost:3000/api/analyze-cv', {
      method: 'POST',
      body: formData
    });
    
    console.log('Response status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
  } catch (error) {
    console.error('Error:', error);
  }
}

testUpload();