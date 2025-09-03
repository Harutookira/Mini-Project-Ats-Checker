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
    hasPhone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text),
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
  let score = 100

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
    score -= 15
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

// Analyze scoring and ranking factors
export function analyzeScoring(parsedCV: ParsedCV): CVAnalysisResult {
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
  const hasBulletPoints = /[•·▪▫◦‣⁃]/.test(text) || /^\s*[-*+]\s/m.test(text)
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

// Main analysis function
import { calculateComprehensiveScore, detectIndustry, generateRankingInsights } from "./scoring-system"

export function analyzeCV(text: string): {
  parsedCV: ParsedCV
  results: CVAnalysisResult[]
  overallScore: number
  comprehensiveScore: any
  industry: string
  rankingInsights: string[]
} {
  const parsedCV = parseCV(text)

  const results = [
    analyzeParsing(parsedCV),
    analyzeKeywords(parsedCV),
    analyzeScoring(parsedCV),
    analyzeFormat(parsedCV),
  ]

  const overallScore = Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length)

  // Enhanced scoring system
  const categoryScores = {
    parsing: results[0].score,
    keywords: results[1].score,
    content: results[2].score,
    format: results[3].score,
  }

  const industry = detectIndustry(text)
  const comprehensiveScore = calculateComprehensiveScore(categoryScores, text)
  const rankingInsights = generateRankingInsights(comprehensiveScore, industry)

  return {
    parsedCV,
    results,
    overallScore,
    comprehensiveScore,
    industry,
    rankingInsights,
  }
}
