"use client"

import type React from "react"
import Head from 'next/head'

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, CheckCircle, AlertTriangle, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/footer"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PDFErrorDialog } from "@/components/pdf-error-dialog"

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [jobName, setJobName] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [errors, setErrors] = useState<{jobName?: string, jobDescription?: string}>({})
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [isPDFErrorDialogOpen, setIsPDFErrorDialogOpen] = useState(false)
  const [alertTitle, setAlertTitle] = useState('Error')
  const [alertMessage, setAlertMessage] = useState('')
  const [isPDFError, setIsPDFError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Client-side validation functions
  const validateJobName = (name: string): string | null => {
    if (name && name.length > 100) {
      return "Job name must be less than 100 characters";
    }
    
    // Check for potentially dangerous characters
    if (/[<>{}[\]()'"\\]/.test(name)) {
      return "Job name contains invalid characters";
    }
    
    return null;
  }

  const validateJobDescription = (description: string): string | null => {
    if (description && description.length > 2000) {
      return "Job description must be less than 2000 characters";
    }
    
    return null;
  }

  const handleFileSelect = (selectedFile: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]

    // Check file size (1MB = 1,048,576 bytes)
    const MAX_FILE_SIZE = 1048576;
    if (selectedFile.size > MAX_FILE_SIZE) {
      alert("File size exceeds 1MB limit. Please upload a smaller file.");
      return;
    }

    if (allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile)
    } else {
      alert("Please upload a PDF, Word document, or text file only. File size must be under 1MB.")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleJobNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setJobName(value);
    
    // Validate on change
    const error = validateJobName(value);
    setErrors(prev => ({ ...prev, jobName: error || undefined }));
  }

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJobDescription(value);
    
    // Validate on change
    const error = validateJobDescription(value);
    setErrors(prev => ({ ...prev, jobDescription: error || undefined }));
  }

  const handleATSCheck = async () => {
    // Validate inputs before submission
    const jobNameError = validateJobName(jobName);
    const jobDescriptionError = validateJobDescription(jobDescription);
    
    if (jobNameError || jobDescriptionError) {
      setErrors({
        jobName: jobNameError || undefined,
        jobDescription: jobDescriptionError || undefined
      });
      return;
    }
    
    if (!file) return

    setIsUploading(true)

    try {
      console.log("Environment check:", {
        NODE_ENV: process.env.NODE_ENV,
        location: typeof window !== 'undefined' ? window.location : 'server'
      });

      const formData = new FormData()
      formData.append("file", file)
      formData.append("jobName", jobName)
      formData.append("jobDescription", jobDescription)

      // Use absolute URL with proper port handling
      const apiUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/api/analyze-cv`
        : '/api/analyze-cv';

      console.log("Making request to:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          throw new Error(`HTTP ${response.status}: ${errorText || "Failed to analyze CV"}`);
        }
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to analyze CV`);
      }

      const result = await response.json()

      // Store analysis results for the results page
      localStorage.setItem("cvAnalysis", JSON.stringify(result.analysis))
      localStorage.setItem(
        "uploadedCV",
        JSON.stringify({
          name: file.name,
          size: file.size,
          type: file.type,
          uploadTime: new Date().toISOString(),
        }),
      )
      localStorage.setItem("jobInfo", JSON.stringify({
        jobName,
        jobDescription
      }))

      router.push("/results")
    } catch (error: unknown) {
      console.error("Analysis failed:", error);
      let errorMessage = "Failed to analyze CV. Please try again.";
      let errorTitle = "Error";
      let isPDFError = false;
      
      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = "Network error: Unable to connect to the server. Please make sure the development server is running and try again.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Provide more specific error messages based on the error content
      if (errorMessage.includes("Tidak ada data")) {
        errorTitle = "Non-Text Based PDF Detected";
        errorMessage = "Unable to extract text from the uploaded file. This could be due to:\n\n" +
          "1. The file is a scanned image PDF without selectable text\n" +
          "2. The file is password-protected\n" +
          "3. The file is corrupted or in an unsupported format\n\n" +
          "Please try:\n" +
          "- Converting your CV to a text-based PDF or DOCX format\n" +
          "- Using a different PDF file\n" +
          "- Converting your CV to plain text (.txt) format";
        isPDFError = true;
      } else if (errorMessage.includes("File too large")) {
        errorTitle = "File Too Large";
        errorMessage = "File size exceeds 1MB limit. Please compress your file or upload a smaller version.";
      } else if (errorMessage.includes("Invalid file type")) {
        errorTitle = "Invalid File Type";
        errorMessage = "Unsupported file type. Please upload a PDF, DOC, DOCX, or TXT file.";
      } else if (errorMessage.includes("PDF processing failed")) {
        errorTitle = "PDF Processing Failed";
        errorMessage = "PDF processing failed. This could be due to:\n\n" +
          "1. The PDF is a scanned image without selectable text\n" +
          "2. The PDF is password-protected\n" +
          "3. The PDF is corrupted or in an incompatible format\n\n" +
          "Please try:\n" +
          "- Converting your CV to a text-based PDF or DOCX format\n" +
          "- Using a different PDF file\n" +
          "- Converting your CV to plain text (.txt) format";
        isPDFError = true;
      } else if (errorMessage.includes("timeout")) {
        errorTitle = "Request Timeout";
        errorMessage = "The request timed out. This may be due to a large file or network issues. Please try again with a smaller file or check your internet connection.";
      }
      
      // Set alert state instead of using alert()
      setAlertTitle(errorTitle);
      setAlertMessage(errorMessage);
      
      if (isPDFError) {
        setIsPDFErrorDialogOpen(true);
      } else {
        setIsAlertOpen(true);
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Head>
        <title>ATS CV Checker - Optimize Your Resume for Applicant Tracking Systems</title>
        <meta name="description" content="Free AI-powered ATS compatibility checker for resumes and CVs. Get detailed analysis and recommendations to improve your chances of passing automated resume screening." />
        <meta name="keywords" content="ATS checker, resume optimizer, CV analyzer, applicant tracking system, resume scanner, job application, career tool, hiring process, recruitment, job search" />
        <link rel="canonical" href="https://ats-checker.cnt-recruitment.com/" />
      </Head>
      
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-2 py-2 mb-8">
          <div className="flex justify-start" style={{ marginLeft: '28%' }}>
            <div className="w-30 h-30 flex items-center justify-center">
              <img src="/cnt-logo.png" alt="CNT Logo" className="w-30 h-30 object-contain" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">ATS CV Checker</h1>
            <p className="text-muted-foreground mb-2">
              Optimize your resume for Applicant Tracking Systems
            </p>
            <p className="text-sm text-muted-foreground">
              Upload PDF, Word document, or text file (Max 1MB)
            </p>
          </div>

          {/* Job Information Form */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-primary">Job Name</CardTitle>
                <CardDescription>Enter the position you're applying for</CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  type="text"
                  value={jobName}
                  onChange={handleJobNameChange}
                  placeholder="e.g., Frontend Developer, Data Analyst, Marketing Manager"
                  className={`w-full px-3 py-2 border rounded-md bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
                    errors.jobName ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                  }`}
                />
                {errors.jobName && (
                  <p className="mt-1 text-sm text-red-500">{errors.jobName}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-primary">Job Description</CardTitle>
                <CardDescription>Enter key requirements and responsibilities</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={jobDescription}
                  onChange={handleJobDescriptionChange}
                  placeholder="Paste key requirements, skills, and responsibilities from the job posting..."
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 resize-none ${
                    errors.jobDescription ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                  }`}
                />
                {errors.jobDescription && (
                  <p className="mt-1 text-sm text-red-500">{errors.jobDescription}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* PDF Requirements Info */}
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                <Info className="w-5 h-5" />
                PDF File Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-3">
                <strong>Important:</strong> For best results, please ensure your PDF file is text-based, not a scanned image.
              </p>
              <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
                <li>Text-based PDFs allow text selection and copying</li>
                <li>Scanned image PDFs (without selectable text) will not be processed correctly</li>
                <li>If unsure, try selecting text in your PDF - if you can't select text, it's likely a scanned image</li>
                <li>Convert scanned PDFs to text-based PDFs using OCR software or online converters</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <CardTitle className="text-center text-primary">Upload Your CV</CardTitle>
              <CardDescription className="text-center">
                Supported formats: PDF, DOC, DOCX, TXT (Max 1MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileInput}
                accept=".pdf,.doc,.docx,.txt"
              />
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground"
                }`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragOver(true)
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Drag and drop your CV/Resume here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports PDF, DOC, DOCX, TXT (Max 1MB)
                </p>
              </div>

              {file && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                      Remove
                    </Button>
                  </div>
                </div>
              )}

              <Button
                onClick={handleATSCheck}
                disabled={!file || isUploading || !!errors.jobName || !!errors.jobDescription}
                variant="secondary"
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing CV...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Check ATS Compatibility
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Warning for Scanned PDFs */}
          <Card className="mt-6 bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-lg text-yellow-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Having trouble with scanned PDFs?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700 mb-3">
                If your uploaded PDF doesn't process correctly, it might be a scanned image PDF without selectable text.
              </p>
              <p className="text-yellow-700 text-sm">
                <strong>Solution:</strong> Convert your scanned PDF to a text-based PDF using OCR (Optical Character Recognition) software, or save your CV as a DOCX or TXT file instead.
              </p>
            </CardContent>
          </Card>

          {/* Features Preview */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-primary">CV Parsing Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Check how well ATS systems can extract your information</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-primary">Keyword Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Analyze keyword density and relevance for your target role</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-primary">Scoring & Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Get an overall ATS compatibility score with AI analysis</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-primary">Format & Readability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Ensure your CV format is ATS-friendly and readable</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Standard Error Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              {alertTitle}
            </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line text-foreground">
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsAlertOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Specialized PDF Error Dialog */}
      <PDFErrorDialog 
        open={isPDFErrorDialogOpen} 
        onOpenChange={setIsPDFErrorDialogOpen} 
        title={alertTitle} 
        message={alertMessage} 
      />
    </div>
  )
}