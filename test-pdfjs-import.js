const fs = require('fs');
const path = require('path');

// Test if we can import pdfjs-dist without errors
async function testPDFJSImport() {
  try {
    console.log('Testing pdfjs-dist import...');
    const pdfjsLib = await import('pdfjs-dist');
    console.log('✓ pdfjs-dist imported successfully');
    
    // Test if we can access the library
    console.log('pdfjsLib type:', typeof pdfjsLib);
    console.log('pdfjsLib keys:', Object.keys(pdfjsLib).slice(0, 5));
    
  } catch (error) {
    console.error('Error importing pdfjs-dist:', error);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

testPDFJSImport();