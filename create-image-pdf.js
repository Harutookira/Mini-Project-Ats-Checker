const fs = require('fs');
const { createCanvas } = require('canvas');

async function createImageBasedPDF() {
  try {
    console.log('Creating image-based PDF for OCR testing...');
    
    // Create a canvas with text
    const canvas = createCanvas(600, 800);
    const ctx = canvas.getContext('2d');
    
    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 600, 800);
    
    // Black text
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillText('OCR Test Document', 50, 50);
    
    ctx.font = '18px Arial';
    ctx.fillText('Name: John Doe', 50, 100);
    ctx.fillText('Email: john.doe@example.com', 50, 130);
    ctx.fillText('Phone: +1-555-123-4567', 50, 160);
    
    ctx.font = '20px Arial';
    ctx.fillText('PROFESSIONAL SUMMARY', 50, 210);
    
    ctx.font = '16px Arial';
    const summaryLines = [
      'Experienced software engineer with 5+ years of expertise in',
      'developing web applications using modern technologies.',
      'Skilled in JavaScript, TypeScript, React, and Node.js.'
    ];
    
    summaryLines.forEach((line, i) => {
      ctx.fillText(line, 50, 240 + i * 25);
    });
    
    ctx.font = '20px Arial';
    ctx.fillText('WORK EXPERIENCE', 50, 340);
    
    ctx.font = '18px Arial';
    ctx.fillText('Senior Software Engineer | Tech Corp | 2020-Present', 50, 370);
    
    ctx.font = '16px Arial';
    const experienceLines = [
      '• Developed scalable web applications using React and Node.js',
      '• Implemented CI/CD pipelines reducing deployment time by 50%',
      '• Mentored junior developers and conducted code reviews'
    ];
    
    experienceLines.forEach((line, i) => {
      ctx.fillText(line, 50, 400 + i * 25);
    });
    
    ctx.font = '20px Arial';
    ctx.fillText('EDUCATION', 50, 500);
    
    ctx.font = '18px Arial';
    ctx.fillText('B.S. Computer Science | University of Technology | 2014-2018', 50, 530);
    
    ctx.font = '16px Arial';
    ctx.fillText('• Graduated with honors', 50, 560);
    ctx.fillText('• Relevant coursework: Data Structures, Algorithms, Database Systems', 50, 590);
    
    // Convert canvas to image buffer
    const imageBuffer = canvas.toBuffer('image/png');
    
    // Save the image for reference
    fs.writeFileSync('test-cv-image.png', imageBuffer);
    console.log('Test image created: test-cv-image.png');
    
    // For now, we'll just save the image since creating a PDF with jspdf in Node.js 
    // requires additional setup. In a real implementation, we would create a PDF
    // with this image as the content.
    console.log('✓ Image-based content created successfully!');
    console.log('Note: In a real implementation, this image would be embedded in a PDF for OCR testing.');
  } catch (error) {
    console.error('Error creating image-based content:', error);
  }
}

createImageBasedPDF();