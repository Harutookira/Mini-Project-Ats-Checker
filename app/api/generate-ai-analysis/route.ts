// app/api/generate-ai-analysis/route.ts

import { NextRequest, NextResponse } from "next/server";
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
  try {
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

    if (!cvText && !customPrompt) {
      return NextResponse.json({ error: "CV text or custom prompt is required" }, { status: 400 });
    }

    let prompt = customPrompt;

    if (!prompt) {
      // Buat prompt default jika tidak ada custom prompt
      prompt = `Anda adalah seorang HRD ahli yang sedang menganalisis sebuah CV untuk kecocokannya dengan sistem ATS.
      
      CV TEXT:
      ---
      ${cvText}
      ---
      
      TARGET PEKERJAAN:
      - Nama Pekerjaan: ${jobName || "Tidak spesifik"}
      - Deskripsi Pekerjaan: ${jobDescription || "Tidak spesifik"}
      
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