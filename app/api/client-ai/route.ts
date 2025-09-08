import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { action, cvText, jobName, jobDescription, category } = await request.json()
    
    // This endpoint just returns instructions for client-side evaluation
    // The actual AI calls will be made in the browser using Puter.js
    
    if (action === 'getEvaluationPrompt') {
      let prompt = ""
      
      switch (category) {
        case "Dampak Kuantitatif":
          prompt = `Kamu adalah HRD yang melakukan pengecekan terhadap CV ATS. Evaluasi CV berikut berdasarkan Dampak Kuantitatif:

CV Text:
${cvText}

Job Name: ${jobName || 'Tidak disediakan'}
Job Description: ${jobDescription || 'Tidak disediakan'}

Evaluasi berdasarkan:
- Apakah CV menunjukkan pengalaman kerja dan project yang relevan dengan posisi?
- Adakah angka/metrik yang spesifik (contoh: 25% improvement, 10+ projects, $100K revenue)?
- Seberapa relevan pengalaman dengan job description?

Berikan penilaian dalam format JSON:
{
  "score": 85,
  "status": "excellent",
  "issues": ["daftar masalah yang ditemukan"],
  "recommendations": ["daftar saran perbaikan"]
}`
          break
          
        case "Panjang CV":
          prompt = `Evaluasi panjang CV (ideal 200-600 kata). Berikan dalam format JSON dengan score, status, issues, dan recommendations.`
          break
          
        case "Kelengkapan CV":
          prompt = `Evaluasi kelengkapan CV (kontak, pengalaman, pendidikan, skills). Berikan dalam format JSON dengan score, status, issues, dan recommendations.`
          break
          
        case "Kata Kunci Sesuai Job":
          prompt = `Evaluasi kata kunci CV sesuai job description. Berikan dalam format JSON dengan score, status, issues, dan recommendations.`
          break
      }
      
      return NextResponse.json({ prompt })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('Client AI API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}