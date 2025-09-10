"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [jobName, setJobName] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [errors, setErrors] = useState<{jobName?: string, jobDescription?: string}>({})
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

    if (allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile)
    } else {
      alert("Please upload a PDF, Word document, or text file only.")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
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
      const formData = new FormData()
      formData.append("file", file)
      formData.append("jobName", jobName)
      formData.append("jobDescription", jobDescription)

      const response = await fetch("/api/analyze-cv", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze CV")
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
    } catch (error) {
      console.error("Analysis failed:", error)
      alert(error instanceof Error ? error.message : "Failed to analyze CV. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">ATS CV Checker</h1>
              <p className="text-muted-foreground">Optimize your resume for Applicant Tracking Systems</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Check Your CV Against ATS Standards</h2>
            <p className="text-lg text-muted-foreground">
              Upload your CV and get detailed analysis on parsing, keywords, formatting, and readability
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
                  className={`w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
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
                  className={`w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 resize-none ${
                    errors.jobDescription ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                  }`}
                />
                {errors.jobDescription && (
                  <p className="mt-1 text-sm text-red-500">{errors.jobDescription}</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <CardTitle className="text-center text-primary">Upload Your CV</CardTitle>
              <CardDescription className="text-center">
                Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragOver(true)
                }}
                onDragLeave={() => setIsDragOver(false)}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>

                  {file ? (
                    <div className="flex items-center gap-2 text-primary">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">{file.name}</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-medium text-foreground mb-2">Drag and drop your CV here</p>
                      <p className="text-muted-foreground">or click to browse files</p>
                    </div>
                  )}
                </div>
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
                className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
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
    </div>
  )
}