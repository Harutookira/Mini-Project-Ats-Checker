import { type NextRequest, NextResponse } from "next/server"
import { analyzeCV } from "@/lib/cv-analyzer"
import { analyzeWithAI, generatePersonalizedSuggestions } from "@/lib/ai-analyzer"
import * as mammoth from "mammoth"

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const jobName = formData.get("jobName") as string || ''
    const jobDescription = formData.get("jobDescription") as string || ''

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
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
        extractedText = await file.text()
      } else if (file.type === "application/pdf") {
        // Parse PDF file using dynamic import to avoid build issues
        const pdfParse = (await import('pdf-parse')).default
        const pdfData = await pdfParse(originalFileBuffer)
        extractedText = pdfData.text
      } else if (
        file.type === "application/msword" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // Parse Word document
        const result = await mammoth.extractRawText({ buffer: originalFileBuffer })
        extractedText = result.value
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

    // Use static personalized suggestions to avoid server-side AI calls
    const personalizedSuggestions = [
      "Tambahkan lebih banyak pencapaian yang dapat diukur dengan angka spesifik",
      "Gunakan kata kerja aktif yang kuat di awal setiap poin pengalaman",
      "Pastikan format CV konsisten dan mudah dibaca oleh ATS",
      "Sertakan kata kunci yang relevan dengan posisi yang dilamar",
      "Tambahkan ringkasan profesional yang menonjolkan kualifikasi utama"
    ]
    console.log("[v0] Personalized suggestions provided:", personalizedSuggestions.length, "suggestions")

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
    
    return NextResponse.json({
      success: true,
      data: {
        filename: cachedData.filename,
        filesize: cachedData.filesize,
        filetype: cachedData.filetype,
        timestamp: cachedData.timestamp,
        extractedText: cachedData.extractedText
      }
    })
    
  } catch (error) {
    console.error("Cache retrieval error:", error)
    return NextResponse.json({ error: "Failed to retrieve cached data" }, { status: 500 })
  }
}
