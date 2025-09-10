import { type NextRequest, NextResponse } from "next/server"
import { analyzeCV } from "@/lib/cv-analyzer"
import { analyzeWithAI, generatePersonalizedSuggestions, generateHRDPersonalizedSuggestions } from "@/lib/ai-analyzer"
import * as mammoth from "mammoth"
import { validateFile, validateJobName, validateJobDescription, isRateLimited, sanitizeText } from "@/lib/input-validator"

// Global cache type declaration
declare global {
  var cvCache: Map<string, {
    extractedText: string
    originalFile?: {
      buffer: Buffer
      filename: string
      mimetype: string
    }
    timestamp: number
    filename: string
    filesize: number
    filetype: string
  }> | undefined
}

// Function to preserve and normalize bullet points in text
function preserveBulletPoints(text: string): string {
  if (!text) return text
  
  // Split text into lines for processing
  let lines = text.split(/\r?\n/)
  
  // Process each line to identify and normalize bullet points
  lines = lines.map((line, index) => {
    const trimmedLine = line.trim()
    
    // Skip empty lines
    if (!trimmedLine) return line
    
    // Check for various bullet point patterns
    const bulletPatterns = [
      /^[•·‣⁃▪▫‒–—―◦⦿⦾]\s*(.+)$/,           // Unicode bullet points
      /^[\*\+\-]\s+(.+)$/,                     // ASCII bullets (*, +, -)
      /^[\u2022\u2023\u25E6\u2043\u204C\u204D\u2219\u25AA\u25AB\u25A0]\s*(.+)$/, // More unicode bullets
      /^[\d]+[\.):]\s*(.+)$/,                  // Numbered lists (1. 1) 1:)
      /^[a-zA-Z][\.):]\s*(.+)$/,               // Lettered lists (a. a) a:)
      /^[ivx]+[\.):]\s*(.+)$/i,                // Roman numerals
      /^\([\da-zA-Z]+\)\s*(.+)$/,             // Parenthetical numbering
      /^[\u25cf\u25cb\u25aa\u25ab\u2013\u2014]\s*(.+)$/,  // Additional bullet symbols
    ]
    
    // Check if line matches any bullet pattern
    for (const pattern of bulletPatterns) {
      const match = trimmedLine.match(pattern)
      if (match) {
        // Preserve the bullet point with consistent formatting
        const content = match[1] || match[0]
        return `• ${content.trim()}`
      }
    }
    
    // Check for lines that might be experience bullets or achievements
    // Common patterns in CVs:
    if (trimmedLine.length > 10 && trimmedLine.length < 300) {
      // Check for common CV bullet point indicators
      const cvBulletIndicators = [
        /^(Developed?|Implemented?|Managed?|Led|Created?|Designed?|Built|Achieved?|Increased?|Reduced?|Improved?)/i,
        /^(Responsible for|In charge of|Worked on|Collaborated|Coordinated)/i,
        /^(Successfully|Effectively|Efficiently)/i,
        /(\d+%|\d+\+|\$\d+|\d+ years?|\d+ months?)/,  // Contains metrics
      ]
      
      const shouldBeBullet = cvBulletIndicators.some(pattern => pattern.test(trimmedLine))
      
      if (shouldBeBullet && !trimmedLine.endsWith(':') && !/^[A-Z\s]+$/.test(trimmedLine)) {
        return `• ${trimmedLine}`
      }
    }
    
    // Check for indented lines that might be sub-bullets
    if (/^\s{2,}/.test(line) && trimmedLine.length > 5) {
      return `  • ${trimmedLine}`
    }
    
    return line
  })
  
  // Join lines back together
  let processedText = lines.join('\n')
  
  // Clean up extra whitespace while preserving structure
  processedText = processedText
    .replace(/\n\s*\n\s*\n/g, '\n\n')  // Remove excessive line breaks
    .replace(/[ \t]+/g, ' ')          // Normalize spaces
    .replace(/•\s+•/g, '•')      // Fix double bullets
    .trim()
  
  console.log('[Bullet Processing] Original length:', text.length, 'Processed length:', processedText.length)
  console.log('[Bullet Processing] Bullet points found:', (processedText.match(/•/g) || []).length)
  
  return processedText
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - check if the client is making too many requests
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (isRateLimited(clientIP)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    let jobName = formData.get("jobName") as string || ''
    let jobDescription = formData.get("jobDescription") as string || ''

    // Sanitize inputs to prevent XSS
    jobName = sanitizeText(jobName)
    jobDescription = sanitizeText(jobDescription)

    // Validate inputs
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file with enhanced security checks
    const fileValidation = validateFile(file)
    if (!fileValidation.isValid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 })
    }

    // Validate job name if provided
    if (jobName) {
      const jobNameValidation = validateJobName(jobName)
      if (!jobNameValidation.isValid) {
        return NextResponse.json({ error: jobNameValidation.error }, { status: 400 })
      }
    }

    // Validate job description if provided
    if (jobDescription) {
      const jobDescriptionValidation = validateJobDescription(jobDescription)
      if (!jobDescriptionValidation.isValid) {
        return NextResponse.json({ error: jobDescriptionValidation.error }, { status: 400 })
      }
    }

    // Check file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Extract text from different file types and store original file
    let extractedText = ""
    let cacheKey = ""
    let originalFileBuffer: Buffer

    try {
      // Get file buffer first
      originalFileBuffer = Buffer.from(await file.arrayBuffer())
      
      if (file.type === "text/plain") {
        const rawText = await file.text()
        extractedText = preserveBulletPoints(rawText)
        
        console.log('[Text Processing] Raw text length:', rawText.length)
        console.log('[Text Processing] Processed text length:', extractedText.length)
      } else if (file.type === "application/pdf") {
        // Parse PDF file using dynamic import to avoid build issues
        const pdfParse = (await import('pdf-parse')).default
        const pdfData = await pdfParse(originalFileBuffer)
        
        // Process the extracted text to preserve bullet points
        const rawText = pdfData.text
        extractedText = preserveBulletPoints(rawText)
        
        console.log('[PDF Processing] Raw text length:', rawText.length)
        console.log('[PDF Processing] Processed text length:', extractedText.length)
        console.log('[PDF Processing] Sample processed text:', extractedText.substring(0, 500) + '...')
      } else if (
        file.type === "application/msword" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // Parse Word document
        const result = await mammoth.extractRawText({ buffer: originalFileBuffer })
        
        // Process the extracted text to preserve bullet points
        const rawText = result.value
        extractedText = preserveBulletPoints(rawText)
        
        console.log('[Word Processing] Raw text length:', rawText.length)
        console.log('[Word Processing] Processed text length:', extractedText.length)
        console.log('[Word Processing] Sample processed text:', extractedText.substring(0, 500) + '...')
      }

      // Check if we successfully extracted any text
      if (!extractedText || extractedText.trim().length === 0) {
        return NextResponse.json({
          success: false,
          error: "Tidak ada data",
          message: "Tidak dapat mengekstrak teks dari file yang diunggah"
        }, { status: 400 })
      }

      // Cache the extracted text in a simple in-memory cache
      // In production, you might want to use Redis or another caching solution
      cacheKey = `cv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Store in a simple cache object (you can replace this with Redis in production)
      if (typeof globalThis.cvCache === 'undefined') {
        globalThis.cvCache = new Map()
      }
      
      globalThis.cvCache.set(cacheKey, {
        extractedText,
        originalFile: {
          buffer: originalFileBuffer,
          filename: file.name,
          mimetype: file.type
        },
        timestamp: Date.now(),
        filename: file.name,
        filesize: file.size,
        filetype: file.type
      })

      console.log(`[CV Cache] Stored CV with key: ${cacheKey}`)

    } catch (extractionError) {
      console.error("Text extraction error:", extractionError)
      return NextResponse.json({
        success: false,
        error: "Tidak ada data",
        message: "Gagal mengekstrak teks dari file. Pastikan file tidak rusak dan dalam format yang didukung."
      }, { status: 400 })
    }

    // Perform enhanced AI analysis with job information
    const analysis = await analyzeCV(
      extractedText, 
      jobName, 
      jobDescription
    )

    console.log("[v0] Analysis completed:", analysis.isAIEnhanced ? "AI Enhanced" : "Traditional")

    // Generate AI-powered personalized suggestions from HRD perspective
    let personalizedSuggestions: string[]
    
    // Always try AI first for dynamic suggestions
    console.log("[v0] Generating AI-powered HRD personalized suggestions...")
    console.log("[v0] Job context:", { jobName: jobName || 'Not specified', jobDescription: jobDescription || 'Not specified' })
    
    try {
      personalizedSuggestions = await generateHRDPersonalizedSuggestions(
        extractedText,
        jobName,
        jobDescription
      )
      
      // Verify we got valid AI suggestions
      if (personalizedSuggestions && personalizedSuggestions.length === 5) {
        console.log("[v0] ✅ AI-powered HRD personalized suggestions successfully generated:", personalizedSuggestions.length, "suggestions")
        console.log("[v0] AI Suggestions:", personalizedSuggestions)
      } else {
        throw new Error("Invalid AI response: Expected 5 suggestions, got " + (personalizedSuggestions?.length || 0))
      }
    } catch (suggestionError) {
      console.error("[v0] ❌ Failed to generate AI suggestions:", suggestionError)
      console.warn("[v0] Using static fallback suggestions due to AI failure")
      
      // Enhanced fallback with job context awareness
      personalizedSuggestions = [
        `Sesuaikan CV dengan kata kunci spesifik dari posisi ${jobName || 'yang dilamar'} untuk meningkatkan ATS compatibility`,
        "Tambahkan lebih banyak pencapaian yang dapat diukur dengan angka spesifik dan persentase",
        "Gunakan kata kerja aktif yang kuat di awal setiap poin pengalaman kerja",
        "Pastikan format CV konsisten dan mudah dibaca oleh sistem ATS modern",
        "Sertakan ringkasan profesional yang menonjolkan kualifikasi utama sesuai job requirement"
      ]
    }

    return NextResponse.json({
      success: true,
      analysis: {
        overallScore: analysis.overallScore,
        results: analysis.results,
        metadata: analysis.parsedCV.metadata,
        aiInsights: analysis.aiAnalysis,
        personalizedSuggestions,
        comprehensiveScore: analysis.comprehensiveScore,
        industry: analysis.industry,
        rankingInsights: analysis.rankingInsights,
        isAIEnhanced: analysis.isAIEnhanced,
        extractedText: extractedText,
        parsedSections: analysis.parsedCV.sections,
        cacheKey: cacheKey, // Include cache key in response for potential future use
      },
    })
  } catch (error) {
    console.error("CV Analysis Error:", error)
    return NextResponse.json({ error: "Failed to analyze CV" }, { status: 500 })
  }
}

// GET endpoint to retrieve cached CV data
export async function GET(request: NextRequest) {
  try {
    // Rate limiting for GET requests too
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (isRateLimited(clientIP)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const cacheKey = searchParams.get('key')
    
    if (!cacheKey) {
      return NextResponse.json({ error: "Cache key required" }, { status: 400 })
    }
    
    if (!globalThis.cvCache) {
      return NextResponse.json({ error: "Cache not initialized" }, { status: 404 })
    }
    
    const cachedData = globalThis.cvCache.get(cacheKey)
    
    if (!cachedData) {
      return NextResponse.json({ error: "Cache key not found" }, { status: 404 })
    }
    
    // Check if cache entry is older than 1 hour (3600000 ms)
    const isExpired = Date.now() - cachedData.timestamp > 3600000
    
    if (isExpired) {
      globalThis.cvCache.delete(cacheKey)
      return NextResponse.json({ error: "Cache expired" }, { status: 404 })
    }
    
    // Convert buffer to base64 for transmission
    const base64Buffer = cachedData.originalFile?.buffer ? 
      cachedData.originalFile.buffer.toString('base64') : 
      null;
    
    return NextResponse.json({
      success: true,
      data: {
        filename: cachedData.filename,
        filesize: cachedData.filesize,
        filetype: cachedData.filetype,
        timestamp: cachedData.timestamp,
        extractedText: cachedData.extractedText,
        originalFile: base64Buffer ? {
          buffer: base64Buffer,
          filename: cachedData.originalFile?.filename,
          mimetype: cachedData.originalFile?.mimetype
        } : null
      }
    })
    
  } catch (error) {
    console.error("Cache retrieval error:", error)
    return NextResponse.json({ error: "Failed to retrieve cached data" }, { status: 500 })
  }
}