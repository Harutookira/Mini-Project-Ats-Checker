const fs = require('fs');
const { createCanvas } = require('canvas');

// Create a simple image with text to simulate an image-based PDF
function createTestImage() {
  const canvas = createCanvas(600, 800);
  const ctx = canvas.getContext('2d');
  
  // White background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 600, 800);
  
  // Black text
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  
  // Add some text to the image
  const lines = [
    'CV TEST DOCUMENT',
    'Name: John Doe',
    'Email: john.doe@example.com',
    'Phone: +1-555-123-4567',
    '',
    'PROFESSIONAL SUMMARY',
    'Experienced software engineer with 5+ years of expertise in',
    'developing web applications using modern technologies.',
    'Skilled in JavaScript, TypeScript, React, and Node.js.',
    '',
    'WORK EXPERIENCE',
    'Senior Software Engineer | Tech Corp | 2020-Present',
    '• Developed scalable web applications using React and Node.js',
    '• Implemented CI/CD pipelines reducing deployment time by 50%',
    '• Mentored junior developers and conducted code reviews',
    '',
    'Software Developer | Innovate LLC | 2018-2020',
    '• Built responsive user interfaces with modern CSS frameworks',
    '• Integrated RESTful APIs and third-party services',
    '• Collaborated with UX designers to implement pixel-perfect designs',
    '',
    'EDUCATION',
    'B.S. Computer Science | University of Technology | 2014-2018',
    '• Graduated with honors',
    '• Relevant coursework: Data Structures, Algorithms, Database Systems'
  ];
  
  // Draw text lines
  let y = 50;
  lines.forEach(line => {
    ctx.fillText(line, 30, y);
    y += 30;
  });
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('test-image.png', buffer);
  console.log('Test image created: test-image.png');
}

createTestImage();