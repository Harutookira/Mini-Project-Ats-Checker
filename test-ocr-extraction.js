const fs = require('fs');
const path = require('path');
const pdfjsLib = require('pdfjs-dist');
const { createCanvas } = require('canvas');
const { createWorker } = require('tesseract.js');

async function testOCRExtraction() {
  try {
    console.log('Testing CV file with OCR: CV Mardika Maulana Syarif 2025.pdf');
    
    // Path to the CV file in public folder
    const filePath = path.join(__dirname, 'public', 'CV Mardika Maulana Syarif 2025.pdf');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return;
    }
    
    // Read file buffer
    const fileBuffer = fs.readFileSync(filePath);
    console.log('Buffer size:', fileBuffer.length, 'bytes');
    
    // Set up PDF.js worker
    console.log('Setting up PDF.js worker...');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';
    
    // Load PDF document
    console.log('Loading PDF document...');
    const pdfDoc = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
    console.log(`PDF loaded with ${pdfDoc.numPages} pages`);
    
    let fullText = '';
    
    // Process each page
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      console.log(`Processing page ${pageNum}...`);
      
      try {
        // Get page
        const page = await pdfDoc.getPage(pageNum);
        
        // Get viewport at scale 2 (for better OCR quality)
        const viewport = page.getViewport({ scale: 2 });
        
        // Create canvas and context
        console.log(`Creating canvas for page ${pageNum}...`);
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');
        
        // Render page to canvas
        console.log(`Rendering page ${pageNum} to canvas...`);
        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: null // Set to null to use canvasContext instead
        }).promise;
        
        // Convert canvas to image buffer
        console.log(`Converting canvas to image buffer for page ${pageNum}...`);
        const imageBuffer = canvas.toBuffer('image/png');
        
        // Save image for debugging (optional)
        // fs.writeFileSync(`page-${pageNum}.png`, imageBuffer);
        
        // Perform OCR using Tesseract.js
        console.log(`Performing OCR on page ${pageNum}...`);
        const worker = await createWorker('eng');
        const ret = await worker.recognize(imageBuffer);
        await worker.terminate();
        
        fullText += ret.data.text + '\n\n';
        console.log(`Page ${pageNum} processed, extracted ${ret.data.text.length} characters`);
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
      }
    }
    
    console.log('OCR completed.');
    console.log('Total extracted text length:', fullText.length);
    
    if (fullText.trim().length === 0) {
      console.log('WARNING: No text was extracted using OCR!');
    } else {
      console.log('Sample of extracted text:');
      console.log('--- START SAMPLE ---');
      console.log(fullText.substring(0, 1000));
      console.log('--- END SAMPLE ---');
    }
    
  } catch (error) {
    console.error('Error testing OCR extraction:', error);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

testOCRExtraction();