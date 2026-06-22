const fs = require('fs');
const path = require('path');

// Create a simple text-based PDF for testing
const testText = `
CURRICULUM VITAE

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
• Tools: Git, Jenkins, Jira
`;

// Write to a test file
const testFilePath = path.join(__dirname, 'test-simple-cv.txt');
fs.writeFileSync(testFilePath, testText);
console.log('Created test file:', testFilePath);
console.log('You can convert this to PDF using online tools or word processors for testing');