const fs = require('fs');
const path = require('path');

// Add DOMMatrix shim for PDF.js compatibility in Node.js environment
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {
    a; b; c; d; e; f;
    m11; m12; m13; m14;
    m21; m22; m23; m24;
    m31; m32; m33; m34;
    m41; m42; m43; m44;
    is2D; isIdentity;
    
    constructor(init) {
      // Initialize with identity matrix values
      this.a = this.m11 = 1; this.b = this.m12 = 0; this.m13 = 0; this.m14 = 0;
      this.c = this.m21 = 0; this.d = this.m22 = 1; this.m23 = 0; this.m24 = 0;
      this.e = this.m41 = 0; this.f = this.m42 = 0; this.m31 = 0; this.m32 = 0;
      this.m33 = 1; this.m34 = 0; this.m43 = 0; this.m44 = 1;
      this.is2D = true;
      this.isIdentity = true;
    }
    
    // Add static methods to match the DOMMatrix interface
    static fromFloat32Array(array32) {
      return new DOMMatrix(Array.from(array32));
    }
    
    static fromFloat64Array(array64) {
      return new DOMMatrix(Array.from(array64));
    }
    
    static fromMatrix(other) {
      return new DOMMatrix();
    }
    
    // Add basic transformation methods that PDF.js might need
    scale() { return this; }
    translate() { return this; }
    multiply() { return this; }
    rotate() { return this; }
    rotateFromVector() { return this; }
    rotateAxisAngle() { return this; }
    skewX() { return this; }
    skewY() { return this; }
    invert() { return this; }
    transformPoint() { return { x: 0, y: 0, z: 0, w: 1, toJSON: function() { return this; } }; }
    toFloat32Array() { return new Float32Array(16); }
    toFloat64Array() { return new Float64Array(16); }
    toJSON() { return {}; }
  };
}

// Mock canvas for testing
const { createCanvas } = require('canvas');

async function testPDFProcessing() {
  try {
    console.log('Testing PDF processing for: CV Mardika Maulana Syarif 2025.pdf');
    
    // Path to the CV file in public folder
    const filePath = path.join(__dirname, 'public', 'CV Mardika Maulana Syarif 2025.pdf');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return;
    }
    
    // Read file buffer
    const fileBuffer = fs.readFileSync(filePath);
    console.log('File buffer size:', fileBuffer.length);
    
    // Convert Buffer to Uint8Array for PDF.js compatibility
    const uint8Array = new Uint8Array(fileBuffer);
    
    // Load PDF document
    console.log('Loading PDF document...');
    const pdfjsLib = await import('pdfjs-dist');
    const pdfDoc = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    console.log(`PDF loaded with ${pdfDoc.numPages} pages`);
    
    // Process first page only for testing
    const pageNum = 1;
    console.log(`Processing page ${pageNum}...`);
    
    // Get page
    const page = await pdfDoc.getPage(pageNum);
    
    // Get viewport at scale 2 (for better OCR quality)
    const viewport = page.getViewport({ scale: 2 });
    console.log(`Page viewport: width=${viewport.width}, height=${viewport.height}`);
    
    // Create canvas and context using node-canvas
    console.log(`Creating canvas...`);
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');
    console.log(`Canvas created: width=${canvas.width}, height=${canvas.height}`);
    
    // Render page to canvas
    console.log(`Rendering page to canvas...`);
    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: null // Set to null to use canvasContext instead
    }).promise;
    console.log(`Page rendered successfully`);
    
    // Convert canvas to image buffer
    console.log(`Converting canvas to image buffer...`);
    const imageBuffer = canvas.toBuffer('image/png');
    console.log(`Image buffer size: ${imageBuffer.length} bytes`);
    
    // Save image for debugging
    const imagePath = path.join(__dirname, 'test-page-1.png');
    fs.writeFileSync(imagePath, imageBuffer);
    console.log(`Image saved to: ${imagePath}`);
    
    console.log('✓ PDF processing test completed successfully!');
  } catch (error) {
    console.error('Error:', error);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

testPDFProcessing();