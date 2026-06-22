const { createWorker } = require('tesseract.js');

async function simpleOCRTest() {
  try {
    console.log('Testing Tesseract.js OCR with a simple example...');
    
    // Create a simple test with Tesseract.js
    const worker = await createWorker('eng');
    
    // Test with a simple image URL
    console.log('Performing OCR on a test image...');
    const ret = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
    await worker.terminate();
    
    console.log('OCR Result:');
    console.log('Text length:', ret.data.text.length);
    console.log('Extracted text:');
    console.log(ret.data.text);
    
    console.log('✓ OCR test completed successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

simpleOCRTest();