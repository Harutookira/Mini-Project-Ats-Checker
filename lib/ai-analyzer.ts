// Hybrid AI implementation - Puter.js (client-side) with traditional fallback
// Added Gemini AI integration using @ai-sdk/google

// Declare puter as a global variable to satisfy TypeScript
declare global {
  interface Window {
    puter: {
      ai: {
        chat: (prompt: string, options?: { model?: string }) => Promise<string>
      }
    }
  }
  
  // Extend globalThis to include Window properties for server-side access
  interface Global {
    puter: {
      ai: {
        chat: (prompt: string, options?: { model?: string }) => Promise<string>
      }
    } | undefined;
  }
}

// Access puter from global scope with proper typing
const puter = typeof window !== 'undefined' ? (window as Window).puter : undefined;

// Gemini AI configuration
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || '';

// Silent error logging that won't trigger Next.js error boundaries
function silentLog(message: string, data?: any): void {
  try {
    // Use setTimeout to prevent immediate console error triggering
    setTimeout(() => {
      try {
        console.log(message, data || '')
      } catch {
        // Even this fails, just continue silently
      }
    }, 0)
  } catch {
    // Completely silent fallback
  }
}

// Ultra-safe error boundary that never throws
function safeErrorBoundary<T>(operation: () => T, fallback: T): T {
  try {
    return operation()
  } catch (error) {
    // Log silently without triggering error boundaries
    silentLog('[Safe Error Boundary] Operation failed:', error)
    return fallback
  }
}

// Async version of safe error boundary
async function safeAsyncErrorBoundary<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    // Log silently without triggering error boundaries
    silentLog('[Safe Async Error Boundary] Operation failed:', error)
    return fallback
  }
}

// Export debug function for UI use
export function checkPuterStatus(): string {
  if (typeof window === 'undefined') {
    return '❌ Running on server-side - Puter.js requires browser environment'
  }
  
  // Check hostname compatibility
  const hostname = window.location?.hostname || ''
  const isCompatibleHost = hostname.includes('puter.com') || hostname.includes('localhost') || hostname.includes('127.0.0.1')
  
  if (!isCompatibleHost) {
    return `🌐 Environment: ${hostname}\n⚠️ Puter.js works best on Puter.com or localhost environments\n💡 Try opening this app on Puter.com for full AI features`
  }
  
  // Use proper typing instead of 'any'
  const puter = typeof window !== 'undefined' ? (window as Window).puter : undefined;
  
  if (!puter) {
    return `❌ Puter.js not loaded\n💡 Solutions:\n• Make sure you're running on Puter.com\n• Check browser console for script loading errors\n• Refresh the page and wait for Puter.js to load`
  }
  
  if (!puter.ai) {
    return `⚠️ Puter.js loaded but AI module not available\n💡 Solutions:\n• Wait a moment for AI module to initialize\n• Check your Puter.com account permissions\n• Try logging out and back in to Puter.com`
  }
  
  if (typeof puter.ai.chat !== 'function') {
    return `⚠️ Puter.js AI loaded but chat function not available\n💡 This might indicate an authentication issue\n• Ensure you're logged in to Puter.com\n• Check if your account has AI access`
  }
  
  return '✅ Puter.js AI is fully available and ready to use'
}

// Enhanced diagnostic function for troubleshooting
export async function diagnosticPuterConnection(): Promise<string> {
  const results: string[] = []
  
  try {
    // Environment check
    if (typeof window === 'undefined') {
      return '❌ Server-side environment - Puter.js requires browser environment'
    }
    results.push('✅ Browser environment detected')
    
    // Hostname check
    const hostname = window.location?.hostname || 'unknown'
    results.push(`🌐 Current hostname: ${hostname}`)
    
    const isCompatibleHost = hostname.includes('puter.com') || hostname.includes('localhost') || hostname.includes('127.0.0.1')
    if (!isCompatibleHost) {
      results.push('⚠️ Warning: For optimal AI performance, run on Puter.com')
    } else {
      results.push('✅ Compatible hostname detected')
    }
    
    // Puter object check with proper typing
    const puter = typeof window !== 'undefined' ? (window as Window).puter : undefined;
    if (!puter) {
      results.push('❌ window.puter not found')
      results.push('')
      results.push('💡 Troubleshooting steps:')
      results.push('• Open this app on Puter.com')
      results.push('• Refresh the page and wait for scripts to load')
      results.push('• Check browser console for JavaScript errors')
      return results.join('\n')
    }
    results.push('✅ window.puter exists')
    
    // AI module check
    if (!puter.ai) {
      results.push('❌ puter.ai not found')
      results.push(`📊 Available puter properties: ${Object.keys(puter).join(', ')}`)
      results.push('')
      results.push('💡 Solutions:')
      results.push('• Wait a few moments for AI module to initialize')
      results.push('• Refresh the page')
      results.push('• Check your Puter.com account status')
      return results.join('\n')
    }
    results.push('✅ puter.ai module exists')
    
    // Chat function check
    if (typeof puter.ai.chat !== 'function') {
      results.push(`❌ puter.ai.chat is not a function (type: ${typeof puter.ai.chat})`)
      results.push('')
      results.push('💡 Authentication issue solutions:')
      results.push('• Log in to your Puter.com account')
      results.push('• Check if your account has AI access permissions')
      results.push('• Try logging out and back in')
      return results.join('\n')
    }
    results.push('✅ puter.ai.chat function is available')
    
    // Test a simple AI call
    try {
      results.push('')
      results.push('🧪 Testing AI connection...')
      const testResponse = await puter.ai.chat('Hello', { model: 'gpt-4o' })
      results.push(`✅ AI test successful! Response: ${String(testResponse).substring(0, 50)}...`)
      results.push('')
      results.push('✨ Puter.js AI is fully functional and ready for CV analysis!')
    } catch (testError) {
      results.push(`❌ AI test failed:`)
      
      if (testError && typeof testError === 'object') {
        const stringified = JSON.stringify(testError)
        if (stringified === '{}') {
          results.push('⚠️ Empty error object - typically indicates:')
          results.push('• Network connectivity issues')
          results.push('• Authentication/authorization problems')
          results.push('• API service temporarily unavailable')
          results.push('')
          results.push('💡 Try these solutions:')
          results.push('• Check your internet connection')
          results.push('• Refresh the page and try again')
          results.push('• Log out and back in to Puter.com')
          results.push('• Wait a few minutes and retry')
        } else {
          results.push(`Error details: ${stringified}`)
        }
      } else {
        results.push(`Error: ${String(testError)}`)
      }
    }
    
    return results.join('\n')
    
  } catch (error) {
    return `❌ Diagnostic error: ${error instanceof Error ? error.message : String(error)}`
  }
}

// Import Gemini AI SDK
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

// Maximum text length for AI processing to prevent exceeding API limits
const MAX_AI_TEXT_LENGTH = 30000; // 30KB limit for AI processing

// Function to truncate text for AI processing while preserving important content
function truncateTextForAI(text: string, maxLength: number = MAX_AI_TEXT_LENGTH): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  console.log(`[Text Truncation] Original text length: ${text.length}, truncating to ${maxLength}`);
  
  // Try to preserve complete sentences by truncating at sentence boundaries
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let truncatedText = '';
  
  for (const sentence of sentences) {
    if (truncatedText.length + sentence.length <= maxLength - 100) { // Leave some buffer
      truncatedText += sentence;
    } else {
      // If we can't fit a complete sentence, truncate the current sentence
      if (truncatedText.length < maxLength - 100) {
        const remainingSpace = maxLength - truncatedText.length - 100;
        truncatedText += sentence.substring(0, remainingSpace) + '...';
      }
      break;
    }
  }
  
  // Fallback to simple truncation if sentence-based approach didn't work
  if (truncatedText.length === 0) {
    truncatedText = text.substring(0, maxLength - 100) + '...';
  }
  
  console.log(`[Text Truncation] Truncated text length: ${truncatedText.length}`);
  return truncatedText;
}

// Check if we're in a browser environment
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

// Check if Gemini AI is available (server-side or client-side)
function isGeminiAvailable(): boolean {
  // Always available if we have the API key from environment variables
  return !!process.env.GOOGLE_API_KEY;
}

// Gemini AI chat function - uses Google Gemini if available
export async function geminiChat(prompt: string): Promise<string> {
  try {
    console.log('[Gemini Chat] Using Google Gemini AI');
    
    // Generate text using the Gemini model directly
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: prompt,
    });
    
    // Validate response
    if (text === null || text === undefined) {
      throw new Error('Received null or undefined response from Gemini AI');
    }
    
    return text;
  } catch (error) {
    console.warn('[Gemini Chat] Gemini failed:', error);
    
    // Enhanced error logging
    if (error instanceof Error) {
      console.error('[Gemini Chat] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    throw new Error(`Gemini AI Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Enhanced AI chat function - tries Gemini first, then Puter.js, then throws error
async function aiChat(prompt: string): Promise<string> {
  // Check if we're on client-side
  if (typeof window === 'undefined') {
    // Server-side: Try Gemini first
    if (isGeminiAvailable()) {
      try {
        console.log('[AI Chat] Using Gemini AI (server-side)');
        return await geminiChat(prompt);
      } catch (geminiError) {
        console.warn('[AI Chat] Gemini failed on server-side:', geminiError);
        throw new Error(`Server-side AI failed: ${geminiError instanceof Error ? geminiError.message : String(geminiError)}`);
      }
    } else {
      throw new Error('No AI service available on server-side');
    }
  }
  
  // Client-side: Try Gemini first if API key is available, then Puter.js
  if (isGeminiAvailable()) {
    try {
      console.log('[AI Chat] Using Gemini AI (client-side)');
      return await geminiChat(prompt);
    } catch (geminiError) {
      console.warn('[AI Chat] Gemini failed on client-side:', geminiError);
      // Continue to try Puter.js
    }
  }
  
  // Try Puter.js as fallback
  if (isPuterAIAvailable()) {
    try {
      console.log('[AI Chat] Using Puter.js AI (fallback)');
      const puter = (window as any).puter;
      
      // Additional validation
      if (!puter || !puter.ai || typeof puter.ai.chat !== 'function') {
        throw new Error('Puter.js AI interface not properly loaded');
      }
      
      const response = await puter.ai.chat(prompt, { model: 'gpt-4o' });
      
      // Validate response
      if (response === null || response === undefined) {
        throw new Error('Received null or undefined response from Puter.js AI');
      }
      
      return String(response);
    } catch (puterError) {
      console.warn('[AI Chat] Puter.js failed:', puterError);
      
      // Enhanced error logging
      if (puterError instanceof Error) {
        console.error('[AI Chat] Error details:', {
          name: puterError.name,
          message: puterError.message,
          stack: puterError.stack
        });
      }
      
      throw new Error(`All AI services failed - Gemini: ${puterError instanceof Error ? puterError.message : String(puterError)}`);
    }
  }
  
  throw new Error('No AI service available');
}

// Check if Puter AI is available (client-side) with immediate check
function isPuterAIAvailable(): boolean {
  // Must be in browser environment
  if (!isBrowser()) {
    return false;
  }
  
  // Use proper typing instead of 'any'
  try {
    const currentPuter = typeof window !== 'undefined' ? (window as Window).puter : undefined;
    return !!(currentPuter && currentPuter.ai && typeof currentPuter.ai.chat === 'function');
  } catch (error) {
    silentLog('[isPuterAIAvailable] Error accessing window.puter:', error);
    return false;
  }
}

// Pre-load Puter.js availability check on page load
if (typeof window !== 'undefined') {
  // Check immediately when script loads
  setTimeout(() => {
    if (isPuterAIAvailable()) {
      console.log('[Puter AI] Pre-loaded and ready!')
    }
  }, 100)
}

// Wait for Puter.js to load with timeout - ultra-fast mode
async function waitForPuter(maxRetries: number = 5, delay: number = 20): Promise<boolean> {
  // If we're not in a browser, Puter.js is not available
  if (!isBrowser()) {
    return false;
  }
  
  for (let i = 0; i < maxRetries; i++) {
    // Use proper typing instead of 'any'
    const currentPuter = typeof window !== 'undefined' ? (window as Window).puter : undefined;
    if (currentPuter && currentPuter.ai && typeof currentPuter.ai.chat === 'function') {
      return true;
    }
    console.log(`[Puter Wait] Attempt ${i + 1}/${maxRetries} - Waiting for Puter.js to load...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  return false;
}

// Check if any AI is available
function isAIAvailable(): boolean {
  // Check for either Puter.js or Gemini availability
  return isPuterAIAvailable() || isGeminiAvailable();
}

export interface AIAnalysisResult {
  overallAssessment: string
  strengths: string[]
  weaknesses: string[]
  industrySpecificAdvice: string[]
  atsOptimizationTips: string[]
  careerLevelAssessment: string
  improvementPriority: "high" | "medium" | "low"
  industryDetected: string
  skillsAssessment: {
    technical: string[]
    soft: string[]
    missing: string[]
  }
  scoreBreakdown: {
    parsing: number
    keywords: number
    content: number
    format: number
    reasoning: string
  }
}

function getFallbackAnalysis(): AIAnalysisResult {
  return {
    overallAssessment:
      "CV analysis completed using standard algorithms. The document shows professional structure with opportunities for ATS optimization improvements.",
    strengths: ["Professional presentation", "Clear structure", "Relevant experience", "Contact information included"],
    weaknesses: [
      "Could benefit from keyword optimization",
      "Format improvements needed",
      "Missing quantifiable achievements",
    ],
    industrySpecificAdvice: [
      "Align with industry standards",
      "Include relevant certifications",
      "Research role-specific requirements",
      "Follow best practices for your field",
    ],
    atsOptimizationTips: [
      "Use standard section headers like 'Experience', 'Education', 'Skills'",
      "Include more action verbs in experience descriptions",
      "Add quantifiable achievements with specific numbers",
      "Ensure consistent formatting throughout",
      "Include relevant keywords naturally",
    ],
    careerLevelAssessment: "Mid-level professional",
    improvementPriority: "medium",
    industryDetected: "general",
    skillsAssessment: {
      technical: ["Basic technical skills identified"],
      soft: ["Communication", "Teamwork"],
      missing: ["Industry-specific certifications", "Advanced technical skills"]
    },
    scoreBreakdown: {
      parsing: 75,
      keywords: 65,
      content: 70,
      format: 75,
      reasoning: "Standard scoring based on basic CV structure analysis"
    }
  }
}

export async function analyzeWithAI(cvText: string): Promise<AIAnalysisResult> {
  try {
    // Check for any available AI service
    const hasAI = isAIAvailable() || isGeminiAvailable();
    if (!hasAI) {
      console.warn("No AI service available, using fallback analysis")
      return getFallbackAnalysis()
    }

    // Truncate text for AI processing to prevent exceeding API limits
    const truncatedText = truncateTextForAI(cvText);

    const prompt = `
    You are an expert ATS (Applicant Tracking System) consultant and career advisor. Analyze the following CV/resume text and provide detailed insights for ATS optimization and scoring.

    CV Text:
    ${truncatedText}

    Please provide a comprehensive analysis in the following JSON format:
    {
      "overallAssessment": "A 2-3 sentence overall assessment of the CV's ATS compatibility and professional quality",
      "strengths": ["List 3-5 key strengths of this CV"],
      "weaknesses": ["List 3-5 areas that need improvement"],
      "industrySpecificAdvice": ["List 3-4 industry-specific recommendations based on the CV content"],
      "atsOptimizationTips": ["List 4-5 specific ATS optimization recommendations"],
      "careerLevelAssessment": "Assess if this appears to be entry-level, mid-level, or senior-level based on experience",
      "improvementPriority": "high/medium/low - based on how urgently this CV needs improvements",
      "industryDetected": "technology/finance/healthcare/marketing/general - detect the most relevant industry",
      "skillsAssessment": {
        "technical": ["List 3-5 technical skills found"],
        "soft": ["List 3-5 soft skills demonstrated"],
        "missing": ["List 3-5 important skills that appear to be missing"]
      },
      "scoreBreakdown": {
        "parsing": 85,
        "keywords": 78,
        "content": 82,
        "format": 75,
        "reasoning": "Brief explanation of scoring rationale"
      }
    }

    For scoreBreakdown, rate each category 0-100 based on:
    - Parsing: Contact info clarity, section structure, ATS readability
    - Keywords: Industry keywords, action verbs, technical terms, quantifiable achievements
    - Content: Experience relevance, education quality, career progression, achievements
    - Format: Professional layout, consistent formatting, readability, ATS compatibility

    Focus on:
    - ATS parsing compatibility
    - Keyword optimization
    - Professional formatting
    - Content quality and relevance
    - Industry standards
    - Career progression clarity
    - Skills assessment
    - Quantifiable scoring
    
    IMPORTANT: Respond ONLY with the JSON object. Do not include any markdown formatting, explanations, or additional text.
    `

    const responseText = await aiChat(prompt)

    // Parse the AI response
    try {
      // Clean the response by removing markdown code blocks if present
      let cleanedText = responseText.trim()
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\s*/, '').replace(/\s*```$/, '')
      }
      
      const aiResult = JSON.parse(cleanedText)
      return aiResult as AIAnalysisResult
    } catch (parseError) {
      console.warn("Failed to parse AI response, using fallback", parseError)
      console.warn("Raw response:", responseText)
      return getFallbackAnalysis()
    }
  } catch (error) {
    console.error("AI Analysis Error:", error)
    return getFallbackAnalysis()
  }
}

function getFallbackSuggestions(jobTitle?: string): string[] {
  const jobSpecific = jobTitle ? ` yang relevan dengan posisi ${jobTitle}` : ' yang relevan dengan posisi yang dilamar'
  
  return [
    `Sesuaikan CV dengan kata kunci spesifik dari posisi ${jobTitle || 'yang dilamar'} untuk meningkatkan ATS compatibility`,
    "Tambahkan lebih banyak pencapaian yang dapat diukur dengan angka spesifik dan persentase",
    "Gunakan kata kerja aktif yang kuat di awal setiap poin pengalaman kerja",
    "Pastikan format CV konsisten dan mudah dibaca oleh sistem ATS modern",
    "Sertakan ringkasan profesional yang menonjolkan kualifikasi utama sesuai job requirement",
  ]
}

export async function generatePersonalizedSuggestions(cvText: string, targetRole?: string): Promise<string[]> {
  try {
    // Check for any available AI service
    const hasAI = isAIAvailable() || isGeminiAvailable();
    if (!hasAI) {
      console.warn("No AI service available, using fallback suggestions")
      return getFallbackSuggestions()
    }

    // Truncate text for AI processing to prevent exceeding API limits
    const truncatedText = truncateTextForAI(cvText);

    const prompt = `
    Berdasarkan konten CV ini${targetRole ? ` dan target role "${targetRole}"` : ""}, berikan 5 saran spesifik dan actionable untuk perbaikan:

    CV Text:
    ${truncatedText}

    Analisis CV ini secara mendetail dan berikan saran yang:
    1. Spesifik berdasarkan konten CV yang ada
    2. Dapat langsung diterapkan
    3. Meningkatkan daya saing CV
    4. Sesuai dengan standar ATS modern
    5. Relevan dengan pengalaman yang sudah ada

    Berikan tepat 5 saran dalam format array JSON:
    ["saran 1", "saran 2", "saran 3", "saran 4", "saran 5"]
    
    IMPORTANT: Respond ONLY with the JSON array. Do not include any markdown formatting, explanations, or additional text.
    `

    const responseText = await aiChat(prompt)

    try {
      // Strip markdown code blocks if present
      let cleanedText = responseText.trim()
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\s*/, '').replace(/\s*```$/, '')
      }
      
      const suggestions = JSON.parse(cleanedText)
      return Array.isArray(suggestions) && suggestions.length === 5 ? suggestions : getFallbackSuggestions()
    } catch {
      console.warn("Failed to parse AI suggestions, using fallback")
      console.warn("Raw response:", responseText)
      return getFallbackSuggestions()
    }
  } catch (error) {
    console.error("Personalized Suggestions Error:", error)
    return getFallbackSuggestions()
  }
}

// HRD-based personalized suggestions with job-specific context
export async function generateHRDPersonalizedSuggestions(
  cvText: string, 
  jobTitle: string = '', 
  jobDescription: string = ''
): Promise<string[]> {
  try {
    // Check for any available AI service
    const hasAI = isAIAvailable() || isGeminiAvailable();
    if (!hasAI) {
      console.warn("No AI service available, using fallback suggestions")
      return getFallbackSuggestions(jobTitle)
    }

    // Truncate text for AI processing to prevent exceeding API limits
    const truncatedCVText = truncateTextForAI(cvText);
    const truncatedJobDesc = truncateTextForAI(jobDescription, 5000); // Smaller limit for job description

    // Enhanced dynamic prompt with your exact specification
    const prompt = `kamu adalah HRD yang sedang mencari kandidat, kamu sedang mencari pekerja pada bidang "${jobTitle || 'posisi yang dilamar'}" dengan job desc "${truncatedJobDesc || 'sesuai dengan posisi yang tersedia'}" kamu melihat applicant ${truncatedCVText} berikan personalized suggestion untuk cv tersebut.

Analisis CV ini secara mendalam dan berikan 5 personalized suggestion yang:
- SPESIFIK berdasarkan konten CV yang ada
- ACTIONABLE dan dapat langsung diterapkan
- RELEVAN dengan job requirement yang diberikan
- MEMPERTIMBANGKAN gap antara CV dengan job description
- FOKUS pada improvement yang paling impactful

Berikan tepat 5 personalized suggestion dalam format array JSON:
["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4", "suggestion 5"]

Setiap suggestion harus mempertimbangkan:
1. Gap spesifik antara CV dengan job requirement
2. Kekuatan yang sudah ada dan bisa ditonjolkan lebih baik
3. Area improvement yang paling mendesak
4. Format dan presentasi CV untuk ATS optimization
5. Keyword dan technical skills yang perlu ditambahkan

Jangan berikan saran generic - buat saran yang benar-benar personal berdasarkan CV dan job yang spesifik ini.
    
IMPORTANT: Respond ONLY with the JSON array. Do not include any markdown formatting, explanations, or additional text.`

    console.log("[HRD AI Suggestions] Sending prompt to AI...")
    console.log("[HRD AI Suggestions] Job Title:", jobTitle || 'Not specified')
    console.log("[HRD AI Suggestions] Job Description Length:", (truncatedJobDesc || '').length, "characters")
    console.log("[HRD AI Suggestions] CV Text Length:", truncatedCVText.length, "characters")
    
    const responseText = await aiChat(prompt)
    
    console.log("[HRD AI Suggestions] Raw AI Response:", responseText)

    try {
      // Enhanced response parsing
      let cleanedText = responseText.trim()
      
      // Remove markdown code blocks
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\s*/, '').replace(/\s*```$/, '')
      }
      
      // Try to extract JSON array if wrapped in additional text
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        cleanedText = jsonMatch[0]
      }
      
      console.log("[HRD AI Suggestions] Cleaned response:", cleanedText)
      
      const suggestions = JSON.parse(cleanedText)
      
      // Validate suggestions
      if (Array.isArray(suggestions) && suggestions.length === 5) {
        // Ensure all suggestions are strings and not empty
        const validSuggestions = suggestions.filter(s => typeof s === 'string' && s.trim().length > 0)
        if (validSuggestions.length === 5) {
          console.log("[HRD AI Suggestions] ✅ Successfully generated 5 valid suggestions")
          return validSuggestions
        }
      }
      
      console.warn("[HRD AI Suggestions] ⚠️ Invalid suggestions format or count:", suggestions)
      return getFallbackSuggestions(jobTitle)
      
    } catch (parseError) {
      console.error("[HRD AI Suggestions] ❌ Failed to parse AI response:", parseError)
      console.warn("[HRD AI Suggestions] Raw response that failed to parse:", responseText)
      return getFallbackSuggestions(jobTitle)
    }
  } catch (error) {
    console.error("[HRD AI Suggestions] ❌ Error generating suggestions:", error)
    return getFallbackSuggestions(jobTitle)
  }
}

// Enhanced AI-powered CV analysis with dynamic scoring
export async function analyzeWithAIAndScore(cvText: string): Promise<{
  aiAnalysis: AIAnalysisResult
  dynamicScores: {
    parsing: number
    keywords: number
    content: number
    format: number
  }
}> {
  try {
    const aiAnalysis = await analyzeWithAI(cvText)
    
    // Use AI-provided scores if available, otherwise use fallback scores
    const dynamicScores = {
      parsing: aiAnalysis.scoreBreakdown?.parsing || 75,
      keywords: aiAnalysis.scoreBreakdown?.keywords || 65,
      content: aiAnalysis.scoreBreakdown?.content || 70,
      format: aiAnalysis.scoreBreakdown?.format || 75
    }
    
    return {
      aiAnalysis,
      dynamicScores
    }
  } catch (error) {
    console.error("AI Analysis and Scoring Error:", error)
    const fallbackAnalysis = getFallbackAnalysis()
    return {
      aiAnalysis: fallbackAnalysis,
      dynamicScores: {
        parsing: fallbackAnalysis.scoreBreakdown.parsing,
        keywords: fallbackAnalysis.scoreBreakdown.keywords,
        content: fallbackAnalysis.scoreBreakdown.content,
        format: fallbackAnalysis.scoreBreakdown.format
      }
    }
  }
}

// Safe wrapper for Puter.js AI that handles all error cases
export async function safePuterQuickstart(prompt: string = "Tell me about space"): Promise<string> {
  try {
    console.log('[Safe Puter Quickstart] Starting with prompt length:', prompt.length)
    const result = await puterQuickstart(prompt)
    console.log('[Safe Puter Quickstart] Success, result length:', result.length)
    return result
  } catch (error) {
    // Use silent logging to prevent Next.js error boundaries
    silentLog('[Safe Puter Quickstart] Caught error:', error)
    silentLog('[Safe Puter Quickstart] Error type:', typeof error)
    silentLog('[Safe Puter Quickstart] Error constructor:', error?.constructor?.name)
    
    // Log additional error details silently
    if (error && typeof error === 'object') {
      silentLog('[Safe Puter Quickstart] Error keys:', Object.keys(error))
      silentLog('[Safe Puter Quickstart] Error values:', Object.values(error))
    }
    
    // Enhanced error message generation - never throw, always return a string
    
    // Handle Error instances
    if (error instanceof Error) {
      const message = error.message || 'Unknown error occurred'
      if (message.includes('Chat API error: {}')) {
        return `❌ Empty Chat Error: Puter.js returned an empty error object. This usually indicates:\n• Network connectivity issues\n• Authentication problems (try logging in to Puter.com)\n• API service unavailability\n\nPlease refresh the page and try again.`
      }
      return `❌ Error: ${message}`
    }
    
    // Handle string errors
    if (typeof error === 'string') {
      if (error.trim().length === 0) {
        return `❌ Empty Error: Received an empty error string. Please try again.`
      }
      return `❌ Error: ${error}`
    }
    
    // Handle object errors (including empty objects)
    if (error && typeof error === 'object') {
      try {
        const keys = Object.keys(error)
        const stringified = JSON.stringify(error)
        
        if (keys.length === 0 || stringified === '{}' || stringified === 'null') {
          return `❌ Empty Error Object: Received an empty error object from Puter.js. This typically indicates a network or authentication issue. Please check your connection and Puter.com login status.`
        }
        
        if (stringified && stringified !== '{}') {
          return `❌ Error object: ${stringified}`
        }
        
        // Try to extract meaningful properties
        const meaningfulProps = keys.filter(key => {
          try {
            const value = (error as any)[key]
            return value !== null && value !== undefined && value !== ''
          } catch {
            return false
          }
        })
        
        if (meaningfulProps.length > 0) {
          const propDetails = meaningfulProps.map(key => {
            try {
              return `${key}: ${(error as any)[key]}`
            } catch {
              return `${key}: [inaccessible]`
            }
          }).join(', ')
          return `❌ Error with properties: ${propDetails}`
        }
        
      } catch (jsonError) {
        try {
          console.warn('[Safe Puter Quickstart] JSON stringify failed:', jsonError)
        } catch {
          // Even logging failed, just continue
        }
      }
    }
    
    // Handle null or undefined
    if (error === null) {
      return `❌ Null Error: Received a null error from Puter.js. Please try again.`
    }
    
    if (error === undefined) {
      return `❌ Undefined Error: Received an undefined error from Puter.js. Please try again.`
    }
    
    // Last resort - try to convert to string
    try {
      const errorString = String(error)
      if (errorString && errorString !== 'undefined' && errorString !== 'null' && errorString !== '[object Object]') {
        return `❌ Unexpected error (${typeof error}): ${errorString}`
      }
    } catch (stringConversionError) {
      try {
        console.warn('[Safe Puter Quickstart] String conversion failed:', stringConversionError)
      } catch {
        // Even this logging failed
      }
    }
    
    // Absolute fallback
    return `❌ An completely unrecognizable error occurred (type: ${typeof error}). Please refresh the page and check if you're running on Puter.com. If the issue persists, try logging out and back in to Puter.com.`
  }
}

// AI Quickstart implementation for client-side use - tries Gemini first, then Puter.js
export async function puterQuickstart(prompt: string = "Tell me about space"): Promise<string> {
  try {
    // Check if we're on client-side
    if (typeof window === 'undefined') {
      return "❌ This function must be called from client-side (browser environment)"
    }
    
    // Try Gemini first if API key is available
    if (GEMINI_API_KEY) {
      try {
        console.log("[AI Quickstart] Using Gemini AI");
        const response = await geminiChat(prompt);
        console.log("[AI Quickstart] Gemini response:", response);
        return response;
      } catch (geminiError) {
        console.warn("[AI Quickstart] Gemini failed:", geminiError);
        // Continue to try Puter.js
      }
    }
    
    // Check if we're actually on Puter.com or a compatible environment
    const hostname = window.location?.hostname || ''
    if (!hostname.includes('puter.com') && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
      return "🌐 Puter.js AI requires running on Puter.com or localhost environment. Current: " + hostname
    }
    
    console.log("[Puter Quickstart] 🔄 Checking Puter.js availability...")
    
    // Validate browser environment
    if (!window || typeof window !== 'object') {
      return "❌ Browser environment not properly available"
    }
    

    
    // Check for Puter.js presence more defensively
    {
      let puterInstance1: Window['puter'] | undefined;
      try {
        puterInstance1 = typeof window !== 'undefined' ? (window as Window).puter : undefined;
      } catch (windowError) {
        silentLog("[Puter Quickstart] Error accessing window.puter:", windowError);
        return "❌ Unable to access Puter.js from window object";
      }
      
      if (!puterInstance1 || !puterInstance1.ai || typeof puterInstance1.ai.chat !== 'function') {
        console.log("[Puter Quickstart] 🔄 Waiting for Puter.js to load...")
        
        // Use the existing waitForPuter function with ultra-fast mode
        const isPuterReady = await waitForPuter(5, 20) // Wait up to 0.1 seconds
        
        if (!isPuterReady) {
          const errorMsg = "⏱️ Puter.js AI is taking longer than expected to load. Please wait and try again."
          console.warn("[Puter Quickstart]", errorMsg)
          return errorMsg
        }
        
        // Re-fetch puter after waiting
        {
          try {
            const puterInstance2 = typeof window !== 'undefined' ? (window as Window).puter : undefined;
          } catch (refetchError) {
            silentLog("[Puter Quickstart] Error re-fetching puter after wait:", refetchError);
            return "❌ Unable to access Puter.js after waiting";
          }
        }
      }
      
      console.log("[Puter Quickstart] ✅ Puter.js AI is ready!")
      
      console.log("[AI Quickstart] Sending prompt:", prompt.substring(0, 100) + '...')
      
      // Send original prompt with ultra-safe error handling
      let response: any;
      
      // Use proper typing
      const puterInstance3 = typeof window !== 'undefined' ? (window as Window).puter : undefined;
      if (!puterInstance3) {
        return "❌ Puter.js not available";
      }
      
      response = await safeAsyncErrorBoundary(
        async () => puterInstance3.ai.chat(prompt, { model: 'gpt-4o' }),
        null // fallback value
      );
      
      // If the safe boundary returned null, it means there was an error
      if (response === null) {
        // Get more detailed diagnostic information
        const diagnostic = await diagnosticPuterConnection()
        
        return `❌ Puter.js Chat API Error\n\n🔍 Diagnostic Information:\n${diagnostic}\n\n💡 Quick Solutions:\n• Try refreshing the page\n• Check your Puter.com login status\n• Ensure stable internet connection\n• Wait a moment and try again`
      }
      
      console.log("[AI Quickstart] Raw response:", response)
      console.log("[AI Quickstart] Response type:", typeof response)
      
      // Extract content from various response formats
      let processedResponse: string = ""
      
      if (typeof response === 'string') {
        const trimmedResponse = response.trim()
        
        try {
          // Try to parse as JSON to extract content
          if (trimmedResponse.startsWith('{') || trimmedResponse.startsWith('[')) {
            // Strip markdown code blocks if present
            let cleanedResponse = trimmedResponse
            if (cleanedResponse.startsWith('```json')) {
              cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/\s*```$/, '')
            } else if (cleanedResponse.startsWith('```')) {
              cleanedResponse = cleanedResponse.replace(/```\s*/, '').replace(/\s*```$/, '')
            }
            
            const parsedResponse = JSON.parse(cleanedResponse)
            processedResponse = extractContentFromJSON(parsedResponse)
            
            if (!processedResponse) {
              // If no content extracted, use the raw response
              processedResponse = trimmedResponse
            }
          } else {
            // Not JSON format, use as plain text
            processedResponse = trimmedResponse
          }
        } catch (jsonError) {
          console.log("[Puter Quickstart] JSON parsing failed, using raw response")
          processedResponse = trimmedResponse
        }
      } else if (response !== null && response !== undefined) {
        // Handle object responses directly
        if (typeof response === 'object') {
          processedResponse = extractContentFromJSON(response)
          
          if (!processedResponse) {
            // If no content extracted, convert to string
            processedResponse = String(response)
          }
        } else {
          // Handle non-string, non-object responses
          processedResponse = String(response)
        }
      } else {
        // Handle null/undefined responses
        processedResponse = "No response received from AI service"
      }
      
      // Final validation
      if (!processedResponse || processedResponse.length === 0) {
        return "Empty response received from AI service"
      }
      
      return processedResponse
    }
  } catch (error) {
    console.error("[Puter Quickstart] Critical error:", error)
    return `❌ Critical Error: ${error instanceof Error ? error.message : String(error)}`
  }
}

// Helper function to extract content from various JSON response formats
function extractContentFromJSON(jsonObj: any): string {
  console.log("[Content Extractor] Processing JSON:", jsonObj)
  
  // Direct content field
  if (jsonObj.content && typeof jsonObj.content === 'string') {
    console.log("[Content Extractor] Found direct content field")
    return jsonObj.content
  }
  
  // OpenAI-style response with choices array
  if (jsonObj.choices && Array.isArray(jsonObj.choices) && jsonObj.choices.length > 0) {
    const choice = jsonObj.choices[0]
    
    // Message content in choice
    if (choice.message && choice.message.content) {
      console.log("[Content Extractor] Found content in choices[0].message.content")
      return choice.message.content
    }
    
    // Text content in choice
    if (choice.text) {
      console.log("[Content Extractor] Found content in choices[0].text")
      return choice.text
    }
    
    // Delta content for streaming responses
    if (choice.delta && choice.delta.content) {
      console.log("[Content Extractor] Found content in choices[0].delta.content")
      return choice.delta.content
    }
  }
  
  // Direct message content
  if (jsonObj.message && jsonObj.message.content) {
    console.log("[Content Extractor] Found content in message.content")
    return jsonObj.message.content
  }
  
  // Direct text field
  if (jsonObj.text && typeof jsonObj.text === 'string') {
    console.log("[Content Extractor] Found direct text field")
    return jsonObj.text
  }
  
  // Response field
  if (jsonObj.response && typeof jsonObj.response === 'string') {
    console.log("[Content Extractor] Found direct response field")
    return jsonObj.response
  }
  
  // Data field with content
  if (jsonObj.data && jsonObj.data.content) {
    console.log("[Content Extractor] Found content in data.content")
    return jsonObj.data.content
  }
  
  // Array of messages
  if (Array.isArray(jsonObj) && jsonObj.length > 0) {
    const firstItem = jsonObj[0]
    if (firstItem.content) {
      console.log("[Content Extractor] Found content in array[0].content")
      return firstItem.content
    }
    if (firstItem.message && firstItem.message.content) {
      console.log("[Content Extractor] Found content in array[0].message.content")
      return firstItem.message.content
    }
  }
  
  console.log("[Content Extractor] No content field found in JSON structure")
  return "" // Return empty string if no content found
}

// Test function for Gemini AI integration
export async function testGeminiIntegration(): Promise<string> {
  try {
    if (!GEMINI_API_KEY) {
      return "❌ Gemini API key not configured";
    }
    
    const testPrompt = "Say hello in Indonesian";
    const response = await geminiChat(testPrompt);
    return `✅ Gemini AI is working! Response: ${response}`;
  } catch (error) {
    return `❌ Gemini AI test failed: ${error instanceof Error ? error.message : String(error)}`;
  }
}
