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
  } catch (error) {
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
                <h1 className="text-xl font-bold text-foreground">ATS CV Checker</h1>
                <p className="text-sm text-muted-foreground">Analyze and optimize your resume</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
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
                <Progress value={analysis.overallScore} className="h-3" />
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

        {/* AI Enhancement Notice - Moved below Download Report */}
        <div className="mt-8">
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="font-semibold text-lg text-blue-900">Ingin Analisis AI Secara Menyeluruh ?</h3>
                  <p className="text-blue-800 leading-relaxed">
                    Untuk mendapatkan <strong>analisis berbasis AI dengan GPT-4o.</strong>, 
                    gunakan demo interaktif di bawah ini yang dapat menganalisis CV Anda
                  </p>
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>AI Model: GPT-4o</span>
                    <span>•</span>
                    <span>Analisis dalam Bahasa Indonesia</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI CV Analysis Demo Section */}
        <div className="mt-12">
          <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl text-primary flex items-center gap-2">
                    Demo Analisis CV dengan AI
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Skor Detail • Gemini AI
                    </Badge>
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Interactive Demo */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <label className="text-sm font-medium text-foreground">
                          Demo Analisis CV dengan AI
                        </label>
                      </div>
                      {/* <input
                        type="text"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Masukkan teks CV Anda untuk analisis mendalam dengan skor per kategori dan total skor..."
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        
                      /> */}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-2">
                          Klik tombol untuk mendapatkan <strong>analisis mendalam dengan skor individual</strong> untuk 4 kategori utama: Dampak Kuantitatif, Panjang CV, Kelengkapan CV, dan Kata Kunci Job. AI akan memberikan <strong>skor total</strong> beserta rekomendasi perbaikan.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Brain className="w-4 h-4" />
                          <span>Model: Gemini AI</span>
                          <span>•</span>
                          <span>Cost: Free</span>
                        </div>
                      </div>
                      <Button
                        onClick={handlePuterQuickstart}
                        disabled={isLoadingPuter}
                        className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg min-w-[140px]"
                        size="lg"
                      >
                        {isLoadingPuter ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Analisis dengan AI
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Puter Result Display */}
                {showPuter && puterResult && (
                  <div className="bg-white rounded-lg border border-primary/20 shadow-sm animate-in slide-in-from-top-2 duration-300">
                    {(typeof puterResult === 'string' && (
                      puterResult.includes("❌ Puter.js") || 
                      puterResult.includes("❌ AI Error") ||
                      puterResult.includes("❌ Network") ||
                      puterResult.includes("Connection Error") ||
                      puterResult.includes("Authentication") ||
                      puterResult.startsWith("❌")
                    ) && !puterResult.includes("📊")) ? (
                      // Error state
                      <>
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <h3 className="font-semibold text-foreground">AI Connection Error</h3>
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              ❌ Failed
                            </Badge>
                          </div>
                          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-red-800 font-mono text-sm">{puterResult}</p>
                            <div className="mt-3 text-xs text-red-600 space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-red-500"></div>
                                <span>Check that Puter.js script is loaded in HTML</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-red-500"></div>
                                <span>Verify network connectivity</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-red-500"></div>
                                <span>User authentication may be required</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Success state with enhanced readability
                      <>
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-6">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <h3 className="font-semibold text-foreground text-lg">Hasil Analisis CV dengan AI</h3>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              ✅ GPT-4o
                            </Badge>
                          </div>
                          
                          {(() => {
                            // Enhanced parsing and formatting for better readability
                            const formatAIResponse = (response: string) => {
                              // Clean up the response and remove any leading error prefixes
                              let cleanResponse = response.trim()
                              
                              // If response starts with error indicators but contains analysis, extract the analysis part
                              if (cleanResponse.includes('📊')) {
                                const analysisStart = cleanResponse.indexOf('📊')
                                if (analysisStart > 0) {
                                  cleanResponse = cleanResponse.substring(analysisStart)
                                }
                              }
                              
                              // Parse different sections based on common patterns
                              const sections: any = {
                                scores: [],
                                totalScore: null,
                                issues: [],
                                recommendations: [],
                                conclusion: null,
                                rawContent: cleanResponse
                              }
                              
                              // Extract scores if they follow the emoji pattern
                              const scoreMatches = cleanResponse.match(/📊\s*\*\*SKOR KATEGORI:\*\*([\s\S]*?)(?=🎯|$)/)
                              if (scoreMatches) {
                                const scoreSection = scoreMatches[1]
                                const scoreLines = scoreSection.split('\n').filter(line => line.trim().includes(':'))
                                scoreLines.forEach(line => {
                                  const match = line.match(/•\s*(.+?):\s*(\d+)\/100.*?Status:\s*\[(.+?)\]/)
                                  if (match) {
                                    sections.scores.push({
                                      category: match[1].trim(),
                                      score: parseInt(match[2]),
                                      status: match[3].trim()
                                    })
                                  }
                                })
                              } else {
                                // Try alternative format: • **Category: score/100** (Status: status)
                                const altScorePattern = /•\s*\*\*(.+?):\s*(\d+)\/100\*\*\s*\(Status:\s*([^)]+)\)/g
                                let altMatch
                                while ((altMatch = altScorePattern.exec(cleanResponse)) !== null) {
                                  sections.scores.push({
                                    category: altMatch[1].trim(),
                                    score: parseInt(altMatch[2]),
                                    status: altMatch[3].trim()
                                  })
                                }
                              }
                              
                              // Extract total score
                              const totalMatch = cleanResponse.match(/🎯\s*\*\*SKOR TOTAL:\s*(\d+)\/100\*\*.*?Grade:\s*([A-F][+\-]?)/)
                              if (totalMatch) {
                                sections.totalScore = {
                                  score: parseInt(totalMatch[1]),
                                  grade: totalMatch[2]
                                }
                              } else {
                                // Alternative format: 🎯 **SKOR TOTAL: X/100** (Grade: Y)
                                const altTotalMatch = cleanResponse.match(/🎯\s*\*\*SKOR TOTAL:\s*(\d+)\/100\*\*\s*\(Grade:\s*([A-F][+\-]?)\)/)
                                if (altTotalMatch) {
                                  sections.totalScore = {
                                    score: parseInt(altTotalMatch[1]),
                                    grade: altTotalMatch[2]
                                  }
                                }
                              }
                              
                              // Extract issues
                              const issueMatch = cleanResponse.match(/❌\s*\*\*MASALAH UTAMA:\*\*([\s\S]*?)(?=✅|$)/)
                              if (issueMatch) {
                                const issueText = issueMatch[1]
                                sections.issues = issueText.split('\n')
                                  .filter(line => line.trim() && (line.includes('-') || line.includes('•') || /^\d+\./.test(line.trim())))
                                  .map(line => line.replace(/^[\d\.\-•\s]+/, '').trim())
                                  .filter(line => line.length > 5)
                              }
                              
                              // Extract recommendations
                              const recMatch = cleanResponse.match(/✅\s*\*\*REKOMENDASI PERBAIKAN:\*\*([\s\S]*?)(?=💡|$)/)
                              if (recMatch) {
                                const recText = recMatch[1]
                                sections.recommendations = recText.split('\n')
                                  .filter(line => line.trim() && (line.includes('-') || line.includes('•') || /^\d+\./.test(line.trim())))
                                  .map(line => line.replace(/^[\d\.\-•\s]+/, '').trim())
                                  .filter(line => line.length > 5)
                              }
                              
                              // Extract conclusion
                              const conclusionMatch = cleanResponse.match(/💡\s*\*\*KESIMPULAN:\*\*([\s\S]*?)$/)
                              if (conclusionMatch) {
                                sections.conclusion = conclusionMatch[1].trim()
                              }
                              
                              return sections
                            }
                            
                            const parsedResponse = formatAIResponse(puterResult)
                            
                            return (
                              <div className="space-y-6">
                                {/* Scores Section */}
                                {parsedResponse.scores.length > 0 && (
                                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                      📊 Skor per Kategori
                                    </h4>
                                    <div className="grid md:grid-cols-2 gap-3">
                                      {parsedResponse.scores.map((score: any, index: number) => (
                                        <div key={index} className="bg-white p-3 rounded-lg border shadow-sm">
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-foreground text-sm">{score.category}</span>
                                            <div className="flex items-center gap-2">
                                              <Badge className={(() => {
                                                const statusClasses: Record<string, string> = {
                                                  'excellent': 'bg-green-100 text-green-800 border-green-200',
                                                  'good': 'bg-blue-100 text-blue-800 border-blue-200',
                                                  'needs-improvement': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                                                  'poor': 'bg-red-100 text-red-800 border-red-200'
                                                }
                                                return statusClasses[score.status] || 'bg-gray-100 text-gray-800'
                                              })()}>
                                                {score.status}
                                              </Badge>
                                              {score.category.includes('Kata Kunci') && jobData && (
                                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                                  vs Job Desc
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                              <div 
                                                className={`h-2 rounded-full ${
                                                  score.score >= 85 ? 'bg-green-500' :
                                                  score.score >= 70 ? 'bg-blue-500' :
                                                  score.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                                style={{width: `${score.score}%`}}
                                              ></div>
                                            </div>
                                            <span className="text-lg font-bold text-foreground">{score.score}/100</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Total Score */}
                                {parsedResponse.totalScore && (
                                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                                    <div className="flex items-center justify-center gap-4">
                                      <div className="text-center">
                                        <div className="text-3xl font-bold text-green-600 mb-1">🎯 {parsedResponse.totalScore.score}/100</div>
                                        <Badge className="bg-green-100 text-green-800 border-green-200 text-lg px-3 py-1">
                                          Grade: {parsedResponse.totalScore.grade}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Issues and Recommendations */}
                                <div className="grid md:grid-cols-2 gap-4">
                                  {/* Issues */}
                                  {parsedResponse.issues.length > 0 && (
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                      <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                                        ❌ Masalah Utama
                                      </h4>
                                      <ul className="space-y-2">
                                        {parsedResponse.issues.slice(0, 5).map((issue: string, index: number) => (
                                          <li key={index} className="flex items-start gap-2 text-red-700 text-sm">
                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                            {issue}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {/* Recommendations */}
                                  {parsedResponse.recommendations.length > 0 && (
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                        ✅ Rekomendasi Perbaikan
                                      </h4>
                                      <ul className="space-y-2">
                                        {parsedResponse.recommendations.slice(0, 5).map((rec: string, index: number) => (
                                          <li key={index} className="flex items-start gap-2 text-green-700 text-sm">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                            {rec}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Conclusion */}
                                {parsedResponse.conclusion && (
                                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                      💡 Kesimpulan
                                    </h4>
                                    <p className="text-blue-700 leading-relaxed">{parsedResponse.conclusion}</p>
                                  </div>
                                )}
                                
                                {/* Fallback: Raw Response if parsing fails */}
                                {parsedResponse.scores.length === 0 && !parsedResponse.totalScore && (
                                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                      <h4 className="font-medium text-foreground text-sm">Hasil Analisis AI:</h4>
                                    </div>
                                    <div className="bg-white p-3 rounded border border-gray-200">
                                      <div className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">
                                        {puterResult}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })()}
                          
                          {/* Technical Details */}
                          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
                              <Brain className="w-4 h-4 text-blue-600" />
                              <div>
                                <div className="font-medium text-foreground">AI Model</div>
                                <div className="text-muted-foreground text-xs">Gemini AI</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
                              <Target className="w-4 h-4 text-green-600" />
                              <div>
                                <div className="font-medium text-foreground">Analysis Type</div>
                                <div className="text-muted-foreground text-xs">4 Kategori HRD</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Success Status */}
                          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 text-sm text-green-800">
                              <CheckCircle className="w-4 h-4" />
                              <span>
                                <strong>Status Integrasi:</strong> AI berhasil memberikan analisis CV dengan format yang mudah dibaca!
                              </span>
                            </div>
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
      </main>
    </div>
  )
}
