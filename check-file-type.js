const fs = require('fs');

// Read the first few bytes of the file to determine its type
function getFileType(filePath) {
  try {
    const buffer = fs.readFileSync(filePath, { start: 0, end: 10 });
    const hex = buffer.toString('hex').toUpperCase();
    
    console.log('File header (hex):', hex);
    
    // Check for PDF signature
    if (hex.startsWith('25504446')) { // %PDF
      return 'application/pdf';
    }
    
    // Check for other signatures
    if (hex.startsWith('504B0304')) { // PK (ZIP)
      return 'application/zip';
    }
    
    if (hex.startsWith('D0CF11E0A1B11AE1')) { // Microsoft Office
      return 'application/msword';
    }
    
    return 'unknown';
  } catch (error) {
    console.error('Error reading file:', error);
    return 'error';
  }
}

const fileType = getFileType('test-cv.pdf');
console.log('Detected file type:', fileType);