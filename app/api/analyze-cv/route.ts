import { type NextRequest, NextResponse } from "next/server"
import { analyzeCV } from "@/lib/cv-analyzer"
import { analyzeWithAI, generatePersonalizedSuggestions } from "@/lib/ai-analyzer"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

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

    // For now, we'll simulate text extraction
    // In a real implementation, you'd use libraries like pdf-parse for PDFs
    // and mammoth for Word documents
    let extractedText = ""

    if (file.type === "text/plain") {
      extractedText = await file.text()
    } else {
      // Simulate extracted text for demo purposes
      extractedText = `
        John Doe
        Software Engineer
        john.doe@email.com
        +1-555-123-4567
        linkedin.com/in/johndoe
        
        PROFESSIONAL SUMMARY
        Experienced software engineer with 5+ years developing web applications using React, Node.js, and Python. Led team of 4 developers and improved system performance by 40%.
        
        EXPERIENCE
        Senior Software Engineer | Tech Company | 2021-Present
        • Developed and maintained React applications serving 10,000+ users
        • Implemented REST APIs using Node.js and Express
        • Collaborated with cross-functional teams in Agile environment
        • Reduced application load time by 35% through optimization
        
        Software Engineer | StartupCorp | 2019-2021
        • Built full-stack web applications using JavaScript and Python
        • Designed database schemas and optimized SQL queries
        • Participated in code reviews and mentored junior developers
        
        EDUCATION
        Bachelor of Science in Computer Science
        University of Technology | 2015-2019
        
        SKILLS
        JavaScript, React, Node.js, Python, SQL, AWS, Docker, Git, Agile, Scrum
      `
    }

    // Perform standard analysis
    const standardAnalysis = analyzeCV(extractedText)

    console.log("[v0] Starting AI analysis with Gemini API")

    // Perform AI analysis
    const aiAnalysis = await analyzeWithAI(extractedText)
    console.log("[v0] AI analysis completed:", aiAnalysis.overallAssessment ? "Success" : "Fallback used")

    const personalizedSuggestions = await generatePersonalizedSuggestions(extractedText)
    console.log("[v0] Personalized suggestions generated:", personalizedSuggestions.length, "suggestions")

    return NextResponse.json({
      success: true,
      analysis: {
        overallScore: standardAnalysis.overallScore,
        results: standardAnalysis.results,
        metadata: standardAnalysis.parsedCV.metadata,
        aiInsights: aiAnalysis,
        personalizedSuggestions,
        comprehensiveScore: standardAnalysis.comprehensiveScore,
        industry: standardAnalysis.industry,
        rankingInsights: standardAnalysis.rankingInsights,
      },
    })
  } catch (error) {
    console.error("CV Analysis Error:", error)
    return NextResponse.json({ error: "Failed to analyze CV" }, { status: 500 })
  }
}
