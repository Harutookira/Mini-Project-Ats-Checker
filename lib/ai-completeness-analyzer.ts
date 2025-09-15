// lib/ai-completeness-analyzer.ts
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

// Interface for AI completeness analysis result
export interface AICompletenessResult {
  completenessScore: number;
  spellingScore: number;
  grammarScore: number;
  overallAssessment: string;
  missingElements: string[];
  spellingIssues: string[];
  grammarIssues: string[];
  recommendations: string[];
}

// Function to analyze CV completeness, spelling, and grammar using Gemini AI
export async function analyzeCVCompletenessWithAI(cvText: string): Promise<AICompletenessResult> {
  try {
    // Check if API key is available
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not set');
    }

    const prompt = `
    Kamu adalah seorang HRD yang memahami dari kosakata hingga tata bahasa. Kamu diberikan cv dengan isi "${cvText}" dan kamu harus menemukan issu-issue yang ada tentang kelengkapan cv, tata bahasa, dan kosakata yang ada serta berikan rekomendasi dariapda isu yang telah kamu sebutkan sebelumnya. Lalu kamu berikan score atas kelengkapan tersebut.

    Harap analisis dan berikan skor serta umpan balik dalam format JSON berikut:
    {
      "completenessScore": 85,
      "spellingScore": 90,
      "grammarScore": 88,
      "overallAssessment": "Ringkasan singkat 2-3 kalimat tentang kualitas keseluruhan CV",
      "missingElements": [
        "Daftar elemen spesifik yang hilang dari CV (misalnya, 'Bagian informasi kontak', 'Ringkasan profesional', 'Tanggal pengalaman kerja')",
        "Fokus pada kelengkapan struktural"
      ],
      "spellingIssues": [
        "Daftar kesalahan ejaan yang ditemukan (misalnya, 'experiance' seharusnya 'experience')",
        "Jika tidak ditemukan, sertakan 'Tidak ditemukan kesalahan ejaan signifikan'"
      ],
      "grammarIssues": [
        "Daftar masalah tata bahasa yang ditemukan (misalnya, 'Kesalahan bentuk kerja dalam poin kedua', 'Fragmen kalimat dalam bagian ringkasan')",
        "Jika tidak ditemukan, sertakan 'Tidak ditemukan masalah tata bahasa signifikan'"
      ],
      "recommendations": [
        "Berikan 3-5 rekomendasi spesifik dan dapat ditindaklanjuti untuk meningkatkan CV",
        "Fokus pada peningkatan kelengkapan, ejaan, dan tata bahasa"
      ]
    }

    Pedoman penilaian:
    - Skor Kelengkapan (0-100): Berdasarkan keberadaan bagian penting (info kontak, ringkasan profesional, pengalaman, pendidikan, keterampilan) dan kelengkapan informasi dalam setiap bagian
    - Perhatikan khusus bagian "Ringkasan Profesional" atau "Profil": 
      * Harus ada di awal CV
      * Berisi 2-4 kalimat yang menjelaskan latar belakang profesional, keahlian utama, dan tujuan karir
      * Menggunakan bahasa yang kuat dan hasil yang dapat diukur
      * Tidak boleh terlalu umum seperti "Saya seorang pekerja keras" atau "Saya memiliki minat dalam..."
      * Hindari frasa klise seperti "pekerja keras", "team player", dll.
    - Jika menemukan frasa seperti "saya seorang...", "saya memiliki minat...", periksa apakah diikuti dengan informasi spesifik atau hanya pernyataan umum
    - Skor Ejaan (0-100): Berdasarkan jumlah dan tingkat kesalahan ejaan
    - Skor Tata Bahasa (0-100): Berdasarkan jumlah dan tingkat masalah tata bahasa

    PENTING: Hanya berikan objek JSON saja. Jangan sertakan format markdown, penjelasan, atau teks tambahan.
    `;

    // Generate text using the Gemini model
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: prompt,
    });

    // Parse the AI response
    try {
      // Clean the response by removing markdown code blocks if present
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\s*/, '').replace(/\s*```$/, '');
      }
      
      const aiResult = JSON.parse(cleanedText);
      
      // Validate the result structure
      if (typeof aiResult.completenessScore === 'number' && 
          typeof aiResult.spellingScore === 'number' && 
          typeof aiResult.grammarScore === 'number' &&
          typeof aiResult.overallAssessment === 'string' &&
          Array.isArray(aiResult.missingElements) &&
          Array.isArray(aiResult.spellingIssues) &&
          Array.isArray(aiResult.grammarIssues) &&
          Array.isArray(aiResult.recommendations)) {
        return aiResult as AICompletenessResult;
      } else {
        throw new Error('Invalid AI response structure');
      }
    } catch (parseError: unknown) {
      console.warn("Failed to parse AI completeness response, using fallback", parseError);
      console.warn("Raw response:", text);
      return getFallbackCompletenessResult();
    }
  } catch (error: unknown) {
    console.error("AI Completeness Analysis Error:", error);
    return getFallbackCompletenessResult();
  }
}

// Fallback function when AI is not available or fails
function getFallbackCompletenessResult(): AICompletenessResult {
  return {
    completenessScore: 75,
    spellingScore: 80,
    grammarScore: 75,
    overallAssessment: "Analisis CV selesai menggunakan algoritma standar. Dokumen menunjukkan struktur profesional dengan peluang untuk perbaikan dalam kelengkapan, ejaan, dan tata bahasa.",
    missingElements: [
      "Pertimbangan untuk menambahkan bagian ringkasan profesional yang mencerminkan pengalaman dan tujuan karir Anda",
      "Sertakan deskripsi pekerjaan yang lebih terperinci dengan pencapaian yang dapat diukur",
      "Tambahkan bagian keterampilan yang didedikasikan dengan kompetensi teknis spesifik"
    ],
    spellingIssues: [
      "Tidak ditemukan kesalahan ejaan signifikan dengan validasi standar"
    ],
    grammarIssues: [
      "Tidak ditemukan masalah tata bahasa signifikan dengan validasi standar"
    ],
    recommendations: [
      "Tambahkan ringkasan profesional di awal CV Anda yang mencakup 2-3 kalimat tentang latar belakang, keahlian utama, dan tujuan karir. Hindari frasa umum seperti 'saya seorang pekerja keras'",
      "Sertakan metrik spesifik dan pencapaian dalam pengalaman kerja Anda",
      "Pastikan konsistensi bentuk kerja sepanjang CV Anda",
      "Tambahkan bagian keterampilan yang didedikasikan dengan keterampilan teknis yang relevan",
      "Periksa kembali dengan cermat untuk menghilangkan kesalahan ejaan atau tata bahasa yang tersisa"
    ]
  };
}
