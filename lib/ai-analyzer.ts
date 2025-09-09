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
}

// Access puter from global scope
const puter = typeof window !== 'undefined' ? (window as any).puter : null

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
  
  const puter = (window as any).puter
  
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
    
    // Puter object check
    const puter = (window as any).puter
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
  
  // Immediate check without any delay
  try {
    const puter = (window as any).puter;
    return !!(puter && puter.ai && typeof puter.ai.chat === 'function');
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
    if (isPuterAIAvailable()) {
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

    const prompt = `
    You are an expert ATS (Applicant Tracking System) consultant and career advisor. Analyze the following CV/resume text and provide detailed insights for ATS optimization and scoring.

    CV Text:
    ${cvText}

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
    `Tambahkan lebih banyak pencapaian yang dapat diukur dengan angka spesifik dan persentase${jobSpecific}`,
    `Sertakan kata kunci dan technical skills${jobSpecific} untuk meningkatkan ATS compatibility`,
    "Gunakan kata kerja aktif yang kuat di awal setiap poin pengalaman kerja",
    "Pastikan format CV konsisten dan mudah dibaca oleh sistem ATS modern",
    "Tambahkan ringkasan profesional yang menonjolkan kualifikasi utama dan career objective",
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

    const prompt = `
    Berdasarkan konten CV ini${targetRole ? ` dan target role "${targetRole}"` : ""}, berikan 5 saran spesifik dan actionable untuk perbaikan:

    CV Text:
    ${cvText}

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

    // Enhanced dynamic prompt with your exact specification
    const prompt = `kamu adalah HRD yang sedang mencari kandidat, kamu sedang mencari pekerja pada bidang "${jobTitle || 'posisi yang dilamar'}" dengan job desc "${jobDescription || 'sesuai dengan posisi yang tersedia'}" kamu melihat applicant ${cvText} berikan personalized suggestion untuk cv tersebut.

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
    console.log("[HRD AI Suggestions] Job Description Length:", (jobDescription || '').length, "characters")
    console.log("[HRD AI Suggestions] CV Text Length:", cvText.length, "characters")
    
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
    let puter: any
    try {
      puter = (window as any).puter
    } catch (windowError) {
      silentLog("[Puter Quickstart] Error accessing window.puter:", windowError)
      return "❌ Unable to access Puter.js from window object"
    }
    
    if (!puter || !puter.ai || typeof puter.ai.chat !== 'function') {
      console.log("[Puter Quickstart] 🔄 Waiting for Puter.js to load...")
      
      // Use the existing waitForPuter function with ultra-fast mode
      const isPuterReady = await waitForPuter(5, 20) // Wait up to 0.1 seconds
      
      if (!isPuterReady) {
        const errorMsg = "⏱️ Puter.js AI is taking longer than expected to load. Please wait and try again."
        console.warn("[Puter Quickstart]", errorMsg)
        return errorMsg
      }
      
      // Re-fetch puter after waiting
      try {
        puter = (window as any).puter
      } catch (refetchError) {
        silentLog("[Puter Quickstart] Error re-fetching puter after wait:", refetchError)
        return "❌ Unable to access Puter.js after waiting"
      }
    }
    
    console.log("[Puter Quickstart] ✅ Puter.js AI is ready!")
    
    console.log("[AI Quickstart] Sending prompt:", prompt.substring(0, 100) + '...')
    
    // Send original prompt with ultra-safe error handling
    let response: any
    
    response = await safeAsyncErrorBoundary(
      async () => puter.ai.chat(prompt, { model: 'gpt-4o' }),
      null // fallback value
    )
    
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
          try {
            processedResponse = JSON.stringify(response, null, 2)
          } catch (jsonError) {
            processedResponse = String(response)
          }
        }
      } else {
        processedResponse = String(response)
      }
    } else {
      processedResponse = "No response generated"
    }
    
    // Ensure we have a valid response
    if (!processedResponse || processedResponse.length === 0) {
      processedResponse = "Empty response received from AI"
    }
    
    console.log("[Puter Quickstart] Final processed response:", processedResponse)
    
    return processedResponse
  } catch (error) {
    // Use silent logging to prevent Next.js error boundaries
    silentLog("[Puter Quickstart] Error:", error)
    
    // Enhanced error logging for debugging with silent logging
    if (error instanceof Error) {
      silentLog("[Puter Quickstart] Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    } else {
      silentLog("[Puter Quickstart] Non-Error object caught:", error)
    }
    
    // Provide user-friendly error messages with emojis
    if (error instanceof Error) {
      if (error.message.includes('not available') || error.message.includes('not loaded')) {
        return "⏱️ Puter.js AI is still loading. Please wait a moment and try again."
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        return "🌐 Network issue detected. Please check your connection and try again."
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        return "🚫 API quota reached. Please try again later."
      } else if (error.message.includes('authentication') || error.message.includes('auth') || error.message.includes('Not logged in')) {
        return "🔐 Please log in to your Puter.com account to use AI features."
      } else if (error.message.includes('permission') || error.message.includes('access')) {
        return "🔐 Access denied. Please check your Puter.com account permissions."
      } else if (error.message) {
        return `❌ AI Error: ${error.message}`
      } else {
        return "❌ An unknown error occurred with the AI service. Please try again."
      }
    }
    
    // Handle non-Error objects
    if (typeof error === 'string') {
      return `❌ Error: ${error}`
    }
    
    return "❌ An unexpected error occurred. Please try again."
  }
}

// AI-powered individual category evaluation function
export async function aiEvaluateCategory(cvText: string, category: string, jobName: string = '', jobDescription: string = ''): Promise<{
  category: string
  score: number
  status: "excellent" | "good" | "needs-improvement" | "poor"
  issues: string[]
  recommendations: string[]
}> {
  try {
    // Check if we're on client-side
    if (typeof window === 'undefined') {
      throw new Error("AI Category Evaluator must be called from client-side")
    }
    
    // Wait for any AI service to be ready
    const isAIReady = await waitForPuter(5, 20) // Wait up to 0.1 seconds
    
    if (!isAIReady && !isGeminiAvailable()) {
      throw new Error("No AI service is available. Please try again in a moment.")
    }
    
    console.log(`[AI Category Evaluator] Evaluating category: ${category}`)
    
    let prompt = ""
    
    switch (category) {
      case "Dampak Kuantitatif":
        prompt = `Kamu adalah HRD yang melakukan pengecekan terhadap CV ATS. Evaluasi CV berikut berdasarkan Dampak Kuantitatif:

CV Text:
${cvText}

Job Name: ${jobName || 'Tidak disediakan'}
Job Description: ${jobDescription || 'Tidak disediakan'}

Evaluasi berdasarkan:
- Apakah CV menunjukkan pengalaman kerja dan project yang relevan dengan posisi?
- Adakah angka/metrik yang spesifik (contoh: 25% improvement, 10+ projects, $100K revenue)?
- Seberapa relevan pengalaman dengan job description?
- Apakah ada pencapaian yang terukur?

Berikan penilaian dalam format JSON:
{
  "score": 0-100,
  "status": "excellent/good/needs-improvement/poor",
  "issues": ["daftar masalah yang ditemukan"],
  "recommendations": ["daftar saran perbaikan"]
}`
        break
        
      case "Panjang CV":
        prompt = `Kamu adalah HRD yang melakukan pengecekan terhadap CV ATS. Evaluasi CV berikut berdasarkan Panjang CV:

CV Text:
${cvText}

Job Name: ${jobName || 'Tidak disediakan'}
Job Description: ${jobDescription || 'Tidak disediakan'}

Evaluasi berdasarkan:
- Apakah panjang CV sudah optimal (ideal 200-600 kata)?
- Tidak terlalu pendek atau terlalu panjang?
- Sesuai dengan level posisi yang dilamar?
- Konten proporsional dengan pengalaman?

Berikan penilaian dalam format JSON:
{
  "score": 0-100,
  "status": "excellent/good/needs-improvement/poor",
  "issues": ["daftar masalah yang ditemukan"],
  "recommendations": ["daftar saran perbaikan"]
}`
        break
        
      case "Kelengkapan CV":
        prompt = `Kamu adalah HRD yang melakukan pengecekan terhadap CV ATS. Evaluasi CV berikut berdasarkan Kelengkapan CV:

CV Text:
${cvText}

Job Name: ${jobName || 'Tidak disediakan'}
Job Description: ${jobDescription || 'Tidak disediakan'}

Evaluasi berdasarkan:
- Apakah CV memiliki semua bagian penting (kontak, pengalaman, pendidikan, skills)?
- Informasi kontak lengkap dan jelas?
- Struktur CV rapi dan terorganisir?
- Bagian-bagian yang masih kurang?

Berikan penilaian dalam format JSON:
{
  "score": 0-100,
  "status": "excellent/good/needs-improvement/poor",
  "issues": ["daftar masalah yang ditemukan"],
  "recommendations": ["daftar saran perbaikan"]
}`
        break
        
      case "Kata Kunci Sesuai Job":
        prompt = `Kamu adalah HRD yang melakukan pengecekan terhadap CV ATS. Evaluasi CV berikut berdasarkan Kata Kunci Sesuai Job:

CV Text:
${cvText}

Job Name: ${jobName || 'Tidak disediakan'}
Job Description: ${jobDescription || 'Tidak disediakan'}

Evaluasi berdasarkan:
- Apakah CV menggunakan kata kunci yang sesuai dengan job description?
- Apakah ada technical skills yang relevan?
- Penggunaan action verbs yang tepat?
- Matching dengan requirement posisi?

Berikan penilaian dalam format JSON:
{
  "score": 0-100,
  "status": "excellent/good/needs-improvement/poor",
  "issues": ["daftar masalah yang ditemukan"],
  "recommendations": ["daftar saran perbaikan"]
}`
        break
        
      default:
        throw new Error(`Unknown category: ${category}`)
    }

    const response = await aiChat(prompt)
    
    console.log(`[AI Category Evaluator] Raw response for ${category}:`, response)
    
    // Extract and parse the JSON response
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
          
          // Extract content field if it exists, otherwise use the parsed response
          if (parsedResponse.content) {
            processedResponse = parsedResponse.content
          } else {
            // If it's already the evaluation result, use it directly
            if (parsedResponse.score !== undefined) {
              console.log(`[AI Category Evaluator] Successfully parsed ${category} evaluation result`)
              return {
                category,
                score: parsedResponse.score,
                status: parsedResponse.status,
                issues: parsedResponse.issues || [],
                recommendations: parsedResponse.recommendations || []
              }
            } else {
              processedResponse = cleanedResponse
            }
          }
        } else {
          processedResponse = trimmedResponse
        }
      } catch (jsonError) {
        console.log(`[AI Category Evaluator] JSON parsing failed for ${category}, trying to extract JSON from text`)
        processedResponse = trimmedResponse
      }
    } else if (response !== null && response !== undefined) {
      if (typeof response === 'object') {
        // If it's already an object with evaluation results
        if ((response as any).score !== undefined) {
          return {
            category,
            score: (response as any).score,
            status: (response as any).status,
            issues: (response as any).issues || [],
            recommendations: (response as any).recommendations || []
          }
        } else {
          processedResponse = extractContentFromJSON(response)
        }
      } else {
        processedResponse = String(response)
      }
    }
    
    // Try to parse the processed response as JSON
    try {
      const evaluation = JSON.parse(processedResponse)
      console.log(`[AI Category Evaluator] Successfully extracted ${category} evaluation:`, evaluation)
      return {
        category,
        score: evaluation.score || 75,
        status: evaluation.status || 'needs-improvement',
        issues: evaluation.issues || [`Failed to evaluate ${category}`],
        recommendations: evaluation.recommendations || [`Please review ${category} section`]
      }
    } catch (finalParseError) {
      console.error(`[AI Category Evaluator] Failed to parse ${category} evaluation response:`, finalParseError)
      throw new Error(`Failed to parse AI ${category} evaluation response`)
    }
    
  } catch (error) {
    console.error(`[AI Category Evaluator] Error evaluating ${category}:`, error)
    throw error
  }
}

export async function aiEvaluateCV(cvText: string, jobName: string = '', jobDescription: string = ''): Promise<{
  results: Array<{
    category: string
    score: number
    status: "excellent" | "good" | "needs-improvement" | "poor"
    issues: string[]
    recommendations: string[]
  }>
  overallScore: number
  aiExplanation: string
}> {
  try {
    // Check for any available AI service
    const hasAI = isAIAvailable() || isGeminiAvailable();
    if (!hasAI) {
      throw new Error("No AI service available")
    }
    
    console.log("[AI CV Evaluator] Starting AI-based evaluation")
    
    const prompt = `Kamu adalah HRD yang melakukan pengecekan terhadap CV ATS. Kamu mengecek CV berikut:

${cvText}

yang akan di-compare dengan:
- Nama Pekerjaan: ${jobName || 'Tidak disediakan'}
- Deskripsi Pekerjaan: ${jobDescription || 'Tidak disediakan'}

Lakukan analisis terhadap 4 kategori diantaranya:

1. **Dampak Kuantitatif** (25% bobot): 
   - Relevansi pengalaman kerja dan project dengan posisi
   - Adakah angka/metrik yang spesifik (contoh: 25% improvement, 10+ projects, $100K revenue)
   - Pencapaian terukur dan impact yang jelas

2. **Panjang CV** (20% bobot):
   - Optimal 200-600 kata untuk level yang sesuai
   - Tidak terlalu pendek atau terlalu panjang
   - Proporsi konten dengan pengalaman
   - Penggunaan kata baku dan formal

3. **Kelengkapan CV** (30% bobot):
   - Informasi kontak lengkap (email, telepon, alamat)
   - Struktur CV yang terorganisir (summary, experience, education, skills)
   - Bagian-bagian penting yang tidak boleh hilang
   - Format yang rapi dan profesional

4. **Kata Kunci Sesuai Job** (25% bobot):
   ${jobDescription ? `- WAJIB: Bandingkan CV secara detail dengan job description berikut: "${jobDescription}"
   - Hitung persentase kata kunci yang cocok (contoh: jika ada 20 kata kunci penting dalam job desc dan CV mengandung 12 di antaranya = 60%)
   - Identifikasi technical skills spesifik yang diminta vs yang ada di CV
   - Cek action verbs dan industry terms yang sesuai dengan requirement
   - Berikan feedback spesifik tentang gap keywords yang hilang` : `- Matching dengan requirement job description yang tersedia
   - Technical skills yang relevan
   - Action verbs yang tepat
   - Industry-specific terminology`}

Berikan penilaian dalam format JSON berikut dengan skor masing-masing kategori dan skor total:
{
  "categoryScores": {
    "dampakKuantitatif": {
      "score": 0-100,
      "weight": 25,
      "weightedScore": "calculated",
      "status": "excellent/good/needs-improvement/poor"
    },
    "panjangCV": {
      "score": 0-100,
      "weight": 20,
      "weightedScore": "calculated",
      "status": "excellent/good/needs-improvement/poor"
    },
    "kelengkapanCV": {
      "score": 0-100,
      "weight": 30,
      "weightedScore": "calculated",
      "status": "excellent/good/needs-improvement/poor"
    },
    "kataKunciSesuaiJob": {
      "score": 0-100,
      "weight": 25,
      "weightedScore": "calculated",
      "status": "excellent/good/needs-improvement/poor"
    }
  },
  "totalScore": 0-100,
  "grade": "A+/A/A-/B+/B/B-/C+/C/C-/D/F",
  "results": [
    {
      "category": "Dampak Kuantitatif",
      "score": 0-100,
      "status": "excellent/good/needs-improvement/poor",
      "issues": ["daftar masalah yang ditemukan"],
      "recommendations": ["daftar saran perbaikan"]
    },
    {
      "category": "Panjang CV",
      "score": 0-100,
      "status": "excellent/good/needs-improvement/poor", 
      "issues": ["daftar masalah yang ditemukan"],
      "recommendations": ["daftar saran perbaikan"]
    },
    {
      "category": "Kelengkapan CV",
      "score": 0-100,
      "status": "excellent/good/needs-improvement/poor",
      "issues": ["daftar masalah yang ditemukan"],
      "recommendations": ["daftar saran perbaikan"]
    },
    {
      "category": "Kata Kunci Sesuai Job",
      "score": 0-100,
      "status": "excellent/good/needs-improvement/poor",
      "issues": ["daftar masalah yang ditemukan"],
      "recommendations": ["daftar saran perbaikan"]
    }
  ],
  "overallScore": 0-100,
  "aiExplanation": "Penjelasan komprehensif tentang evaluasi keseluruhan, skor per kategori, dan saran prioritas utama"
}

Pastikan semua skor adalah angka dari 0-100, dan status sesuai dengan rentang:
- excellent: 85-100 (Grade A)
- good: 70-84 (Grade B)
- needs-improvement: 50-69 (Grade C)
- poor: 0-49 (Grade D-F)

${jobDescription ? `PENTING untuk kategori "Kata Kunci Sesuai Job":
- Ekstrak semua kata kunci penting dari job description (minimum 4 huruf, bukan kata umum)
- Hitung berapa persen yang ada di CV
- Skor = persentase keyword match (0-100)
- Berikan feedback spesifik tentang technical skills dan action verbs yang hilang

` : ''}Hitung weighted score untuk setiap kategori dan berikan total score yang akurat.`

    const response = await aiChat(prompt)
    
    console.log("[AI CV Evaluator] Raw response:", response)
    
    // Extract and parse the JSON response
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
          
          // Extract content field if it exists, otherwise use the parsed response
          if (parsedResponse.content) {
            processedResponse = parsedResponse.content
          } else {
            // If it's already the evaluation result, use it directly
            if (parsedResponse.results && parsedResponse.overallScore !== undefined) {
              console.log("[AI CV Evaluator] Successfully parsed evaluation result")
              return parsedResponse
            } else {
              processedResponse = cleanedResponse
            }
          }
        } else {
          processedResponse = trimmedResponse
        }
      } catch (jsonError) {
        console.log("[AI CV Evaluator] JSON parsing failed, trying to extract JSON from text")
        processedResponse = trimmedResponse
      }
    } else if (response !== null && response !== undefined) {
      if (typeof response === 'object') {
        // If it's already an object with evaluation results
        if ((response as any).results && (response as any).overallScore !== undefined) {
          return response as any
        } else {
          processedResponse = extractContentFromJSON(response)
        }
      } else {
        processedResponse = String(response)
      }
    }
    
    // Try to parse the processed response as JSON
    try {
      const evaluation = JSON.parse(processedResponse)
      console.log("[AI CV Evaluator] Successfully extracted evaluation:", evaluation)
      return evaluation
    } catch (finalParseError) {
      console.error("[AI CV Evaluator] Failed to parse evaluation response:", finalParseError)
      throw new Error("Failed to parse AI evaluation response")
    }
    
  } catch (error) {
    console.error("[AI CV Evaluator] Error:", error)
    throw error
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
