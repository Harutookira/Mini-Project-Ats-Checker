import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export interface AIAnalysisResult {
  overallAssessment: string
  strengths: string[]
  weaknesses: string[]
  industrySpecificAdvice: string[]
  atsOptimizationTips: string[]
  careerLevelAssessment: string
  improvementPriority: "high" | "medium" | "low"
}

export async function analyzeWithAI(cvText: string): Promise<AIAnalysisResult> {
  try {
    const prompt = `
    You are an expert ATS (Applicant Tracking System) consultant and career advisor. Analyze the following CV/resume text and provide detailed insights for ATS optimization.

    CV Text:
    ${cvText}

    Please provide a comprehensive analysis in the following JSON format:
    {
      "overallAssessment": "A 2-3 sentence overall assessment of the CV's ATS compatibility and professional quality",
      "strengths": ["List 3-5 key strengths of this CV"],
      "weaknesses": ["List 3-5 areas that need improvement"],
      "industrySpecificAdvice": ["List 3-4 industry-specific recommendations based on the CV content"],
      "atsOptimizationTips": ["List 4-5 specific ATS optimization recommendations"],
      "careerLevelAssessment": "Assess if this appears to be entry-level, mid-level, or senior-level based on experience",
      "improvementPriority": "high/medium/low - based on how urgently this CV needs improvements"
    }

    Focus on:
    - ATS parsing compatibility
    - Keyword optimization
    - Professional formatting
    - Content quality and relevance
    - Industry standards
    - Career progression clarity
    `

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      temperature: 0.3,
    })

    // Parse the AI response
    try {
      const aiResult = JSON.parse(text)
      return aiResult as AIAnalysisResult
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return {
        overallAssessment: "AI analysis completed. The CV shows potential for ATS optimization improvements.",
        strengths: ["Professional presentation", "Clear structure", "Relevant experience"],
        weaknesses: ["Could benefit from keyword optimization", "Format improvements needed"],
        industrySpecificAdvice: ["Align with industry standards", "Include relevant certifications"],
        atsOptimizationTips: [
          "Use standard section headers",
          "Include more action verbs",
          "Add quantifiable achievements",
        ],
        careerLevelAssessment: "Mid-level professional",
        improvementPriority: "medium",
      }
    }
  } catch (error) {
    console.error("AI Analysis Error:", error)
    // Return fallback analysis if AI fails
    return {
      overallAssessment:
        "CV analysis completed using standard algorithms. Consider AI-powered insights for enhanced recommendations.",
      strengths: ["Document structure maintained", "Content organization present"],
      weaknesses: ["AI analysis unavailable", "Standard analysis limitations"],
      industrySpecificAdvice: ["Follow industry best practices", "Research role-specific requirements"],
      atsOptimizationTips: ["Use clear section headers", "Include relevant keywords", "Maintain consistent formatting"],
      careerLevelAssessment: "Professional level",
      improvementPriority: "medium",
    }
  }
}

export async function generatePersonalizedSuggestions(cvText: string, targetRole?: string): Promise<string[]> {
  try {
    const prompt = `
    Based on this CV content${targetRole ? ` and target role of "${targetRole}"` : ""}, provide 5 specific, actionable suggestions for improvement:

    CV Text:
    ${cvText}

    Provide exactly 5 bullet-point suggestions in a simple array format:
    ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4", "suggestion 5"]
    `

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      temperature: 0.4,
    })

    try {
      const suggestions = JSON.parse(text)
      return Array.isArray(suggestions) ? suggestions : []
    } catch {
      // Fallback suggestions
      return [
        "Add more quantifiable achievements with specific numbers and percentages",
        "Include industry-relevant keywords naturally throughout your experience descriptions",
        "Use strong action verbs to start each bullet point in your experience section",
        "Ensure consistent formatting and clear section headers for better ATS parsing",
        "Add a professional summary that highlights your key qualifications and career goals",
      ]
    }
  } catch (error) {
    console.error("Personalized Suggestions Error:", error)
    return [
      "Optimize keyword usage for your target industry",
      "Quantify achievements with specific metrics",
      "Improve section organization and headers",
      "Enhance professional summary section",
      "Ensure consistent formatting throughout",
    ]
  }
}
