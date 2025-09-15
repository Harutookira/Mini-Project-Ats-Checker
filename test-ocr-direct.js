const fs = require('fs');
const path = require('path');
const { createWorker } = require('tesseract.js');

async function testOCRDirect() {
  try {
    console.log('Testing OCR directly with an image...');
    
    // Create a simple text image using Jimp
    const Jimp = require('jimp');
    
    // Create a new image
    const image = await Jimp.create(600, 400, 0xFFFFFFFF); // White background
    
    // Add text to the image (using a simpler approach)
    const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
    image.print(font, 50, 50, 'OCR Test Document');
    image.print(font, 50, 100, 'Name: John Doe');
    image.print(font, 50, 150, 'Email: john.doe@example.com');
    image.print(font, 50, 200, 'Phone: +1-555-123-4567');
    image.print(font, 50, 250, 'Software Engineer');
    image.print(font, 50, 300, '5+ years experience');
    
    // Save the image
    await image.writeAsync('test-ocr-image.png');
    console.log('Test image created: test-ocr-image.png');
    
    // Perform OCR on the image
    console.log('Performing OCR on the image...');
    const worker = await createWorker('eng');
    const ret = await worker.recognize('test-ocr-image.png');
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

testOCRDirect();