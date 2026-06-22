const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Convert the CNT logo to a favicon
async function createFavicon() {
  try {
    const inputPath = path.resolve(__dirname, '../public/cnt-logo.png');
    const outputPath = path.resolve(__dirname, '../public/favicon.png');
    
    // Check if the input file exists
    if (!fs.existsSync(inputPath)) {
      console.error('CNT logo not found at:', inputPath);
      return;
    }
    
    // Create favicon from the logo
    await sharp(inputPath)
      .resize(32, 32)
      .png()
      .toFile(outputPath);
      
    console.log('Favicon created successfully at:', outputPath);
  } catch (error) {
    console.error('Error creating favicon:', error);
  }
}

createFavicon();