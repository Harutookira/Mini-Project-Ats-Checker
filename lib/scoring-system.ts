export interface ScoringWeights {
  parsing: number
  keywords: number
  content: number
  format: number
}

export interface IndustryBenchmark {
  name: string
  averageScore: number
  topPercentileScore: number
  keyFocusAreas: string[]
  weights: ScoringWeights
}

export interface ScoreBreakdown {
  category: string
  rawScore: number
  weightedScore: number
  weight: number
  percentile: number
  grade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F"
}

export interface ComprehensiveScore {
  overallScore: number
  weightedScore: number
  industryPercentile: number
  overallGrade: string
  breakdown: ScoreBreakdown[]
  competitiveAnalysis: {
    vsAverageCandidate: number
    vsTopPercentile: number
    marketPosition: "Top 10%" | "Top 25%" | "Above Average" | "Average" | "Below Average"
  }
  improvementPotential: number
}

// Industry-specific benchmarks and weights
export const INDUSTRY_BENCHMARKS: Record<string, IndustryBenchmark> = {
  technology: {
    name: "Technology & Software",
    averageScore: 72,
    topPercentileScore: 88,
    keyFocusAreas: ["Technical Skills", "Project Experience", "Quantifiable Results"],
    weights: { parsing: 0.2, keywords: 0.35, content: 0.3, format: 0.15 },
  },
  finance: {
    name: "Finance & Banking",
    averageScore: 75,
    topPercentileScore: 90,
    keyFocusAreas: ["Analytical Skills", "Compliance", "Risk Management"],
    weights: { parsing: 0.25, keywords: 0.25, content: 0.35, format: 0.15 },
  },
  healthcare: {
    name: "Healthcare & Medical",
    averageScore: 78,
    topPercentileScore: 92,
    keyFocusAreas: ["Certifications", "Patient Care", "Regulatory Compliance"],
    weights: { parsing: 0.3, keywords: 0.2, content: 0.35, format: 0.15 },
  },
  marketing: {
    name: "Marketing & Communications",
    averageScore: 70,
    topPercentileScore: 85,
    keyFocusAreas: ["Campaign Results", "Creative Skills", "Digital Marketing"],
    weights: { parsing: 0.2, keywords: 0.3, content: 0.35, format: 0.15 },
  },
  general: {
    name: "General Professional",
    averageScore: 73,
    topPercentileScore: 87,
    keyFocusAreas: ["Professional Experience", "Skills", "Achievements"],
    weights: { parsing: 0.25, keywords: 0.25, content: 0.3, format: 0.2 },
  },
}

// Detect industry from CV content
export function detectIndustry(cvText: string): string {
  const text = cvText.toLowerCase()

  const industryKeywords = {
    technology: [
      "software",
      "developer",
      "programming",
      "javascript",
      "python",
      "react",
      "node.js",
      "database",
      "api",
      "cloud",
      "aws",
      "docker",
      "git",
      "agile",
      "scrum",
    ],
    finance: [
      "financial",
      "banking",
      "investment",
      "accounting",
      "audit",
      "risk",
      "compliance",
      "portfolio",
      "trading",
      "analyst",
      "cpa",
      "cfa",
      "excel",
      "bloomberg",
    ],
    healthcare: [
      "medical",
      "healthcare",
      "patient",
      "clinical",
      "nursing",
      "doctor",
      "physician",
      "hospital",
      "treatment",
      "diagnosis",
      "pharmaceutical",
      "medical device",
    ],
    marketing: [
      "marketing",
      "advertising",
      "campaign",
      "brand",
      "social media",
      "content",
      "seo",
      "digital marketing",
      "analytics",
      "conversion",
      "engagement",
    ],
  }

  let maxMatches = 0
  let detectedIndustry = "general"

  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    const matches = keywords.filter((keyword) => text.includes(keyword)).length
    if (matches > maxMatches) {
      maxMatches = matches
      detectedIndustry = industry
    }
  }

  return detectedIndustry
}

// Calculate grade based on score
export function calculateGrade(score: number): "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F" {
  if (score >= 95) return "A+"
  if (score >= 90) return "A"
  if (score >= 85) return "B+"
  if (score >= 80) return "B"
  if (score >= 75) return "C+"
  if (score >= 70) return "C"
  if (score >= 60) return "D"
  return "F"
}

// Calculate percentile based on industry benchmark
export function calculatePercentile(score: number, benchmark: IndustryBenchmark): number {
  if (score >= benchmark.topPercentileScore)
    return 90 + ((score - benchmark.topPercentileScore) / (100 - benchmark.topPercentileScore)) * 10
  if (score >= benchmark.averageScore)
    return 50 + ((score - benchmark.averageScore) / (benchmark.topPercentileScore - benchmark.averageScore)) * 40
  return (score / benchmark.averageScore) * 50
}

// Calculate market position
export function calculateMarketPosition(
  percentile: number,
): "Top 10%" | "Top 25%" | "Above Average" | "Average" | "Below Average" {
  if (percentile >= 90) return "Top 10%"
  if (percentile >= 75) return "Top 25%"
  if (percentile >= 60) return "Above Average"
  if (percentile >= 40) return "Average"
  return "Below Average"
}

// Enhanced scoring system
export function calculateComprehensiveScore(
  categoryScores: { parsing: number; keywords: number; content: number; format: number },
  cvText: string,
): ComprehensiveScore {
  // Detect industry and get benchmark
  const industry = detectIndustry(cvText)
  const benchmark = INDUSTRY_BENCHMARKS[industry]

  // Calculate weighted scores
  const breakdown: ScoreBreakdown[] = [
    {
      category: "CV Parsing",
      rawScore: categoryScores.parsing,
      weight: benchmark.weights.parsing,
      weightedScore: categoryScores.parsing * benchmark.weights.parsing,
      percentile: calculatePercentile(categoryScores.parsing, benchmark),
      grade: calculateGrade(categoryScores.parsing),
    },
    {
      category: "Keyword Matching",
      rawScore: categoryScores.keywords,
      weight: benchmark.weights.keywords,
      weightedScore: categoryScores.keywords * benchmark.weights.keywords,
      percentile: calculatePercentile(categoryScores.keywords, benchmark),
      grade: calculateGrade(categoryScores.keywords),
    },
    {
      category: "Content Quality",
      rawScore: categoryScores.content,
      weight: benchmark.weights.content,
      weightedScore: categoryScores.content * benchmark.weights.content,
      percentile: calculatePercentile(categoryScores.content, benchmark),
      grade: calculateGrade(categoryScores.content),
    },
    {
      category: "Format & Readability",
      rawScore: categoryScores.format,
      weight: benchmark.weights.format,
      weightedScore: categoryScores.format * benchmark.weights.format,
      percentile: calculatePercentile(categoryScores.format, benchmark),
      grade: calculateGrade(categoryScores.format),
    },
  ]

  // Calculate overall scores
  const overallScore = Math.round(
    (categoryScores.parsing + categoryScores.keywords + categoryScores.content + categoryScores.format) / 4,
  )

  const weightedScore = Math.round(breakdown.reduce((sum, item) => sum + item.weightedScore, 0))

  const industryPercentile = calculatePercentile(weightedScore, benchmark)
  const overallGrade = calculateGrade(weightedScore)

  // Competitive analysis
  const vsAverageCandidate = weightedScore - benchmark.averageScore
  const vsTopPercentile = weightedScore - benchmark.topPercentileScore
  const marketPosition = calculateMarketPosition(industryPercentile)

  // Calculate improvement potential
  const maxPossibleImprovement = 100 - weightedScore
  const improvementPotential = Math.min(maxPossibleImprovement, 25) // Cap at 25 points for realism

  return {
    overallScore,
    weightedScore,
    industryPercentile: Math.round(industryPercentile),
    overallGrade,
    breakdown,
    competitiveAnalysis: {
      vsAverageCandidate: Math.round(vsAverageCandidate),
      vsTopPercentile: Math.round(vsTopPercentile),
      marketPosition,
    },
    improvementPotential: Math.round(improvementPotential),
  }
}

// Generate ranking insights with AI enhancement
export function generateRankingInsights(score: ComprehensiveScore, industry: string): string[] {
  const insights: string[] = []
  const benchmark = INDUSTRY_BENCHMARKS[industry]

  if (score.competitiveAnalysis.marketPosition === "Top 10%") {
    insights.push(`Excellent! Your CV ranks in the top 10% for ${benchmark.name} professionals.`)
  } else if (score.competitiveAnalysis.marketPosition === "Top 25%") {
    insights.push(`Great performance! Your CV is in the top 25% for your industry.`)
  } else if (score.competitiveAnalysis.marketPosition === "Above Average") {
    insights.push(`Your CV performs above average compared to industry peers.`)
  } else {
    insights.push(`There's significant room for improvement to reach industry standards.`)
  }

  if (score.competitiveAnalysis.vsAverageCandidate > 0) {
    insights.push(`You score ${score.competitiveAnalysis.vsAverageCandidate} points above the average candidate.`)
  } else {
    insights.push(
      `You're ${Math.abs(score.competitiveAnalysis.vsAverageCandidate)} points below the average candidate.`,
    )
  }

  // Focus area recommendations
  const lowestCategory = score.breakdown.reduce((min, current) => (current.rawScore < min.rawScore ? current : min))

  insights.push(`Focus on improving "${lowestCategory.category}" for maximum impact.`)

  if (score.improvementPotential > 15) {
    insights.push(`High improvement potential: up to ${score.improvementPotential} additional points possible.`)
  }

  return insights
}

// AI-enhanced scoring with dynamic weights
export function calculateAIEnhancedScore(
  categoryScores: { parsing: number; keywords: number; content: number; format: number },
  cvText: string,
  aiInsights?: {
    industryDetected: string
    careerLevel: string
    skillsGap: string[]
    improvementPriority: string
  }
): ComprehensiveScore {
  // Use AI-detected industry or fall back to detection
  const industry = aiInsights?.industryDetected || detectIndustry(cvText)
  const benchmark = INDUSTRY_BENCHMARKS[industry]

  // Adjust weights based on AI insights
  let adjustedWeights = { ...benchmark.weights }
  
  if (aiInsights?.careerLevel === "entry-level") {
    // For entry-level, emphasize education and format
    adjustedWeights.content += 0.05
    adjustedWeights.format += 0.05
    adjustedWeights.keywords -= 0.1
  } else if (aiInsights?.careerLevel === "senior-level") {
    // For senior-level, emphasize content and keywords
    adjustedWeights.content += 0.1
    adjustedWeights.keywords += 0.05
    adjustedWeights.format -= 0.15
  }

  // Calculate weighted scores with adjusted weights
  const breakdown: ScoreBreakdown[] = [
    {
      category: "CV Parsing",
      rawScore: categoryScores.parsing,
      weight: adjustedWeights.parsing,
      weightedScore: categoryScores.parsing * adjustedWeights.parsing,
      percentile: calculatePercentile(categoryScores.parsing, benchmark),
      grade: calculateGrade(categoryScores.parsing),
    },
    {
      category: "Keyword Matching",
      rawScore: categoryScores.keywords,
      weight: adjustedWeights.keywords,
      weightedScore: categoryScores.keywords * adjustedWeights.keywords,
      percentile: calculatePercentile(categoryScores.keywords, benchmark),
      grade: calculateGrade(categoryScores.keywords),
    },
    {
      category: "Content Quality",
      rawScore: categoryScores.content,
      weight: adjustedWeights.content,
      weightedScore: categoryScores.content * adjustedWeights.content,
      percentile: calculatePercentile(categoryScores.content, benchmark),
      grade: calculateGrade(categoryScores.content),
    },
    {
      category: "Format & Readability",
      rawScore: categoryScores.format,
      weight: adjustedWeights.format,
      weightedScore: categoryScores.format * adjustedWeights.format,
      percentile: calculatePercentile(categoryScores.format, benchmark),
      grade: calculateGrade(categoryScores.format),
    },
  ]

  // Calculate overall scores
  const overallScore = Math.round(
    (categoryScores.parsing + categoryScores.keywords + categoryScores.content + categoryScores.format) / 4,
  )

  const weightedScore = Math.round(breakdown.reduce((sum, item) => sum + item.weightedScore, 0))

  const industryPercentile = calculatePercentile(weightedScore, benchmark)
  const overallGrade = calculateGrade(weightedScore)

  // Enhanced competitive analysis with AI insights
  const vsAverageCandidate = weightedScore - benchmark.averageScore
  const vsTopPercentile = weightedScore - benchmark.topPercentileScore
  const marketPosition = calculateMarketPosition(industryPercentile)

  // AI-enhanced improvement potential
  let improvementPotential = Math.min(100 - weightedScore, 25)
  if (aiInsights?.improvementPriority === "high") {
    improvementPotential += 5 // Higher potential for high-priority improvements
  }

  return {
    overallScore,
    weightedScore,
    industryPercentile: Math.round(industryPercentile),
    overallGrade,
    breakdown,
    competitiveAnalysis: {
      vsAverageCandidate: Math.round(vsAverageCandidate),
      vsTopPercentile: Math.round(vsTopPercentile),
      marketPosition,
    },
    improvementPotential: Math.round(improvementPotential),
  }
}
