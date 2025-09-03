"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Eye,
  Search,
  Target,
  Brain,
  Lightbulb,
  Award,
  BarChart3,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface CVData {
  name: string
  size: number
  type: string
  uploadTime: string
}

interface AnalysisResult {
  category: string
  score: number
  status: "excellent" | "good" | "needs-improvement" | "poor"
  issues: string[]
  recommendations: string[]
}

interface AIInsights {
  overallAssessment: string
  strengths: string[]
  weaknesses: string[]
  industrySpecificAdvice: string[]
  atsOptimizationTips: string[]
  careerLevelAssessment: string
  improvementPriority: "high" | "medium" | "low"
}

interface ComprehensiveScore {
  overallScore: number
  weightedScore: number
  industryPercentile: number
  overallGrade: string
  breakdown: Array<{
    category: string
    rawScore: number
    weightedScore: number
    weight: number
    percentile: number
    grade: string
  }>
  competitiveAnalysis: {
    vsAverageCandidate: number
    vsTopPercentile: number
    marketPosition: string
  }
  improvementPotential: number
}

interface CVAnalysis {
  overallScore: number
  results: AnalysisResult[]
  metadata: {
    wordCount: number
    hasEmail: boolean
    hasPhone: boolean
    hasLinkedIn: boolean
    sectionCount: number
  }
  aiInsights?: AIInsights
  personalizedSuggestions?: string[]
  comprehensiveScore?: ComprehensiveScore
  industry?: string
  rankingInsights?: string[]
}

export default function ResultsPage() {
  const [cvData, setCvData] = useState<CVData | null>(null)
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedData = localStorage.getItem("uploadedCV")
    const storedAnalysis = localStorage.getItem("cvAnalysis")

    if (!storedData || !storedAnalysis) {
      router.push("/")
      return
    }

    setCvData(JSON.parse(storedData))
    setAnalysis(JSON.parse(storedAnalysis))
    setIsLoading(false)
  }, [router])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "good":
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case "needs-improvement":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case "poor":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-200"
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "needs-improvement":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "poor":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "CV Parsing":
        return <Eye className="w-5 h-5" />
      case "Keyword Matching":
        return <Search className="w-5 h-5" />
      case "Scoring & Ranking":
        return <TrendingUp className="w-5 h-5" />
      case "Format & Readability":
        return <Target className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "bg-green-100 text-green-800 border-green-200"
    if (grade.startsWith("B")) return "bg-blue-100 text-blue-800 border-blue-200"
    if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    if (grade === "D") return "bg-orange-100 text-orange-800 border-orange-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Loading Analysis Results</h3>
            <p className="text-muted-foreground">Please wait while we load your CV analysis...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">No Analysis Found</h3>
            <p className="text-muted-foreground mb-4">Please upload and analyze a CV first.</p>
            <Button onClick={() => router.push("/")} className="bg-primary hover:bg-primary/90">
              Upload CV
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Upload
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">ATS Analysis Results</h1>
                <p className="text-sm text-muted-foreground">{cvData?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Overall Score */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Overall ATS Compatibility Score</CardTitle>
            <CardDescription>
              Based on AI analysis of parsing, keywords, scoring, and formatting
              {analysis.industry && ` • Industry: ${analysis.industry}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{analysis.overallScore}%</div>
                <Badge
                  className={getStatusColor(
                    analysis.overallScore >= 85
                      ? "excellent"
                      : analysis.overallScore >= 70
                        ? "good"
                        : analysis.overallScore >= 50
                          ? "needs-improvement"
                          : "poor",
                  )}
                >
                  {analysis.overallScore >= 85
                    ? "Excellent"
                    : analysis.overallScore >= 70
                      ? "Good"
                      : analysis.overallScore >= 50
                        ? "Needs Improvement"
                        : "Poor"}
                </Badge>
              </div>
              <div className="flex-1">
                <Progress value={analysis.overallScore} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  Your CV scores {analysis.overallScore}% for ATS compatibility
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-lg font-semibold text-foreground">{analysis.metadata.wordCount}</div>
                <div className="text-sm text-muted-foreground">Words</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-lg font-semibold text-foreground">{analysis.metadata.sectionCount}</div>
                <div className="text-sm text-muted-foreground">Sections</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div
                  className={`text-lg font-semibold ${analysis.metadata.hasEmail ? "text-green-600" : "text-red-600"}`}
                >
                  {analysis.metadata.hasEmail ? "✓" : "✗"}
                </div>
                <div className="text-sm text-muted-foreground">Email</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div
                  className={`text-lg font-semibold ${analysis.metadata.hasPhone ? "text-green-600" : "text-red-600"}`}
                >
                  {analysis.metadata.hasPhone ? "✓" : "✗"}
                </div>
                <div className="text-sm text-muted-foreground">Phone</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comprehensive Scoring & Ranking */}
        {analysis.comprehensiveScore && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl text-primary">Industry Ranking & Competitive Analysis</CardTitle>
                  <CardDescription>
                    Weighted score: {analysis.comprehensiveScore.weightedScore}% • Grade:{" "}
                    {analysis.comprehensiveScore.overallGrade} •{analysis.comprehensiveScore.industryPercentile}th
                    percentile
                  </CardDescription>
                </div>
                <Badge className={getGradeColor(analysis.comprehensiveScore.overallGrade)}>
                  {analysis.comprehensiveScore.overallGrade}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Competitive Position */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {analysis.comprehensiveScore.competitiveAnalysis.marketPosition}
                  </div>
                  <div className="text-sm text-muted-foreground">Market Position</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {analysis.comprehensiveScore.competitiveAnalysis.vsAverageCandidate > 0 ? "+" : ""}
                    {analysis.comprehensiveScore.competitiveAnalysis.vsAverageCandidate}
                  </div>
                  <div className="text-sm text-muted-foreground">vs Average Candidate</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">
                    +{analysis.comprehensiveScore.improvementPotential}
                  </div>
                  <div className="text-sm text-muted-foreground">Improvement Potential</div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Weighted Score Breakdown
                </h4>
                <div className="space-y-3">
                  {analysis.comprehensiveScore.breakdown.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-foreground">{item.category}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Progress value={item.rawScore} className="h-2 flex-1" />
                          <span className="text-sm font-medium text-foreground w-12">{item.rawScore}%</span>
                          <Badge className={getGradeColor(item.grade)} variant="outline">
                            {item.grade}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Weight: {Math.round(item.weight * 100)}% •{item.percentile}th percentile • Weighted:{" "}
                          {Math.round(item.weightedScore)}pts
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ranking Insights */}
              {analysis.rankingInsights && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Competitive Insights
                  </h4>
                  <ul className="space-y-2">
                    {analysis.rankingInsights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* AI Insights */}
        {analysis.aiInsights && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-xl text-primary">AI-Powered Insights</CardTitle>
                  <CardDescription>Advanced analysis powered by Gemini AI</CardDescription>
                </div>
                <Badge className={getPriorityColor(analysis.aiInsights.improvementPriority)}>
                  {analysis.aiInsights.improvementPriority} priority
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Overall Assessment</h4>
                <p className="text-muted-foreground">{analysis.aiInsights.overallAssessment}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Career Level: <span className="font-medium">{analysis.aiInsights.careerLevelAssessment}</span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Key Strengths
                  </h4>
                  <ul className="space-y-2">
                    {analysis.aiInsights.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-2">
                    {analysis.aiInsights.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  Industry-Specific Advice
                </h4>
                <ul className="space-y-2">
                  {analysis.aiInsights.industrySpecificAdvice.map((advice, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      {advice}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personalized Suggestions */}
        {analysis.personalizedSuggestions && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-xl text-primary">Personalized Suggestions</CardTitle>
                  <CardDescription>AI-generated recommendations tailored to your CV</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.personalizedSuggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-secondary-foreground">{index + 1}</span>
                    </div>
                    <p className="text-muted-foreground">{suggestion}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        <div className="grid gap-6">
          {analysis.results.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {getCategoryIcon(result.category)}
                    </div>
                    <div>
                      <CardTitle className="text-xl text-primary">{result.category}</CardTitle>
                      <CardDescription>Score: {result.score}%</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <Badge className={getStatusColor(result.status)}>{result.status.replace("-", " ")}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Progress value={result.score} className="h-2" />
                </div>

                {result.issues.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      Issues Found
                    </h4>
                    <ul className="space-y-2">
                      {result.issues.map((issue, issueIndex) => (
                        <li key={issueIndex} className="flex items-start gap-2 text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {result.recommendations.map((recommendation, recIndex) => (
                      <li key={recIndex} className="flex items-start gap-2 text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button onClick={() => router.push("/")} variant="outline" size="lg">
            Upload Another CV
          </Button>
          <Button
            onClick={() => window.print()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            Download Report
          </Button>
        </div>
      </main>
    </div>
  )
}
