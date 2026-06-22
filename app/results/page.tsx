"use client"

import Head from 'next/head'
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
  Calendar,
  HardDrive,
  Download,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Loader2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { safePuterQuickstart } from "@/lib/ai-analyzer"
import { Footer } from "@/components/footer"

// Add this new function to handle Gemini AI requests
async function handleGeminiQuickstart(prompt: string): Promise<string> {
  try {
    const response = await fetch('/api/generate-ai-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customPrompt: prompt }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.result || "No response from AI";
  } catch (error: unknown) {
    console.error('Error with Gemini quickstart:', error);
    return `❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
  }
}

// Text analysis interfaces and functions
interface TextAnalysis {
  totalWords: number
  uniqueWords: number
  sentences: number
  avgWordsPerSentence: number
  lexicalDiversity: number
  topWords: [string, number][]
}

// Parse words from text
function parseWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 3 && !isStopWord(word))
}

// Check if word is a stop word
function isStopWord(word: string): boolean {
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'between', 'among', 'under', 'over', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
    'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'am',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'must', 'can', 'shall', 'a', 'an', 'dan', 'atau', 'yang', 'dengan', 'untuk',
    'dari', 'dalam', 'pada', 'akan', 'dapat', 'harus', 'juga', 'ini', 'itu'
  ])
  return stopWords.has(word)
}

// Get word frequency
function getWordFrequency(words: string[]): Map<string, number> {
  const frequency = new Map<string, number>()
  words.forEach(word => {
    frequency.set(word, (frequency.get(word) || 0) + 1)
  })
  return frequency
}

// Get top words
function getTopWords(frequency: Map<string, number>, limit: number = 20): [string, number][] {
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}

// Analyze text and return statistics
function analyzeText(text: string): TextAnalysis | null {
  if (!text || text.trim().length === 0) {
    return null
  }

  const words = parseWords(text)
  const frequency = getWordFrequency(words)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  const totalWords = words.length
  const uniqueWords = frequency.size
  const sentenceCount = sentences.length
  const avgWordsPerSentence = sentenceCount > 0 ? Math.round(totalWords / sentenceCount) : 0
  const lexicalDiversity = totalWords > 0 ? Math.round((uniqueWords / totalWords) * 100) : 0
  const topWords = getTopWords(frequency, 20)

  return {
    totalWords,
    uniqueWords,
    sentences: sentenceCount,
    avgWordsPerSentence,
    lexicalDiversity,
    topWords
  }
}

interface CVData {
  name: string
  size: number
  type: string
  uploadTime: string
}

interface JobData {
  jobName: string
  jobDescription: string
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
  extractedText?: string
  parsedSections?: {
    contact?: string
    summary?: string
    experience?: string
    education?: string
    skills?: string
  }
}

export default function ResultsPage() {
  const handlePrint = () => {
    window.print()
  }

  const [cvData, setCvData] = useState<CVData | null>(null)
  const [jobData, setJobData] = useState<JobData | null>(null)
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [puterResult, setPuterResult] = useState<string>('')
  const [isLoadingPuter, setIsLoadingPuter] = useState(false)
  const [showPuter, setShowPuter] = useState(false)
  const [customPrompt, setCustomPrompt] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    const storedData = localStorage.getItem("uploadedCV")
    const storedAnalysis = localStorage.getItem("cvAnalysis")
    const storedJobInfo = localStorage.getItem("jobInfo")

    if (!storedData || !storedAnalysis) {
      router.push("/")
      return
    }

    setCvData(JSON.parse(storedData))
    setAnalysis(JSON.parse(storedAnalysis))
    if (storedJobInfo) {
      setJobData(JSON.parse(storedJobInfo))
    }
    setIsLoading(false)
  }, [router])

  const handlePuterQuickstart = async () => {
    setIsLoadingPuter(true);
    try {
      // Build the prompt in parts to avoid template literal nesting issues
      let prompt = customPrompt;
      
      if (!customPrompt) {
        // Base prompt
        prompt = `Kamu adalah seorang HRD yang melakukan pengecekan terhadap CV ATS. Analisis CV berikut:\n\n${analysis?.extractedText || 'CV text not available'}\n\n`;
        
        // Add job information if available
        if (jobData) {
          prompt += `DENGAN MEMBANDINGKAN TERHADAP POSISI TARGET:\n- Nama Pekerjaan: ${jobData.jobName}\n- Deskripsi Pekerjaan: ${jobData.jobDescription}\n\nPASTIKAN analisis KATA KUNCI SESUAI JOB menggunakan perbandingan DETAIL dengan job description di atas.\n\n`;
        }
        
        // Add main analysis instructions - optimized for ultra-fast AI response
        prompt += `Analisis SUPER CEPAT 4 kategori:
1. Dampak Kuantitatif (25%): Ada angka/metrik?
2. Panjang CV (20%): 200-600 kata?
3. Kelengkapan CV (30%): Kontak+struktur?
4. Kata Kunci Job (25%):`;
        
        // Add job-specific keyword analysis if job data is available
        if (jobData) {
          prompt += `   - BANDINGKAN dengan "${jobData.jobDescription}"\n   - Hitung % kata kunci cocok\n   - Analisis technical skills sesuai "${jobData.jobName}"\n\n`;
        } else {
          prompt += `   - Keywords relevan industri? Technical skills sesuai bidang? Action verbs tepat?\n\n`;
        }
        
        // Add output format instructions - minimal format for ultra-fast processing
        prompt += `Format SINGKAT:

📊 [X]/100 [X]/100 [X]/100 [X]/100
🎯 TOTAL: [X]/100 Grade:[X]
❌ [1 masalah]
✅ [1 saran]`;
      }
      console.log("[UI] Testing Gemini with prompt:", prompt);
      
      // Use the API route for Gemini AI instead of calling it directly
      console.log("[UI] Calling Gemini AI API route...");
      
      const response = await fetch('/api/generate-ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvText: analysis?.extractedText || '',
          jobName: jobData?.jobName || '',
          jobDescription: jobData?.jobDescription || '',
          customPrompt: prompt
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        const errorMessage = responseData.error || "Unknown error";
        const errorDetails = responseData.details || "";
        const solution = responseData.solution || "";
        const pattern = responseData.pattern || "";
        
        let fullErrorMessage = errorMessage;
        if (pattern) {
          fullErrorMessage += ` (Pattern detected: ${pattern})`;
        }
        if (errorDetails) {
          fullErrorMessage += `: ${errorDetails}`;
        }
        if (solution) {
          fullErrorMessage += `\n\nSolution: ${solution}`;
        }
        
        throw new Error(fullErrorMessage);
      }
      
      const result = responseData.result || "No response from AI";
      
      console.log("[UI] Received result:", result);
      
      setPuterResult(result);
      setShowPuter(true);
    } catch (error) {
      console.error('Error with Gemini quickstart:', error);
      
      // Enhanced error logging
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message || 'Error occurred without message';
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error);
        console.error('Non-Error object caught:', error);
      }
      
      // Provide more specific troubleshooting based on error type
      let troubleshooting = "Troubleshooting:\n";
      if (errorMessage.includes("malicious content")) {
        troubleshooting += "• The CV text contains patterns that were flagged as potentially unsafe\n";
        troubleshooting += "• This is a security feature to prevent XSS and SQL injection attacks\n";
        troubleshooting += "• The system detected patterns like SQL comments or terminators in your CV\n";
        troubleshooting += "• This commonly happens with processed CV text that contains semicolons or comment-like patterns\n";
        troubleshooting += "• The text has already been sanitized but still contains flagged patterns\n";
        troubleshooting += "• Try analyzing a different CV or modify the current CV content\n\n";
      }
      troubleshooting += "General troubleshooting:\n";
      troubleshooting += "• Check your internet connection\n";
      troubleshooting += "• Ensure the API server is running\n";
      troubleshooting += "• Check browser console for errors\n";
      troubleshooting += "• Verify that the GOOGLE_API_KEY environment variable is set in your Vercel deployment settings";
      
      setPuterResult(`❌ ${errorMessage}\n\n${troubleshooting}`);
      setShowPuter(true);
    } finally {
      setIsLoadingPuter(false);
    }
  };

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
      case "Dampak Kuantitatif":
        return <TrendingUp className="w-5 h-5" />
      case "Panjang CV":
        return <FileText className="w-5 h-5" />
      case "Ringkasan Bullet Point":
        return <Target className="w-5 h-5" />
      case "Kelengkapan CV":
        return <CheckCircle className="w-5 h-5" />
      case "Kata Kunci Sesuai Job":
        return <Search className="w-5 h-5" />
      case "CV Parsing":
        return <Eye className="w-5 h-5" />
      case "Keyword Matching":
        return <Search className="w-5 h-5" />
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileTypeIcon = (type: string) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('word') || type.includes('doc')) return '📝'
    if (type.includes('text')) return '📃'
    return '📄'
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
    <div className="min-h-screen bg-background flex flex-col">
      <Head>
        <title>ATS CV Analysis Results - Optimize Your Resume</title>
        <meta name="description" content="View your detailed ATS compatibility analysis results. Get AI-powered recommendations to improve your resume's chances of passing automated screening systems." />
        <meta name="keywords" content="ATS analysis, resume results, CV optimization, job application, career tool, hiring process" />
        <link rel="canonical" href="https://ats-checker.cnt-recruitment.com/results" />
      </Head>
      
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
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
            {/* Standard CNT logo positioned on the right */}
            <div className="w-25 h-25 flex items-center justify-center">
              <img src="/cnt-logo.png" alt="CNT Logo" className="w-25 h-25 object-contain" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        {/* Document Preview */}
        {cvData && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{getFileTypeIcon(cvData.type)}</span>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl text-primary">Uploaded Document</CardTitle>
                  <CardDescription>Document details and information</CardDescription>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Successfully Analyzed
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground truncate max-w-[200px]" title={cvData.name}>
                      {cvData.name}
                    </p>
                    <p className="text-sm text-muted-foreground">File Name</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <HardDrive className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{formatFileSize(cvData.size)}</p>
                    <p className="text-sm text-muted-foreground">File Size</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Eye className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {cvData.type.split('/')[1]?.toUpperCase() || 'DOC'}
                    </p>
                    <p className="text-sm text-muted-foreground">File Type</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {formatDate(cvData.uploadTime)}
                    </p>
                    <p className="text-sm text-muted-foreground">Upload Time</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  📊 AI Analysis Complete
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✅ ATS Compatible Format
                </Badge>
                {analysis?.industry && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    🏢 {analysis.industry.charAt(0).toUpperCase() + analysis.industry.slice(1)} Industry
                  </Badge>
                )}
                {analysis?.aiInsights?.careerLevelAssessment && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    🎯 {analysis.aiInsights.careerLevelAssessment}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Information */}
        {jobData && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl text-primary">Target Job Information</CardTitle>
                  <CardDescription>Position and requirements for ATS analysis</CardDescription>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Job Matched
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                    <Target className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Job Position</p>
                      <p className="text-sm text-muted-foreground">{jobData.jobName}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <p className="font-medium text-foreground">Job Description</p>
                    </div>
                    <div className="max-h-32 overflow-y-auto">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {jobData.jobDescription.length > 300 
                          ? `${jobData.jobDescription.substring(0, 300)}...` 
                          : jobData.jobDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  🎯 Position: {jobData.jobName}
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  📝 Description Provided
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  🔍 Keyword Analysis Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Document Preview - Simplified */}
        {analysis?.extractedText && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-primary">Document Preview</CardTitle>
                    <CardDescription>Content extracted from your uploaded document</CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2"
                >
                  {showPreview ? (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Hide Preview
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      Show Preview
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            {showPreview && (
              <CardContent>
                <div className="space-y-4">
                  {/* Full Document Content Only */}
                  <div className="bg-muted p-6 rounded-lg border-2 border-dashed border-muted-foreground/20">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Full Document Content:
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {analysis.metadata.wordCount} words
                      </Badge>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
                        {analysis.extractedText}
                      </pre>
                    </div>
                  </div>

                  {/* Preview Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-background rounded-lg border">
                      <div className="text-lg font-semibold text-foreground">
                        {analysis.metadata.wordCount}
                      </div>
                      <div className="text-sm text-muted-foreground">Words</div>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg border">
                      <div className="text-lg font-semibold text-foreground">
                        {analysis.extractedText.split('\n').filter(line => line.trim().length > 0).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Lines</div>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg border">
                      <div className="text-lg font-semibold text-foreground">
                        {analysis.extractedText.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Characters</div>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg border">
                      <div className="text-lg font-semibold text-foreground">
                        {Object.keys(analysis.parsedSections || {}).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Sections</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Text Analysis */}
        {analysis?.extractedText && (
          <Card className="mb-8">
            <CardContent>
              {(() => {
                const textAnalysis = analyzeText(analysis.extractedText || '')
                if (!textAnalysis) return null
                
                return (
                  <div className="space-y-6">
                    {/* Overall Statistics */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        📊 Text Statistics
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg border">
                          <div className="text-2xl font-bold text-blue-600">{textAnalysis.totalWords}</div>
                          <div className="text-sm text-muted-foreground">Total Words</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg border">
                          <div className="text-2xl font-bold text-green-600">{textAnalysis.uniqueWords}</div>
                          <div className="text-sm text-muted-foreground">Unique Words</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg border">
                          <div className="text-2xl font-bold text-purple-600">{textAnalysis.sentences}</div>
                          <div className="text-sm text-muted-foreground">Sentences</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg border">
                          <div className="text-2xl font-bold text-orange-600">{textAnalysis.avgWordsPerSentence}</div>
                          <div className="text-sm text-muted-foreground">Avg Words/Sentence</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg border">
                          <div className="text-2xl font-bold text-red-600">{textAnalysis.lexicalDiversity}%</div>
                          <div className="text-sm text-muted-foreground">Lexical Diversity</div>
                        </div>
                        <div className="text-center p-4 bg-indigo-50 rounded-lg border">
                          <div className="text-2xl font-bold text-indigo-600">{analysis.extractedText.length}</div>
                          <div className="text-sm text-muted-foreground">Characters</div>
                        </div>
                      </div>
                    </div>

                    {/* Top Keywords */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        🏆 Most Frequent Keywords
                      </h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <div className="space-y-2">
                            {textAnalysis.topWords.slice(0, 10).map(([word, count], index) => (
                              <div key={word} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
                                    {index + 1}
                                  </div>
                                  <span className="font-medium text-foreground">{word}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-primary h-2 rounded-full" 
                                      style={{width: `${(count / textAnalysis.topWords[0][1]) * 100}%`}}
                                    ></div>
                                  </div>
                                  <Badge variant="secondary">{count}</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="space-y-2">
                            {textAnalysis.topWords.slice(10, 20).map(([word, count], index) => (
                              <div key={word} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-xs font-bold text-secondary-foreground">
                                    {index + 11}
                                  </div>
                                  <span className="font-medium text-foreground">{word}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-secondary h-2 rounded-full" 
                                      style={{width: `${(count / textAnalysis.topWords[0][1]) * 100}%`}}
                                    ></div>
                                  </div>
                                  <Badge variant="outline">{count}</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        )}

        {/* Overall Score */}
        <Card className="mb-8">

          <CardHeader>
            <CardTitle className="text-2xl text-primary">Penilaian CV ATS Checker</CardTitle>
            <CardDescription>
              Berdasarkan 4 kriteria: Dampak Kuantitatif, Panjang CV, Kelengkapan CV, dan Kata Kunci Job
              {jobData && ` • Target: ${jobData.jobName}`}
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
                <div className="h-3">
                  <Progress value={analysis.overallScore} />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  CV Anda mendapat skor {analysis.overallScore}% berdasarkan kriteria penilaian ATS
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
                  <div className="h-2">
                    <Progress value={result.score} />
                  </div>
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
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {result.recommendations.map((recommendation, recIndex) => (
                        <li key={recIndex} className="flex items-start gap-2 text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Action Buttons After Kata Kunci Sesuai Job */}
          <div className="flex gap-4 justify-center py-4">
            <Button
              onClick={() => router.push("/")}
              variant="secondary"
              className="bg-[#FCB53B] hover:bg-[#EF7722] text-white border-[#FE7743] hover:border-[#e06235] shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Upload Another CV
            </Button>
            <Button
              onClick={handlePrint}
              variant="secondary"
              className="bg-[#E14434] hover:bg-[#c03525] text-white border-[#E14434] hover:border-[#c03525] shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Print Results
            </Button>
          </div>

          {/* AI Analysis Section */}
          <div className="max-w-3xl mx-auto w-full">
          <Card>
            <CardHeader className="py-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base text-primary">AI-Powered Analysis</CardTitle>
                  <CardDescription className="text-[10px]">Advanced insights from our AI assistant</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-3">
              <div className="space-y-2">
                {/* AI Analysis Button */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Brain className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs text-foreground">AI CV Analysis</h3>
                      <p className="text-[10px] text-muted-foreground">Get detailed insights with Gemini AI</p>
                    </div>
                  </div>
                  <Button
                    onClick={handlePuterQuickstart}
                    disabled={isLoadingPuter}
                    className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 h-8 px-3 text-sm"
                  >
                    {isLoadingPuter ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analyze</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* AI Analysis Content */}
                {(showPuter || puterResult) && (
                  <div className="space-y-2 p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    {/* Loading State */}
                    {isLoadingPuter && (
                      <div className="flex flex-col items-center justify-center py-3">
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin mb-1" />
                        <h3 className="text-sm font-semibold text-foreground mb-1">Analyzing with AI</h3>
                        <p className="text-xs text-muted-foreground">Gemini AI is reviewing your CV...</p>
                      </div>
                    )}

                    {/* Error State */}
                    {!isLoadingPuter && puterResult.startsWith('❌') && (
                      <div className="p-2 bg-red-50 rounded-lg border border-red-200">
                        <h3 className="font-semibold text-red-800 mb-1 flex items-center gap-1 text-xs">
                          <AlertTriangle className="w-4 h-4" />
                          AI Analysis Error
                        </h3>
                        <pre className="whitespace-pre-wrap text-[9px] text-red-700 bg-red-100 p-1 rounded">
                          {puterResult}
                        </pre>
                      </div>
                    )}

                    {/* Success State */}
                    {!isLoadingPuter && !puterResult.startsWith('❌') && puterResult && (
                      <>
                        {(() => {
                          // Try to parse the AI response for better formatting
                          try {
                            // Simple parsing for the structured response format
                            const lines = puterResult.split('\n').filter(line => line.trim() !== '');
                            const scoresLine = lines.find(line => line.startsWith('📊'));
                            const totalLine = lines.find(line => line.startsWith('🎯 TOTAL:'));
                            const issuesLine = lines.find(line => line.startsWith('❌'));
                            const suggestionsLine = lines.find(line => line.startsWith('✅'));
                            const conclusionLine = lines.find(line => line.includes('Kesimpulan') || line.includes('kesimpulan'));

                            // Extract scores if available
                            const scores = scoresLine ? scoresLine.substring(2).split(' ').filter(s => s.includes('/')) : [];
                            const totalScore = totalLine ? totalLine.match(/(\d+)\/100/)?.[1] : null;
                            const grade = totalLine ? totalLine.match(/Grade:([A-Z+-]*)/)?.[1] : null;

                            // Extract issues and suggestions
                            const issues = issuesLine ? [issuesLine.substring(2)] : [];
                            const suggestions = suggestionsLine ? [suggestionsLine.substring(2)] : [];

                            // Extract conclusion
                            const conclusion = conclusionLine ? conclusionLine : null;

                            return (
                              <div className="space-y-2">
                                {/* Scores Overview */}
                                {scores.length > 0 && (
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-1 max-w-2xl mx-auto">
                                    {scores.map((score, index) => {
                                      const [current, max] = score.split('/');
                                      const percentage = Math.round((parseInt(current) / parseInt(max)) * 100);
                                      const labels = ['Dampak Kuantitatif', 'Panjang CV', 'Kelengkapan CV', 'Kata Kunci'];
                                      return (
                                        <div key={index} className="bg-white p-1 rounded-lg border border-blue-100 text-center">
                                          <div className="text-base font-bold text-blue-600 mb-0.5">{current}</div>
                                          <div className="text-[10px] text-muted-foreground mb-0.5">{labels[index] || `Kriteria ${index + 1}`}</div>
                                          <div className="w-full bg-gray-200 rounded-full h-1">
                                            <div 
                                              className="bg-blue-600 h-1.5 rounded-full" 
                                              style={{ width: `${percentage}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                                
                                {/* Total Score */}
                                {totalScore && (
                                  <div className="bg-white p-3 rounded-lg border border-blue-200 text-center max-w-md mx-auto">
                                    <h3 className="text-sm font-semibold text-foreground mb-1">Overall ATS Compatibility Score</h3>
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="text-3xl font-bold text-blue-600">{totalScore}</div>
                                      <div className="text-left">
                                        <div className="text-base font-bold text-foreground">/100</div>
                                        {grade && (
                                          <Badge className="mt-0.5 bg-blue-100 text-blue-800 text-[10px]">
                                            Grade: {grade}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-muted-foreground mt-2 text-xs">
                                      {parseInt(totalScore) >= 85 
                                        ? "Excellent! Your CV is highly compatible with ATS systems." 
                                        : parseInt(totalScore) >= 70 
                                          ? "Good! Your CV has strong ATS compatibility with minor improvements needed." 
                                          : parseInt(totalScore) >= 50 
                                            ? "Fair. Your CV needs significant improvements for better ATS compatibility." 
                                            : "Poor. Your CV requires major revisions to pass ATS screening."}
                                    </p>
                                  </div>
                                )}
                                
                                {/* Issues */}
                                {issues.length > 0 && (
                                  <div className="bg-orange-50 p-2 rounded-lg border border-orange-200">
                                    <h4 className="font-semibold text-orange-800 mb-1 flex items-center gap-1 text-sm">
                                      <AlertTriangle className="w-3 h-3" />
                                      Issues to Address
                                    </h4>
                                    <ul className="space-y-0.5">
                                      {issues.map((issue, index) => (
                                        <li key={index} className="flex items-start gap-1 text-orange-700 text-xs">
                                          <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                          <span>{issue}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Suggestions */}
                                {suggestions.length > 0 && (
                                  <div className="bg-green-50 p-2 rounded-lg border border-green-200">
                                    <h4 className="font-semibold text-green-800 mb-1 flex items-center gap-1 text-sm">
                                      <CheckCircle className="w-3 h-3" />
                                      Improvement Suggestions
                                    </h4>
                                    <ul className="space-y-0.5">
                                      {suggestions.map((suggestion, index) => (
                                        <li key={index} className="flex items-start gap-1 text-green-700 text-xs">
                                          <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                          <span>{suggestion}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Conclusion */}
                                {conclusion && (
                                  <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold text-blue-800 mb-1 flex items-center gap-1 text-sm">
                                      💡 Kesimpulan
                                    </h4>
                                    <p className="text-blue-700 leading-relaxed text-xs">{conclusion}</p>
                                  </div>
                                )}
                                
                                {/* Fallback: Raw Response if parsing fails */}
                                {scores.length === 0 && !totalScore && (
                                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-1 mb-0.5">
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                      <h4 className="font-medium text-foreground text-xs">Hasil Analisis AI:</h4>
                                    </div>
                                    <div className="bg-white p-1 rounded border border-gray-200">
                                      <div className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">
                                        {puterResult}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          } catch (parseError) {
                            // Fallback to raw display if parsing fails
                            return (
                              <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-1 mb-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                  <h4 className="font-medium text-foreground text-xs">Hasil Analisis AI:</h4>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <div className="text-foreground leading-relaxed whitespace-pre-wrap text-xs">
                                    {puterResult}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        })()}
                        
                        {/* Technical Details */}
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-1 text-[10px]">
                          <div className="flex items-center gap-1 p-1 bg-gray-50 rounded border">
                            <Brain className="w-2 h-2 text-blue-600" />
                            <div>
                              <div className="font-medium text-foreground text-xs">AI Model</div>
                              <div className="text-muted-foreground text-xs">Gemini AI</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 p-1 bg-gray-50 rounded border">
                            <Target className="w-2 h-2 text-green-600" />
                            <div>
                              <div className="font-medium text-foreground text-xs">Analysis Type</div>
                              <div className="text-muted-foreground text-xs">4 Kategori HRD</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Success Status */}
                        <div className="mt-2 p-1 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-1 text-[10px] text-green-800">
                            <CheckCircle className="w-2 h-2" />
                            <span>
                              <strong>Status:</strong> AI analysis complete!
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
