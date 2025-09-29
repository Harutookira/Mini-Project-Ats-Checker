const { google } = require('@ai-sdk/google');

console.log('Testing available models...');

// Try different model identifiers
const modelIds = [
  'gemini-1.5-flash',
  'models/gemini-1.5-flash',
  'gemini-1.5-flash-001',
  'models/gemini-1.5-flash-001',
  'gemini-pro',
  'models/gemini-pro',
  'gemini-1.0-pro',
  'models/gemini-1.0-pro'
];

console.log('Available model identifiers:');
modelIds.forEach(id => {
  try {
    const model = google(id);
    console.log(`✓ ${id} - OK`);
  } catch (error) {
    console.log(`✗ ${id} - Error: ${error.message}`);
  }
});