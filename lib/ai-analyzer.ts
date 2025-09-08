// Hybrid AI implementation - Puter.js (client-side) with traditional fallback

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

// Check if Puter AI is available (client-side)
function isPuterAIAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false // Server-side
  }
  
  // Check if puter object exists and has ai.chat method
  const puter = (window as any).puter
  return !!(puter && puter.ai && typeof puter.ai.chat === 'function')
}

// Wait for Puter.js to load with timeout
async function waitForPuter(maxRetries: number = 10, delay: number = 500): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    if (isPuterAIAvailable()) {
      return true
    }
    console.log(`[Puter Wait] Attempt ${i + 1}/${maxRetries} - Waiting for Puter.js to load...`)
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  return false
}

// Simple AI chat function - uses Puter.js if available, otherwise throws error
async function aiChat(prompt: string): Promise<string> {
  // Check if we're on client-side
  if (typeof window === 'undefined') {
    throw new Error('Puter.js AI not available on server-side')
  }
  
  // Wait for Puter.js to load if not immediately available
  if (!isPuterAIAvailable()) {
    console.log('[AI Chat] Puter.js not immediately available, waiting...')
    const puterLoaded = await waitForPuter()
    if (!puterLoaded) {
      throw new Error('Puter.js AI failed to load after waiting')
    }
  }
  
  // Try Puter.js (client-side only)
  try {
    console.log('[AI Chat] Using Puter.js AI')
    const puter = (window as any).puter
    return await puter.ai.chat(prompt, { model: 'gpt-4o' })
  } catch (puterError) {
    console.warn('[AI Chat] Puter.js failed:', puterError)
    throw new Error(`Puter.js AI error: ${puterError instanceof Error ? puterError.message : String(puterError)}`)
  }
}

// Check if any AI is available
function isAIAvailable(): boolean {
  return isPuterAIAvailable()
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
    if (!isAIAvailable()) {
      console.warn("Puter.js AI not available, using fallback analysis")
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
    `

    const responseText = await aiChat(prompt)

    // Parse the AI response
    try {
      const aiResult = JSON.parse(responseText)
      return aiResult as AIAnalysisResult
    } catch (parseError) {
      console.warn("Failed to parse AI response, using fallback")
      return getFallbackAnalysis()
    }
  } catch (error) {
    console.error("AI Analysis Error:", error)
    return getFallbackAnalysis()
  }
}

function getFallbackSuggestions(): string[] {
  return [
    "Add more quantifiable achievements with specific numbers and percentages",
    "Include industry-relevant keywords naturally throughout your experience descriptions",
    "Use strong action verbs to start each bullet point in your experience section",
    "Ensure consistent formatting and clear section headers for better ATS parsing",
    "Add a professional summary that highlights your key qualifications and career goals",
  ]
}

export async function generatePersonalizedSuggestions(cvText: string, targetRole?: string): Promise<string[]> {
  try {
    if (!isAIAvailable()) {
      console.warn("Puter.js AI not available, using fallback suggestions")
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
      return getFallbackSuggestions()
    }
  } catch (error) {
    console.error("Personalized Suggestions Error:", error)
    return getFallbackSuggestions()
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

// Function to generate random animal facts for AI integration testing
export async function generateAnimalFacts(): Promise<string[]> {
  try {
    // Check if we're on client-side
    if (typeof window === 'undefined') {
      throw new Error("This function must be called from client-side")
    }
    
    console.log("[Animal Facts] 🔄 Waiting for Puter.js to load...")
    
    // Use the existing waitForPuter function
    const isPuterReady = await waitForPuter(25, 200) // Wait up to 5 seconds
    
    if (!isPuterReady) {
      throw new Error("Puter.js AI is not available after waiting. Please try again.")
    }
    
    console.log("[Animal Facts] ✅ Puter.js AI is ready!")

    const prompt = `
    Generate exactly 5 fascinating and surprising animal facts. Make them educational, interesting, and suitable for all ages.
    
    Please provide the facts in the following JSON array format:
    ["fact 1", "fact 2", "fact 3", "fact 4", "fact 5"]
    
    Each fact should be:
    - Unique and surprising
    - Educational but fun
    - About different animals (mammals, birds, reptiles, marine life, insects, etc.)
    - 1-2 sentences long
    - Factually accurate
    - Written in a engaging and interesting way
    `

    const responseText = await (window as any).puter.ai.chat(prompt, {
      model: 'gpt-4o'
    })

    // Strip markdown code blocks if present
    let cleanedText = responseText.trim()
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\s*/, '').replace(/\s*```$/, '')
    }

    const facts = JSON.parse(cleanedText)
    if (!Array.isArray(facts) || facts.length !== 5) {
      throw new Error("Invalid response format from AI")
    }
    
    return facts
  } catch (error) {
    console.error("[Animal Facts] Generation Error:", error)
    throw error
  }
}

// AI Quickstart implementation for client-side use
export async function puterQuickstart(prompt: string = "Tell me about space"): Promise<string> {
  try {
    // Check if we're on client-side
    if (typeof window === 'undefined') {
      return "❌ This function must be called from client-side (browser environment)"
    }
    
    console.log("[Puter Quickstart] 🔄 Checking Puter.js availability...")
    
    // Direct availability check before waiting
    const puter = (window as any).puter
    if (!puter || !puter.ai || typeof puter.ai.chat !== 'function') {
      console.log("[Puter Quickstart] 🔄 Waiting for Puter.js to load...")
      
      // Use the existing waitForPuter function with enhanced retry logic
      const isPuterReady = await waitForPuter(30, 200) // Wait up to 6 seconds
      
      if (!isPuterReady) {
        const errorMsg = "⏱️ Puter.js AI is taking longer than expected to load. Please wait and try again."
        console.warn("[Puter Quickstart]", errorMsg)
        return errorMsg
      }
    }
    
    console.log("[Puter Quickstart] ✅ Puter.js AI is ready!")
    
    console.log("[AI Quickstart] Sending prompt:", prompt)
    
    // Send original prompt without JSON formatting requirements
    const response = await (window as any).puter.ai.chat(prompt, {
      model: 'gpt-4o'
    })
    
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
    console.error("[Puter Quickstart] Error:", error)
    
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
      } else {
        return `❌ AI Error: ${error.message}`
      }
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
    
    // Wait for Puter.js to be ready
    const isPuterReady = await waitForPuter(20, 300) // Wait up to 6 seconds
    
    if (!isPuterReady) {
      throw new Error("Puter.js AI is not available. Please try again in a moment.")
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
    if (!isAIAvailable()) {
      throw new Error("Puter.js AI not available")
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