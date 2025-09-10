// app/api/generate-ai-analysis/route.ts

import { NextRequest, NextResponse } from "next/server";
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { validateText, validateProcessedCVText, isRateLimited, sanitizeText } from '@/lib/input-validator';

// Pre-process CV text to remove common patterns that might be flagged by validation
function preprocessCVText(text: string): string {
  // Remove or escape common patterns that might be flagged
  let processedText = text;
  
  // Replace standalone semicolons that might be flagged
  // But preserve semicolons in contexts that are clearly not SQL
  processedText = processedText.replace(/;\s*([A-Z])/g, "; $1"); // Add space after semicolon if followed by capital letter
  
  // Remove excessive whitespace that might contribute to patterns
  processedText = processedText.replace(/\s+/g, ' ');
  
  // Trim the text
  processedText = processedText.trim();
  
  return processedText;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - check if the client is making too many requests
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (isRateLimited(clientIP)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    }

    // Check if API key is available
    if (!process.env.GOOGLE_API_KEY) {
      console.error("GOOGLE_API_KEY is not set in environment variables");
      return NextResponse.json({ 
        error: "AI service is not properly configured",
        details: "The GOOGLE_API_KEY environment variable is not set. This is required for Gemini AI to function.",
        solution: "Please add the GOOGLE_API_KEY environment variable to your Vercel project settings with your Gemini API key."
      }, { status: 500 });
    }

    const { cvText, jobName, jobDescription, customPrompt } = await request.json();

    // Sanitize inputs to prevent XSS
    let sanitizedCvText = '';
    let sanitizedJobName = '';
    let sanitizedJobDescription = '';
    let sanitizedCustomPrompt = '';

    if (cvText) {
      sanitizedCvText = sanitizeText(cvText);
      // Pre-process CV text to reduce false positives
      sanitizedCvText = preprocessCVText(sanitizedCvText);
      // Validate CV text with specialized function for processed CV text
      const cvTextValidation = validateProcessedCVText(sanitizedCvText);
      if (!cvTextValidation.isValid) {
        return NextResponse.json({ 
          error: cvTextValidation.error,
          pattern: cvTextValidation.pattern
        }, { status: 400 });
      }
    }

    if (jobName) {
      sanitizedJobName = sanitizeText(jobName);
    }

    if (jobDescription) {
      sanitizedJobDescription = sanitizeText(jobDescription);
      // Validate job description
      const jobDescriptionValidation = validateText(sanitizedJobDescription, 2000);
      if (!jobDescriptionValidation.isValid) {
        return NextResponse.json({ 
          error: jobDescriptionValidation.error,
          pattern: jobDescriptionValidation.pattern
        }, { status: 400 });
      }
    }

    if (customPrompt) {
      sanitizedCustomPrompt = sanitizeText(customPrompt);
      // Validate custom prompt
      const customPromptValidation = validateText(sanitizedCustomPrompt);
      if (!customPromptValidation.isValid) {
        return NextResponse.json({ 
          error: customPromptValidation.error,
          pattern: customPromptValidation.pattern
        }, { status: 400 });
      }
    }

    if (!sanitizedCvText && !sanitizedCustomPrompt) {
      return NextResponse.json({ error: "CV text or custom prompt is required" }, { status: 400 });
    }

    let prompt = sanitizedCustomPrompt;

    if (!prompt) {
      // Buat prompt default jika tidak ada custom prompt
      prompt = `Anda adalah seorang HRD ahli yang sedang menganalisis sebuah CV untuk kecocokannya dengan sistem ATS.
      
      CV TEXT:
      ---
      ${sanitizedCvText}
      ---
      
      TARGET PEKERJAAN:
      - Nama Pekerjaan: ${sanitizedJobName || "Tidak spesifik"}
      - Deskripsi Pekerjaan: ${sanitizedJobDescription || "Tidak spesifik"}
      
      Tugas Anda:
      Berikan analisis komprehensif dalam format yang mudah dibaca. Sertakan:
      1.  **SKOR TOTAL** (0-100) dan **GRADE** (A/B/C/D/F).
      2.  **SKOR PER KATEGORI** (Dampak Kuantitatif, Panjang CV, Kelengkapan, Kata Kunci Job).
      3.  **MASALAH UTAMA** (3-5 poin paling kritis).
      4.  **REKOMENDASI PERBAIKAN** (3-5 saran yang bisa langsung diterapkan).
      5.  **KESIMPULAN SINGKAT**.
      
      Gunakan format yang jelas dengan emoji untuk setiap bagian (📊 untuk Skor, 🎯 untuk Skor Total, ❌ untuk Masalah, ✅ untuk Rekomendasi, 💡 для Kesimpulan).`;
    }

    // Use the correct model from @ai-sdk/google
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: prompt,
    });

    return NextResponse.json({ result: text });

  } catch (error) {
    console.error("AI Analysis API Error:", error);
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json({ 
      error: "Failed to get AI analysis",
      details: errorMessage,
      stack: errorStack,
      solution: "Please check your environment variables and ensure your GOOGLE_API_KEY is correctly set in Vercel."
    }, { status: 500 });
  }
}