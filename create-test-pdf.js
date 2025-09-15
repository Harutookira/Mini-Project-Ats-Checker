const fs = require('fs');
const PDFDocument = require('pdfkit');

function createTestPDF() {
  // Create a document
  const doc = new PDFDocument();
  
  // Pipe its output to a file
  doc.pipe(fs.createWriteStream('test-ocr-document.pdf'));
  
  // Add some content
  doc.fontSize(20).text('OCR Test Document', 100, 100);
  doc.fontSize(14).text('Name: John Doe', 100, 150);
  doc.text('Email: john.doe@example.com', 100, 180);
  doc.text('Phone: +1-555-123-4567', 100, 210);
  
  doc.moveDown();
  doc.fontSize(16).text('PROFESSIONAL SUMMARY', 100, 260);
  doc.fontSize(12).text('Experienced software engineer with 5+ years of expertise in developing web applications using modern technologies. Skilled in JavaScript, TypeScript, React, and Node.js.', 100, 290);
  
  doc.moveDown();
  doc.fontSize(16).text('WORK EXPERIENCE', 100, 360);
  doc.fontSize(14).text('Senior Software Engineer | Tech Corp | 2020-Present', 100, 390);
  doc.fontSize(12).text('• Developed scalable web applications using React and Node.js', 100, 420);
  doc.text('• Implemented CI/CD pipelines reducing deployment time by 50%', 100, 440);
  doc.text('• Mentored junior developers and conducted code reviews', 100, 460);
  
  doc.moveDown();
  doc.fontSize(14).text('Software Developer | Innovate LLC | 2018-2020', 100, 510);
  doc.fontSize(12).text('• Built responsive user interfaces with modern CSS frameworks', 100, 540);
  doc.text('• Integrated RESTful APIs and third-party services', 100, 560);
  doc.text('• Collaborated with UX designers to implement pixel-perfect designs', 100, 580);
  
  doc.moveDown();
  doc.fontSize(16).text('EDUCATION', 100, 630);
  doc.fontSize(14).text('B.S. Computer Science | University of Technology | 2014-2018', 100, 660);
  doc.fontSize(12).text('• Graduated with honors', 100, 690);
  doc.text('• Relevant coursework: Data Structures, Algorithms, Database Systems', 100, 710);
  
  // Finalize PDF file
  doc.end();
  
  console.log('Test PDF created: test-ocr-document.pdf');
}

createTestPDF();