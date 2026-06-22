require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Get the API key from environment variables
const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  console.error('❌ No API key found in environment variables');
  console.error('Please set GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY');
  process.exit(1);
}

console.log('✅ API key found');

async function testGoogleAI() {
  try {
    console.log('Testing Google Generative AI connection...');
    
    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try to list available models
    try {
      console.log('Attempting to list models...');
      // Note: The listModels method might not be available in all versions
      // Let's try a simpler approach first
    } catch (listError) {
      console.log('List models not available or failed:', listError.message);
    }
    
    // Try different models
    const modelsToTest = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest',
      'gemini-pro',
      'gemini-1.0-pro'
    ];
    
    for (const modelId of modelsToTest) {
      try {
        console.log(`\nTrying model: ${modelId}`);
        
        const model = genAI.getGenerativeModel({ model: modelId });
        const result = await model.generateContent('Say hello in Indonesian');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ ${modelId} is working!`);
        console.log('Response:', text);
        return; // Exit after first successful model
      } catch (error) {
        console.log(`❌ ${modelId} failed:`, error.message);
      }
    }
    
    console.error('All models failed');
  } catch (error) {
    console.error('❌ Google Generative AI test failed:', error.message);
    console.error('Error details:', error);
  }
}

testGoogleAI();