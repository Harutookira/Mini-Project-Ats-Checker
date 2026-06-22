const fs = require('fs');
const path = require('path');

// Test file size validation
function testFileSizeValidation() {
  console.log('Testing file size validation...');
  
  // Check if we have any test files
  const testDir = __dirname;
  const files = fs.readdirSync(testDir);
  const testFiles = files.filter(file => 
    file.endsWith('.pdf') || 
    file.endsWith('.doc') || 
    file.endsWith('.docx') || 
    file.endsWith('.txt')
  );
  
  console.log('Found test files:', testFiles);
  
  // Check file sizes
  testFiles.forEach(file => {
    const filePath = path.join(testDir, file);
    const stats = fs.statSync(filePath);
    const sizeInMB = stats.size / (1024 * 1024);
    console.log(`${file}: ${sizeInMB.toFixed(2)} MB`);
    
    if (stats.size > 1048576) { // 1MB in bytes
      console.log(`⚠️  ${file} exceeds 1MB limit`);
    } else {
      console.log(`✅ ${file} is within 1MB limit`);
    }
  });
  
  if (testFiles.length === 0) {
    console.log('No test files found. Creating a sample file...');
    
    // Create a sample text file
    const sampleText = `CURRICULUM VITAE

PERSONAL INFORMATION
Name: John Doe
Email: john.doe@example.com
Phone: +1 234 567 8900
Address: 123 Main Street, New York, NY 10001

PROFESSIONAL SUMMARY
Experienced software developer with 5+ years of expertise in web development, 
cloud technologies, and agile methodologies. Passionate about creating efficient 
and scalable solutions.

WORK EXPERIENCE

Senior Software Engineer
Tech Solutions Inc., New York, NY
June 2020 - Present
• Developed and maintained multiple web applications using React and Node.js
• Led a team of 3 developers in implementing microservices architecture
• Improved application performance by 40% through code optimization

Software Developer
Innovate Corp., Boston, MA
January 2018 - May 2020
• Built RESTful APIs using Express.js and MongoDB
• Collaborated with UX designers to implement responsive user interfaces
• Participated in code reviews and mentored junior developers

EDUCATION

Master of Science in Computer Science
University of Technology, 2017

Bachelor of Science in Software Engineering
State University, 2015

SKILLS
• Programming: JavaScript, Python, Java
• Web Technologies: React, Node.js, HTML5, CSS3
• Databases: MongoDB, PostgreSQL, Redis
• Cloud: AWS, Docker, Kubernetes
• Tools: Git, Jenkins, Jira`;
    
    const sampleFilePath = path.join(testDir, 'sample-cv.txt');
    fs.writeFileSync(sampleFilePath, sampleText);
    console.log('Created sample CV file:', sampleFilePath);
    
    const sampleStats = fs.statSync(sampleFilePath);
    const sampleSizeInMB = sampleStats.size / (1024 * 1024);
    console.log(`Sample file size: ${sampleSizeInMB.toFixed(2)} MB`);
  }
}

testFileSizeValidation();