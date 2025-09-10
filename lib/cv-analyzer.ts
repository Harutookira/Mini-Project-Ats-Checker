export interface CVAnalysisResult {
  category: string
  score: number
  status: "excellent" | "good" | "needs-improvement" | "poor"
  issues: string[]
  recommendations: string[]
}

export interface ParsedCV {
  text: string
  sections: {
    contact?: string
    summary?: string
    experience?: string
    education?: string
    skills?: string
  }
  metadata: {
    wordCount: number
    hasEmail: boolean
    hasPhone: boolean
    hasLinkedIn: boolean
    sectionCount: number
  }
}

// Parse CV text and extract sections
export function parseCV(text: string): ParsedCV {
  const sections: ParsedCV["sections"] = {}
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  // Common section headers
  const sectionPatterns = {
    contact: /^(contact|personal|info)/i,
    summary: /^(summary|profile|objective|about)/i,
    experience: /^(experience|work|employment|career|professional)/i,
    education: /^(education|academic|qualification|degree)/i,
    skills: /^(skills|technical|competenc|abilities)/i,
  }

  let currentSection = ""
  let sectionContent: string[] = []

  for (const line of lines) {
    let foundSection = false

    // Check if line is a section header
    for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(line)) {
        // Save previous section
        if (currentSection && sectionContent.length > 0) {
          sections[currentSection as keyof typeof sections] = sectionContent.join(" ")
        }

        currentSection = sectionName
        sectionContent = []
        foundSection = true
        break
      }
    }

    if (!foundSection && currentSection) {
      sectionContent.push(line)
    }
  }

  // Save last section
  if (currentSection && sectionContent.length > 0) {
    sections[currentSection as keyof typeof sections] = sectionContent.join(" ")
  }

  // Extract metadata
  const metadata = {
    wordCount: text.split(/\s+/).length,
    hasEmail: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text),
    hasPhone: /(\+62[\s-]?\d{3,4}[\s-]?\d{3,4}[\s-]?\d{3,4})|(08\d{2}[\s-]?\d{4}[\s-]?\d{4})|(\+62[\s-]?\d{8,12})|(08\d{8,12})|([\(]?\d{3}[\)]?[\s-]?\d{3}[\s-]?\d{4})/.test(text),
    hasLinkedIn: /linkedin\.com\/in\//.test(text.toLowerCase()),
    sectionCount: Object.keys(sections).length,
  }

  return {
    text,
    sections,
    metadata,
  }
}

// Analyze CV parsing compatibility
export function analyzeParsing(parsedCV: ParsedCV): CVAnalysisResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 2

  // Check essential contact information
  if (!parsedCV.metadata.hasEmail) {
    issues.push("Email address not detected or poorly formatted")
    recommendations.push("Include a clear email address in standard format")
    score -= 15
  }

  if (!parsedCV.metadata.hasPhone) {
    issues.push("Phone number not detected or poorly formatted")
    recommendations.push("Include phone number in standard format (e.g., +1-555-123-4567)")
    score -= 10
  }

  // Check section structure
  if (parsedCV.metadata.sectionCount < 3) {
    issues.push("Limited section structure detected")
    recommendations.push('Use clear section headers like "Experience", "Education", "Skills"')
    score -= 20
  }

  if (!parsedCV.sections.experience) {
    issues.push("Experience section not clearly identified")
    recommendations.push("Use standard header 'Experience' or 'Work Experience'")
    score -= 15
  }

  if (!parsedCV.sections.education) {
    issues.push("Education section not clearly identified")
    recommendations.push("Include clear 'Education' section with degrees and institutions")
    score -= 10
  }

  // Determine status
  let status: CVAnalysisResult["status"]
  if (score >= 85) status = "excellent"
  else if (score >= 70) status = "good"
  else if (score >= 50) status = "needs-improvement"
  else status = "poor"

  return {
    category: "CV Parsing",
    score: Math.max(0, score),
    status,
    issues,
    recommendations,
  }
}

// New ATS evaluation based on 5 criteria
export function analyzeQuantitativeImpact(parsedCV: ParsedCV, jobDescription: string = ''): CVAnalysisResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100

  const text = parsedCV.text.toLowerCase()
  const jobDesc = jobDescription.toLowerCase()

  // Check for quantifiable achievements
  const hasNumbers = /\d+%|\d+\+|\$\d+|\d+ years?|\d+ months?|\d+ projects?|\d+ clients?|\d+ users?/g.test(text)
  const quantifiableMatches = text.match(/\d+%|\d+\+|\$\d+|\d+ years?|\d+ months?|\d+ projects?|\d+ clients?|\d+ users?/g) || []
  
  if (quantifiableMatches.length < 3) {
    issues.push("Kurang dampak kuantitatif dalam pengalaman kerja")
    recommendations.push("Tambahkan angka spesifik seperti peningkatan 25%, mengelola 10+ proyek, dll")
    score -= 30
  }

  // Check relevance to job description
  if (jobDesc) {
    const jobKeywords = jobDesc.match(/\b\w{4,}\b/g) || []
    const relevantKeywords = jobKeywords.filter(keyword => text.includes(keyword))
    const relevanceScore = (relevantKeywords.length / Math.max(jobKeywords.length, 1)) * 100
    
    if (relevanceScore < 30) {
      issues.push("Pengalaman kerja kurang relevan dengan posisi yang dilamar")
      recommendations.push("Sesuaikan pengalaman dengan requirement job description")
      score -= 25
    }
  }

  // Check for project experience
  const hasProjects = /project|proyek|pengembangan|implementasi|membangun|menciptakan/i.test(text)
  if (!hasProjects) {
    issues.push("Tidak ada pengalaman project yang jelas")
    recommendations.push("Sertakan project-project relevan yang pernah dikerjakan")
    score -= 20
  }

  let status: CVAnalysisResult["status"]
  if (score >= 85) status = "excellent"
  else if (score >= 70) status = "good"
  else if (score >= 50) status = "needs-improvement"
  else status = "poor"

  return {
    category: "Dampak Kuantitatif",
    score: Math.max(0, score),
    status,
    issues,
    recommendations,
  }
}

// Analyze keyword matching
export function analyzeKeywords(parsedCV: ParsedCV, targetKeywords: string[] = []): CVAnalysisResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100

  const text = parsedCV.text.toLowerCase()

  // Common professional keywords
  const commonKeywords = [
    "managed",
    "developed",
    "implemented",
    "created",
    "designed",
    "led",
    "coordinated",
    "analyzed",
    "improved",
    "optimized",
    "achieved",
    "delivered",
    "collaborated",
  ]

  const technicalKeywords = [
    "javascript",
    "python",
    "react",
    "node.js",
    "sql",
    "aws",
    "docker",
    "git",
    "agile",
    "scrum",
    "api",
    "database",
    "frontend",
    "backend",
    "full-stack",
  ]

  // Check for action verbs
  const actionVerbsFound = commonKeywords.filter((keyword) => text.includes(keyword))
  if (actionVerbsFound.length < 5) {
    issues.push("Limited use of strong action verbs")
    recommendations.push("Include more action verbs like 'managed', 'developed', 'implemented'")
    score -= 15
  }

  // Check for technical skills
  const techSkillsFound = technicalKeywords.filter((keyword) => text.includes(keyword))
  if (techSkillsFound.length < 3) {
    issues.push("Limited technical keywords detected")
    recommendations.push("Include relevant technical skills and technologies")
    score -= 20
  }

  // Check keyword density
  const totalWords = parsedCV.metadata.wordCount
  const keywordDensity = ((actionVerbsFound.length + techSkillsFound.length) / totalWords) * 100

  if (keywordDensity < 2) {
    issues.push("Low keyword density for ATS optimization")
    recommendations.push("Naturally incorporate more industry-relevant keywords")
    score -= 23
  }

  // Check for quantifiable achievements
  const hasNumbers = /\d+%|\d+\+|\$\d+|\d+ years?|\d+ months?/.test(text)
  if (!hasNumbers) {
    issues.push("Missing quantifiable achievements")
    recommendations.push("Include specific numbers, percentages, and metrics")
    score -= 20
  }

  let status: CVAnalysisResult["status"]
  if (score >= 85) status = "excellent"
  else if (score >= 70) status = "good"
  else if (score >= 50) status = "needs-improvement"
  else status = "poor"

  return {
    category: "Keyword Matching",
    score: Math.max(0, score),
    status,
    issues,
    recommendations,
  }
}

// Analyze CV length (200-600 words optimal)
export function analyzeCVLength(parsedCV: ParsedCV): CVAnalysisResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100

  const wordCount = parsedCV.metadata.wordCount

  if (wordCount < 200) {
    issues.push(`CV terlalu pendek (${wordCount} kata). Ideal 200-600 kata`)
    recommendations.push("Tambahkan detail pengalaman, skill, dan pencapaian")
    score -= 40
  } else if (wordCount > 600) {
    issues.push(`CV terlalu panjang (${wordCount} kata). Ideal 200-600 kata`)
    recommendations.push("Ringkas konten, fokus pada informasi paling relevan")
    score -= 25
  } else if (wordCount >= 200 && wordCount <= 600) {
    // Perfect range, give bonus points
    score = 100
  }

  let status: CVAnalysisResult["status"]
  if (score >= 85) status = "excellent"
  else if (score >= 70) status = "good"
  else if (score >= 50) status = "needs-improvement"
  else status = "poor"

  return {
    category: "Panjang CV",
    score: Math.max(0, score),
    status,
    issues,
    recommendations,
  }
}

// Analyze bullet points (10-30 words optimal)
export function analyzeBulletPoints(parsedCV: ParsedCV): CVAnalysisResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100

  const text = parsedCV.text
  
  // Find bullet points
  const bulletLines = text.split('\n').filter(line => 
    /^\s*[•·▪▫◦‣⁃\-\*\+]\s/.test(line) || 
    /^\s*\d+\.\s/.test(line)
  )

  if (bulletLines.length === 0) {
    issues.push("Tidak ada bullet points yang terdeteksi")
    recommendations.push("Gunakan bullet points untuk menjelaskan pengalaman kerja")
    score -= 30
  } else {
    // Analyze bullet point length
    let shortBullets = 0
    let longBullets = 0
    let optimalBullets = 0

    bulletLines.forEach(line => {
      const words = line.replace(/^\s*[•·▪▫◦‣⁃\-\*\+\d\.]/g, '').trim().split(/\s+/).length
      if (words < 10) shortBullets++
      else if (words > 30) longBullets++
      else optimalBullets++
    })

    if (shortBullets > bulletLines.length * 0.5) {
      issues.push("Banyak bullet points terlalu pendek (kurang dari 10 kata)")
      recommendations.push("Perluas deskripsi dengan detail pencapaian dan hasil")
      score -= 20
    }

    if (longBullets > bulletLines.length * 0.3) {
      issues.push("Beberapa bullet points terlalu panjang (lebih dari 30 kata)")
      recommendations.push("Ringkas bullet points menjadi 10-30 kata per poin")
      score -= 15
    }
  }

  let status: CVAnalysisResult["status"]
  if (score >= 85) status = "excellent"
  else if (score >= 70) status = "good"
  else if (score >= 50) status = "needs-improvement"
  else status = "poor"

  return {
    category: "Ringkasan Bullet Point",
    score: Math.max(0, score),
    status,
    issues,
    recommendations,
  }
}

// Analyze CV completeness
export function analyzeCVCompleteness(parsedCV: ParsedCV): CVAnalysisResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100

  const requiredSections = {
    'Nama': parsedCV.metadata.hasEmail || parsedCV.sections.contact,
    'Kontak': parsedCV.metadata.hasEmail && parsedCV.metadata.hasPhone,
    'Deskripsi/Summary': parsedCV.sections.summary,
    'Pengalaman Kerja': parsedCV.sections.experience,
    'Pendidikan': parsedCV.sections.education,
    'Skills': parsedCV.sections.skills
  }

  const text = parsedCV.text.toLowerCase()
  
  // Check for organizational experience
  const hasOrganizational = /organisasi|volunteer|komunitas|committee|pengurus|anggota/i.test(text)
  
  // Check for achievements
  const hasAchievements = /achievement|prestasi|penghargaan|award|sertifikat|certification/i.test(text)
  
  Object.entries(requiredSections).forEach(([section, exists]) => {
    if (!exists) {
      issues.push(`Bagian ${section} tidak lengkap atau tidak terdeteksi`)
      recommendations.push(`Lengkapi bagian ${section} dalam CV`)
      score -= 15
    }
  })

  if (!hasOrganizational) {
    issues.push("Pengalaman organisasi tidak terdeteksi")
    recommendations.push("Sertakan pengalaman organisasi, volunteer, atau aktivitas komunitas")
    score -= 10
  }

  if (!hasAchievements) {
    issues.push("Pencapaian/prestasi tidak terdeteksi")
    recommendations.push("Tambahkan bagian pencapaian, sertifikat, atau penghargaan")
    score -= 10
  }

  let status: CVAnalysisResult["status"]
  if (score >= 85) status = "excellent"
  else if (score >= 70) status = "good"
  else if (score >= 50) status = "needs-improvement"
  else status = "poor"

  return {
    category: "Kelengkapan CV",
    score: Math.max(0, score),
    status,
    issues,
    recommendations,
  }
}

// Analyze job-specific keywords with enhanced comparison
export function analyzeJobKeywords(parsedCV: ParsedCV, jobDescription: string = '', jobName: string = ''): CVAnalysisResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 0 // Start with 0 and calculate based on keyword match rate

  const cvText = parsedCV.text.toLowerCase()
  const jobDesc = jobDescription.toLowerCase()
  const jobTitle = jobName.toLowerCase()

  if (!jobDescription && !jobName) {
    issues.push("Tidak ada informasi pekerjaan target untuk analisis keyword")
    recommendations.push("Masukkan nama pekerjaan dan deskripsi untuk analisis yang lebih akurat")
    score = 0 // Give 0 score when no job info provided as requested
  } else {
    // Enhanced keyword extraction with better filtering
    const stopWords = new Set([
      'dengan', 'untuk', 'yang', 'dari', 'dalam', 'pada', 'akan', 'dapat', 'harus', 
      'atau', 'dan', 'juga', 'this', 'that', 'with', 'from', 'will', 'have', 'been', 
      'are', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'as',
      'is', 'was', 'be', 'by', 'an', 'a', 'we', 'you', 'they', 'their', 'our', 'your'
    ])
    
    // Extract meaningful keywords from job description (4+ chars, not stop words)
    const jobKeywords = [...new Set([
      ...jobDesc.match(/\b\w{4,}\b/g) || [],
      ...jobTitle.match(/\b\w{3,}\b/g) || []
    ])].filter(word => !stopWords.has(word))
    
    // Extract technical skills and action verbs specifically
    const technicalTerms = jobKeywords.filter(word => 
      /^(javascript|python|react|node|java|sql|aws|docker|git|api|database|frontend|backend|full.?stack|html|css|mongodb|mysql|postgresql|redis|kubernetes|typescript|angular|vue|laravel|php|c\+\+|c#|.net|spring|django|flask|express|agile|scrum|devops|ci\/cd|restful|graphql|json|xml|bootstrap|jquery|sass|less|webpack|babel|npm|yarn|linux|windows|macos|android|ios|swift|kotlin|flutter|dart|go|rust|scala|ruby|rails|pandas|numpy|tensorflow|pytorch|machine.learning|ai|data.science|business.intelligence|powerbi|tableau|excel|word|powerpoint|photoshop|illustrator|figma|sketch|adobe|marketing|seo|sem|google.analytics|facebook.ads|content.marketing|social.media|copywriting|email.marketing|crm|salesforce|hubspot|jira|confluence|slack|teams|zoom|project.management|leadership|communication|teamwork|problem.solving|analytical|creative|detail.oriented|time.management)$/i.test(word)
    )
    
    const actionVerbs = jobKeywords.filter(word => 
      /^(develop|manage|lead|create|design|implement|analyze|optimize|coordinate|collaborate|execute|deliver|achieve|improve|build|maintain|support|troubleshoot|debug|test|deploy|monitor|document|train|mentor|supervise|organize|plan|strategize|negotiate|present|communicate|research|evaluate|assess|review|audit|ensure|verify|validate|integrate|configure|customize|automate|streamline|enhance|upgrade|migrate|scale|secure|protect|backup|restore|recover|install|setup|initialize|launch|execute|operate|administer|facilitate|moderate|guide|assist|counsel|advise|recommend|suggest|propose|draft|write|edit|publish|broadcast|market|promote|advertise|sell|purchase|procure|contract|budget|forecast|report|track|measure|calculate|compute|estimate|predict|model|simulate|visualize|chart|graph|dashboard|present|demonstrate|showcase|exhibit|display)$/i.test(word)
    )
    
    // Enhanced matching with partial word matching for technical terms
    const directMatches = jobKeywords.filter(keyword => cvText.includes(keyword))
    const partialMatches = technicalTerms.filter(term => {
      const baseWord = term.replace(/[.-]/g, '') // Remove dots and dashes
      return cvText.includes(baseWord) || cvText.includes(term.replace(/\./g, ''))
    })
    
    const allMatches = [...new Set([...directMatches, ...partialMatches])]
    const keywordMatchRate = (allMatches.length / Math.max(jobKeywords.length, 1)) * 100
    
    // Score calculation with bonuses for technical and action verb matches
    score = Math.round(keywordMatchRate)
    
    // Bonus points for technical skills relevance
    if (technicalTerms.length > 0) {
      const techMatches = technicalTerms.filter(term => 
        cvText.includes(term) || cvText.includes(term.replace(/[.-]/g, ''))
      )
      const techMatchRate = (techMatches.length / technicalTerms.length) * 100
      if (techMatchRate > keywordMatchRate) {
        score = Math.min(100, score + Math.round((techMatchRate - keywordMatchRate) * 0.3))
      }
    }
    
    // Provide detailed feedback with specific numbers
    const totalKeywords = jobKeywords.length
    const matchedCount = allMatches.length
    
    if (keywordMatchRate === 0) {
      issues.push(`Tidak ada kata kunci job yang cocok (0 dari ${totalKeywords} kata kunci)`)
      recommendations.push("Sesuaikan CV dengan kata kunci dari job description yang disediakan")
    } else if (keywordMatchRate < 20) {
      issues.push(`Hanya ${matchedCount} dari ${totalKeywords} kata kunci job yang cocok (${Math.round(keywordMatchRate)}%)`)
      recommendations.push("Tingkatkan penggunaan kata kunci yang relevan dengan job description")
    } else if (keywordMatchRate < 40) {
      issues.push(`${matchedCount} dari ${totalKeywords} kata kunci job yang cocok (${Math.round(keywordMatchRate)}% - kurang optimal)`)
      recommendations.push("Tambahkan lebih banyak kata kunci yang sesuai dengan requirement job")
    } else if (keywordMatchRate < 60) {
      recommendations.push(`${matchedCount} dari ${totalKeywords} kata kunci cocok (${Math.round(keywordMatchRate)}%) - tingkatkan untuk hasil optimal`)
    } else {
      recommendations.push(`Bagus! ${matchedCount} dari ${totalKeywords} kata kunci cocok (${Math.round(keywordMatchRate)}%) dengan job description`)
    }
    
    // Specific technical skills feedback
    if (technicalTerms.length > 0) {
      const techMatches = technicalTerms.filter(term => 
        cvText.includes(term) || cvText.includes(term.replace(/[.-]/g, ''))
      )
      if (techMatches.length === 0) {
        issues.push("Technical skills yang diminta tidak terdeteksi dalam CV")
        recommendations.push(`Tambahkan technical skills seperti: ${technicalTerms.slice(0, 5).join(', ')}`)
      } else if (techMatches.length < technicalTerms.length * 0.5) {
        recommendations.push(`Pertimbangkan menambah skills: ${technicalTerms.filter(t => !techMatches.includes(t)).slice(0, 3).join(', ')}`)
      }
    }

    // Check for job title relevance
    if (jobTitle && !cvText.includes(jobTitle.split(' ')[0])) {
      issues.push(`Posisi "${jobName}" tidak terdeteksi atau kurang prominent dalam CV`)
      recommendations.push(`Pastikan CV menunjukkan relevansi yang jelas dengan posisi ${jobName}`)
      score = Math.max(0, score - 5) // Small penalty
    }
  }

  let status: CVAnalysisResult["status"]
  if (score >= 80) status = "excellent"
  else if (score >= 60) status = "good"
  else if (score >= 30) status = "needs-improvement"
  else status = "poor"

  return {
    category: "Kata Kunci Sesuai Job",
    score: Math.max(0, Math.min(100, score)),
    status,
    issues,
    recommendations,
  }
}

function analyzeScoring(parsedCV: ParsedCV): CVAnalysisResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100

  const text = parsedCV.text.toLowerCase()

  // Check CV length
  if (parsedCV.metadata.wordCount < 200) {
    issues.push("CV appears too short for comprehensive evaluation")
    recommendations.push("Expand experience descriptions with more detail")
    score -= 25
  } else if (parsedCV.metadata.wordCount > 800) {
    issues.push("CV may be too lengthy for ATS processing")
    recommendations.push("Condense content to 1-2 pages for better ATS compatibility")
    score -= 15
  }

  // Check for employment gaps explanation
  const hasDateRanges = /\d{4}[-–]\d{4}|\d{4}[-–]present/i.test(text)
  if (!hasDateRanges) {
    issues.push("Employment dates not clearly formatted")
    recommendations.push("Include clear date ranges (e.g., 2020-2023) for all positions")
    score -= 20
  }

  // Check for skills section
  if (!parsedCV.sections.skills) {
    issues.push("Skills section not clearly identified")
    recommendations.push("Include dedicated 'Skills' section with relevant competencies")
    score -= 15
  }

  // Check for professional summary
  if (!parsedCV.sections.summary) {
    issues.push("Professional summary or objective missing")
    recommendations.push("Add brief professional summary at the top of your CV")
    score -= 10
  }

  let status: CVAnalysisResult["status"]
  if (score >= 85) status = "excellent"
  else if (score >= 70) status = "good"
  else if (score >= 50) status = "needs-improvement"
  else status = "poor"

  return {
    category: "Scoring & Ranking",
    score: Math.max(0, score),
    status,
    issues,
    recommendations,
  }
}

// Analyze format and readability
export function analyzeFormat(parsedCV: ParsedCV): CVAnalysisResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100

  const text = parsedCV.text

  // Check for consistent formatting indicators
  const hasBulletPoints = /[•·▪▫◦‣⁃]/.test(text) || /^\s*[\-\*\+]\s/m.test(text)
  if (!hasBulletPoints) {
    issues.push("Limited use of bullet points detected")
    recommendations.push("Use bullet points to organize information clearly")
    score -= 15
  }

  // Check for proper capitalization
  const hasProperCapitalization = /^[A-Z]/.test(text.trim())
  if (!hasProperCapitalization) {
    issues.push("Inconsistent capitalization detected")
    recommendations.push("Ensure proper capitalization throughout the document")
    score -= 10
  }

  // Check for special characters that might cause parsing issues
  const hasProblematicChars = /[^\x00-\x7F]/.test(text)
  if (hasProblematicChars) {
    issues.push("Special characters detected that may cause parsing issues")
    recommendations.push("Use standard ASCII characters to ensure compatibility")
    score -= 15
  }

  // Check line length and structure
  const lines = text.split("\n")
  const longLines = lines.filter((line) => line.length > 100).length
  if (longLines > lines.length * 0.3) {
    issues.push("Many lines appear too long for optimal readability")
    recommendations.push("Break long sentences into shorter, more readable lines")
    score -= 10
  }

  // Check for consistent spacing
  const hasConsistentSpacing = !/\s{3,}/.test(text)
  if (!hasConsistentSpacing) {
    issues.push("Inconsistent spacing detected")
    recommendations.push("Use consistent spacing throughout the document")
    score -= 10
  }

  let status: CVAnalysisResult["status"]
  if (score >= 85) status = "excellent"
  else if (score >= 70) status = "good"
  else if (score >= 50) status = "needs-improvement"
  else status = "poor"

  return {
    category: "Format & Readability",
    score: Math.max(0, score),
    status,
    issues,
    recommendations,
  }
}

// Main analysis function with AI-based evaluation
import { calculateComprehensiveScore, detectIndustry, generateRankingInsights } from "./scoring-system"
import { analyzeWithAIAndScore, AIAnalysisResult, aiEvaluateCV } from "./ai-analyzer"

// Main analysis function with AI-based evaluation (supports PDF input)
export async function analyzeCV(text: string, jobName: string = '', jobDescription: string = ''): Promise<{
  parsedCV: ParsedCV
  results: CVAnalysisResult[]
  overallScore: number
  comprehensiveScore: any
  industry: string
  rankingInsights: string[]
  aiAnalysis?: AIAnalysisResult
  isAIEnhanced: boolean
}> {
  const parsedCV = parseCV(text)

  // Try to get AI-enhanced analysis first
  let aiAnalysis: AIAnalysisResult | undefined
  let isAIEnhanced = false
  let results: CVAnalysisResult[] = []

  try {
    console.log("[CV Analyzer] Using traditional rule-based evaluation")
    
    // Use traditional rule-based evaluation only (no AI calls from server-side)
    results = [
      analyzeQuantitativeImpact(parsedCV, jobDescription),
      analyzeCVLength(parsedCV),
      analyzeCVCompleteness(parsedCV),
      analyzeJobKeywords(parsedCV, jobDescription, jobName),
    ]
    
    console.log("[CV Analyzer] Traditional analysis successful")
    
    // Try to get AI analysis for insights (client-side only)
    try {
      const aiResult = await analyzeWithAIAndScore(text)
      aiAnalysis = aiResult.aiAnalysis
      isAIEnhanced = true
    } catch (aiError) {
      console.log("AI insights not available on server-side, using traditional analysis only")
    }
    
  } catch (error) {
    console.warn("[CV Analyzer] Analysis error:", error)
    
    // Fallback to basic traditional evaluation
    results = [
      analyzeQuantitativeImpact(parsedCV, jobDescription),
      analyzeCVLength(parsedCV),
      analyzeCVCompleteness(parsedCV),
      analyzeJobKeywords(parsedCV, jobDescription, jobName),
    ]
  }

  const overallScore = Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length)

  // Enhanced scoring system based on 4 criteria
  const categoryScores = {
    parsing: results.length >= 3 ? results[2].score : 75, // completeness
    keywords: results.length >= 4 ? results[3].score : 70, // job keywords
    content: results.length >= 2 ? (results[0].score + results[1].score) / 2 : 70, // quantitative + length
    format: results.length >= 3 ? results[2].score : 75 // completeness fallback
  }

  // Use AI-detected industry if available
  const industry = aiAnalysis?.industryDetected || 'general'
  
  return {
    parsedCV,
    results,
    overallScore,
    comprehensiveScore: null, // Removed comprehensive scoring
    industry,
    rankingInsights: [], // Removed ranking insights
    aiAnalysis,
    isAIEnhanced,
  }
}
