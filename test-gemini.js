require('dotenv').config({ path: '.env.local' });
const { google } = require('@ai-sdk/google');
const { generateText } = require('ai');

// Get the API key from environment variables
const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  console.error('❌ No API key found in environment variables');
  console.error('Please set GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY');
  process.exit(1);
}

console.log('✅ API key found');

// Try different models including preview models
const modelsToTest = [
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash-thinking-exp-1219',
  'gemini-2.0-pro-exp',
  'gemini-1.5-flash-002',
  'gemini-1.5-pro-002',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

async function testGemini() {
  console.log('Testing Gemini AI connection...');
  
  for (const modelId of modelsToTest) {
    try {
      console.log(`\nTrying model: ${modelId}`);
      
      const { text } = await generateText({
        model: google(modelId),
        prompt: 'Say hello in Indonesian',
      });
      
      console.log(`✅ ${modelId} is working!`);
      console.log('Response:', text);
      return; // Exit after first successful model
    } catch (error) {
      console.log(`❌ ${modelId} failed:`, error.message);
    }
  }
  
  console.error('All models failed');
}

testGemini();