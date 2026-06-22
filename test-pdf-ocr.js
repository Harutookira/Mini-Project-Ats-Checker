const fs = require('fs');
const path = require('path');

// Mock the Next.js environment
globalThis.window = undefined;

async function testPDFOCR() {
  try {
    console.log('Testing PDF OCR extraction with Optiic...');
    
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
    
    // Test the Optiic OCR function directly
    console.log('Testing Optiic OCR function...');
    
    // Add DOMMatrix shim for PDF.js compatibility in Node.js environment
    if (typeof globalThis.DOMMatrix === 'undefined') {
      globalThis.DOMMatrix = class DOMMatrix {
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
    
    // Test Optiic OCR directly
    console.log('Testing Optiic OCR with API key...');
    
    try {
      // Optiic API key
      const apiKey = 'FKnrnrtmav8r5bDPyuTm37Kt5Y62mbWpzA2Jkz7JtsH2';
      
      console.log('Sending PDF to Optiic API...');
      
      // Create form data for the request
      const formData = new FormData();
      formData.append('apiKey', apiKey);
      formData.append('image', new Blob([fileBuffer], { type: 'application/pdf' }));
      
      // Send request to Optiic API
      const response = await fetch('https://api.optiic.dev/process', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Optiic API request failed: ${response.status} - ${errorText}`);
        throw new Error(`Optiic API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      
      console.log('Optiic API response:', JSON.stringify(result, null, 2));
      
      // Extract text from the response
      let fullText = '';
      if (result.text) {
        fullText = result.text;
      }
      
      console.log(`OCR completed, total extracted text length: ${fullText.length}`);
      
      if (fullText.trim().length > 0) {
        console.log('✓ Optiic OCR test successful! Extracted text:');
        console.log('First 500 characters:');
        console.log(fullText.substring(0, 500));
      } else {
        console.log('✗ Optiic OCR test failed - no text extracted');
      }
      
    } catch (optiicError) {
      console.error('Error in Optiic OCR test:', optiicError);
    }
    
  } catch (error) {
    console.error('Error in PDF OCR test:', error);
  }
}

testPDFOCR();