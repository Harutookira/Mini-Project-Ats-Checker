export interface CVAnalysisResult {
  category: string
  score: number
  status: "excellent" | "good" | "needs-improvement" | "poor"
  issues: string[]
  recommendations: string[]
}

export interface ParsedCV {
  text: string
  sections: {
    contact?: string
    summary?: string
    experience?: string
    education?: string
    skills?: string
  }
  metadata: {
    wordCount: number
    hasEmail: boolean
    hasPhone: boolean
    hasLinkedIn: boolean
    sectionCount: number
  }
}

// Parse CV text and extract sections
export function parseCV(text: string): ParsedCV {
  const sections: ParsedCV["sections"] = {}
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  // Common section headers with enhanced patterns for Indonesian CVs
  const sectionPatterns = {
    contact: /^(contact|personal|info|kontak|personal info|informasi pribadi)/i,
    summary: /^(summary|profile|objective|about|profil|tentang|ringkasan|professional summary|career objective|tentang saya|profil profesional)/i,
    experience: /^(experience|work|employment|career|professional|pengalaman|pengalaman kerja|riwayat pekerjaan|karir)/i,
    education: /^(education|academic|qualification|degree|pendidikan|pendidikan tinggi|riwayat pendidikan|ijazah)/i,
    skills: /^(skills|technical|competenc|abilities|keterampilan|kompetensi|keahlian|skill)/i,
  }

  let currentSection = ""
  let sectionContent: string[] = []

  for (const line of lines) {
    let foundSection = false

    // Check if line is a section header
    for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(line)) {
        // Save previous section
        if (currentSection && sectionContent.length > 0) {
          sections[currentSection as keyof typeof sections] = sectionContent.join(" ")
        }

        currentSection = sectionName
        sectionContent = []
        foundSection = true
        break
      }
    }

    if (!foundSection && currentSection) {
      sectionContent.push(line)
    }
  }

  // Save last section
  if (currentSection && sectionContent.length > 0) {
    sections[currentSection as keyof typeof sections] = sectionContent.join(" ")
  }

  // Extract metadata
  const metadata = {
    wordCount: text.split(/\s+/).length,
    hasEmail: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text),
    hasPhone: /(\+62[\s-]?\d{3,4}[\s-]?\d{3,4}[\s-]?\d{3,4})|(08\d{2}[\s-]?\d{4}[\s-]?\d{4})|(\+62[\s-]?\d{8,12})|(08\d{8,12})|([\(]?\d{3}[\)]?[\s-]?\d{3,4}[\s-]?\d{4})/.test(text),
    hasLinkedIn: /linkedin\.com\/in\//.test(text.toLowerCase()),
    sectionCount: Object.keys(sections).length,
  }

  return {
    text,
    sections,
    metadata,
  }
}

// Analyze CV parsing compatibility
export function analyzeParsing(parsedCV: ParsedCV): CVAnalysisResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 2

  // Check essential contact information
  if (!parsedCV.metadata.hasEmail) {
    issues.push("Email address not detected or poorly formatted")
    recommendations.push("Include a clear email address in standard format")
    score -= 15
  }

  if (!parsedCV.metadata.hasPhone) {
    issues.push("Phone number not detected or poorly formatted")
    recommendations.push("Include phone number in standard format (e.g., +1-555-123-4567)")
    score -= 10
  }

  // Check section structure
  if (parsedCV.metadata.sectionCount < 3) {
    issues.push("Limited section structure detected")
    recommendations.push('Use clear section headers like "Experience", "Education", "Skills"')
    score -= 20
  }

  if (!parsedCV.sections.experience) {
    issues.push("Experience section not clearly identified")
    recommendations.push("Use standard header 'Experience' or 'Work Experience'")
    score -= 15
  }

  if (!parsedCV.sections.education) {
    issues.push("Education section not clearly identified")
    recommendations.push("Include clear 'Education' section with degrees and institutions")
    score -= 10
  }

  // Determine status
  let status: CVAnalysisResult["status"]
  if (score >= 85) status = "excellent"
  else if (score >= 70) status = "good"
  else if (score >= 50) status = "needs-improvement"
  else status = "poor"

  return {
    category: "CV Parsing",
    score: Math.max(0, score),
    status,
    issues,
    recommendations,
  }
}

// New ATS evaluation based on 5 criteria
export function analyzeQuantitativeImpact(parsedCV: ParsedCV, jobDescription: string = '', jobName: string = ''): CVAnalysisResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100

  // Check if both job title and job description are empty
  if (!jobDescription && !jobName) {
    issues.push("Tidak ada informasi pekerjaan target untuk analisis dampak kuantitatif")
    recommendations.push("Masukkan nama pekerjaan dan deskripsi untuk analisis yang lebih akurat")
    score = 0 // Give 0 score when no job info provided as requested
  } else {
    const text = parsedCV.text.toLowerCase()
    const jobDesc = jobDescription.toLowerCase()

    // Check for quantifiable achievements
    const hasNumbers = /\d+%|\d+\+|\$\d+|\d+ years?|\d+ months?|\d+ projects?|\d+ clients?|\d+ users?/g.test(text)
    const quantifiableMatches = text.match(/\d+%|\d+\+|\$\d+|\d+ years?|\d+ months?|\d+ projects?|\d+ clients?|\d+ users?/g) || []
    
    if (quantifiableMatches.length < 3) {
      issues.push("Kurang dampak kuantitatif dalam pengalaman kerja")
      recommendations.push("Tambahkan angka spesifik seperti peningkatan 25%, mengelola 10+ proyek, dll")
      score -= 30
    }

    // Check relevance to job description
    if (jobDesc) {
      const jobKeywords = jobDesc.match(/\b\w{4,}\b/g) || []
      const relevantKeywords = jobKeywords.filter(keyword => text.includes(keyword))
      const relevanceScore = (relevantKeywords.length / Math.max(jobKeywords.length, 1)) * 100
      
      if (relevanceScore < 30) {
        issues.push("Pengalaman kerja kurang relevan dengan posisi yang dilamar")
        recommendations.push("Sesuaikan pengalaman dengan requirement job description")
        score -= 25
      }
    }

    // Check for project experience
    const hasProjects = /project|proyek|pengembangan|implementasi|membangun|menciptakan/i.test(text)
    if (!hasProjects) {
      issues.push("Tidak ada pengalaman project yang jelas")
      recommendations.push("Sertakan project-project relevan yang pernah dikerjakan")
      score -= 20
    }
  }

  let status: CVAnalysisResult["status"]
  if (score >= 85) status = "excellent"
  else if (score >= 70) status = "good"
  else if (score >= 50) status = "needs-improvement"
  else status = "poor"

  return {
    category: "Dampak Kuantitatif",
    score: Math.max(0, score),
    status,
    issues,
    recommendations,
  }
}

// Analyze keyword matching
export function analyzeKeywords(parsedCV: ParsedCV, targetKeywords: string[] = []): CVAnalysisResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100

  const text = parsedCV.text.toLowerCase()

  // Common professional keywords
  const commonKeywords = [
    "managed",
    "developed",
    "implemented",
    "created",
    "designed",
    "led",
    "coordinated",
    "analyzed",
    "improved",
    "optimized",
    "achieved",
    "delivered",
    "collaborated",
  ]

  const technicalKeywords = [
    "javascript",
    "python",
    "react",
    "node.js",
    "sql",
    "aws",
    "docker",
    "git",
    "agile",
    "scrum",
    "api",
    "database",
    "frontend",
    "backend",
    "full-stack",
  ]

  // Check for action verbs
  const actionVerbsFound = commonKeywords.filter((keyword) => text.includes(keyword))
  if (actionVerbsFound.length < 5) {
    issues.push("Limited use of strong action verbs")
    recommendations.push("Include more action verbs like 'managed', 'developed', 'implemented'")
    score -= 15
  }

  // Check for technical skills
  const techSkillsFound = technicalKeywords.filter((keyword) => text.includes(keyword))
  if (techSkillsFound.length < 3) {
    issues.push("Limited technical keywords detected")
    recommendations.push("Include relevant technical skills and technologies")
    score -= 20
  }

  // Check keyword density
  const totalWords = parsedCV.metadata.wordCount
  const keywordDensity = ((actionVerbsFound.length + techSkillsFound.length) / totalWords) * 100

  if (keywordDensity < 2) {
    issues.push("Low keyword density for ATS optimization")
    recommendations.push("Naturally incorporate more industry-relevant keywords")
    score -= 23
  }

  // Check for quantifiable achievements
  const hasNumbers = /\d+%|\d+\+|\$\d+|\d+ years?|\d+ months?/.test(text)
  if (!hasNumbers) {
    issues.push("Missing quantifiable achievements")
    recommendations.push("Include specific numbers, percentages, and metrics")
    score -= 20
  }

  let status: CVAnalysisResult["status"]
  if (score >= 85) status = "excellent"
  else if (score >= 70) status = "good"
  else if (score >= 50) status = "needs-improvement"
  else status = "poor"

  return {
    category: "Keyword Matching",
    score: Math.max(0, score),
    status,
    issues,
    recommendations,
  }
}

// Analyze CV length (200-600 words optimal)
export function analyzeCVLength(parsedCV: ParsedCV): CVAnalysisResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100

  const wordCount = parsedCV.metadata.wordCount

  if (wordCount < 200) {
    issues.push(`CV terlalu pendek (${wordCount} kata). Ideal 200-600 kata`)
    recommendations.push("Tambahkan detail pengalaman, skill, dan pencapaian")
    score -= 40
  } else if (wordCount > 600) {
    issues.push(`CV terlalu panjang (${wordCount} kata). Ideal 200-600 kata`)
    recommendations.push("Ringkas konten, fokus pada informasi paling relevan")
    score -= 25
  } else if (wordCount >= 200 && wordCount <= 600) {
    // Perfect range, give bonus points
    score = 100
  }

  let status: CVAnalysisResult["status"]
  if (score >= 85) status = "excellent"
  else if (score >= 70) status = "good"
  else if (score >= 50) status = "needs-improvement"
  else status = "poor"

  return {
    category: "Panjang CV",
    score: Math.max(0, score),
    status,
    issues,
    recommendations,
  }
}

// Analyze bullet points (10-30 words optimal)
export function analyzeBulletPoints(parsedCV: ParsedCV): CVAnalysisResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100

  const text = parsedCV.text
  
  // Find bullet points
  const bulletLines = text.split('\n').filter(line => 
    /^\s*[•·▪▫◦‣⁃\-\*\+]\s/.test(line) || 
    /^\s*\d+\.\s/.test(line)
  )

  if (bulletLines.length === 0) {
    issues.push("Tidak ada bullet points yang terdeteksi")
    recommendations.push("Gunakan bullet points untuk menjelaskan pengalaman kerja")
    score -= 30
  } else {
    // Analyze bullet point length
    let shortBullets = 0
    let longBullets = 0
    let optimalBullets = 0

    bulletLines.forEach(line => {
      const words = line.replace(/^\s*[•·▪▫◦‣⁃\-\*\+\d\.]/g, '').trim().split(/\s+/).length
      if (words < 10) shortBullets++
      else if (words > 30) longBullets++
      else optimalBullets++
    })

    if (shortBullets > bulletLines.length * 0.5) {
      issues.push("Banyak bullet points terlalu pendek (kurang dari 10 kata)")
      recommendations.push("Perluas deskripsi dengan detail pencapaian dan hasil")
      score -= 20
    }

    if (longBullets > bulletLines.length * 0.3) {
      issues.push("Beberapa bullet points terlalu panjang (lebih dari 30 kata)")
      recommendations.push("Ringkas bullet points menjadi 10-30 kata per poin")
      score -= 15
    }
  }

  let status: CVAnalysisResult["status"]
  if (score >= 85) status = "excellent"
  else if (score >= 70) status = "good"
  else if (score >= 50) status = "needs-improvement"
  else status = "poor"

  return {
    category: "Ringkasan Bullet Point",
    score: Math.max(0, score),
    status,
    issues,
    recommendations,
  }
}

// Helper function to determine if document is likely a certificate rather than a CV
function isLikelyCertificate(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Certificate-specific indicators
  const certificateIndicators = [
    'certificate', 'sertifikat', 'certification', 'penghargaan', 'award',
    'diterbitkan oleh', 'issued by', 'tanggal diterbitkan', 'issue date',
    'valid until', 'berlaku hingga', 'completion date', 'tanggal penyelesaian',
    'course completion', 'penyelesaian kursus', 'achievement', 'pencapaian'
  ];
  
  // CV-specific indicators (should be absent in certificates)
  const cvIndicators = [
    'experience', 'pengalaman', 'education', 'pendidikan', 'skills', 'keterampilan',
    'contact', 'kontak', 'summary', 'ringkasan', 'profile', 'profil',
    'work history', 'riwayat kerja', 'employment', 'pekerjaan'
  ];
  
  // Count certificate indicators
  const certIndicatorCount = certificateIndicators.filter(indicator => 
    lowerText.includes(indicator)).length;
  
  // Count CV indicators
  const cvIndicatorCount = cvIndicators.filter(indicator => 
    lowerText.includes(indicator)).length;
  
  // If there are more certificate indicators and few CV indicators, it's likely a certificate
  return certIndicatorCount > 2 && cvIndicatorCount < 3;
}

// Helper function to evaluate summary quality
function evaluateSummaryQuality(summaryText: string): number {
  if (!summaryText) return 0
  
  let qualityScore = 0
  const text = summaryText.toLowerCase()
  
  // Check for specific phrases that indicate better quality
  const goodPhrases = [
    'tahun', 'years', 'pengalaman', 'experience', 'berpengalaman', 'experienced',
    'menguasai', 'proficient', 'skilled', 'ahli', 'expert',
    'mencapai', 'achieved', 'berhasil', 'successfully',
    'meningkatkan', 'improved', 'increased', 'enhanced',
    'memimpin', 'led', 'manage', 'mengelola',
    'penghargaan', 'award', 'certification', 'sertifikasi'
  ]
  
  // Check for generic phrases that indicate lower quality
  const genericPhrases = [
    'saya seorang pekerja keras', 'i am a hard worker',
    'bekerja keras', 'kerja keras', 'hard worker',
    'pekerja tim', 'team player',
    'teliti', 'detail oriented',
    'komunikatif', 'communicative'
  ]
  
  // Award points for good phrases
  goodPhrases.forEach(phrase => {
    if (text.includes(phrase)) qualityScore += 10
  })
  
  // Deduct points for generic phrases
  genericPhrases.forEach(phrase => {
    if (text.includes(phrase)) qualityScore -= 5
  })
  
  // Award points for length (but not too long)
  if (text.length > 50 && text.length < 300) qualityScore += 10
  else if (text.length > 300) qualityScore -= 5 // Too long
  
  // Award points for proper sentence structure (at least 2 sentences)
  const sentences = summaryText.split(/[.!?]+/).filter(s => s.trim().length > 0)
  if (sentences.length >= 2) qualityScore += 10
  else if (sentences.length === 1) qualityScore += 5
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, qualityScore))
}

// Analyze CV completeness
export function analyzeCVCompleteness(parsedCV: ParsedCV): CVAnalysisResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100

  // Check if document is likely a certificate
  const isCertificate = isLikelyCertificate(parsedCV.text)
  
  if (isCertificate) {
    // If it's a certificate, don't expect a summary section
    const requiredSections = {
      'Nama': parsedCV.metadata.hasEmail || parsedCV.sections.contact,
      'Kontak': parsedCV.metadata.hasEmail && parsedCV.metadata.hasPhone,
      'Deskripsi/Summary': false, // Don't expect summary in certificates
      'Pengalaman Kerja': parsedCV.sections.experience,
      'Pendidikan': parsedCV.sections.education,
      'Skills': parsedCV.sections.skills
    }

    const text = parsedCV.text.toLowerCase()
    
    // Check for organizational experience
    const hasOrganizational = /organisasi|volunteer|komunitas|committee|pengurus|anggota/i.test(text)
    
    // Check for achievements
    const hasAchievements = /achievement|prestasi|penghargaan|award|sertifikat|certification/i.test(text)
    
    Object.entries(requiredSections).forEach(([section, exists]) => {
      // Skip summary check for certificates
      if (section === 'Deskripsi/Summary') return;
      
      if (!exists) {
        issues.push(`Bagian ${section} tidak lengkap atau tidak terdeteksi`)
        recommendations.push(`Lengkapi bagian ${section} dalam CV`)
        
        // Adjust penalty based on section importance
        if (section === 'Kontak') {
          score -= 20 // Higher penalty for contact info
        } else if (section === 'Pengalaman Kerja') {
          score -= 25 // Highest penalty for work experience
        } else {
          score -= 15 // Standard penalty for other sections
        }
      }
    })

    if (!hasOrganizational) {
      issues.push("Pengalaman organisasi tidak terdeteksi")
      recommendations.push("Sertakan pengalaman organisasi, volunteer, atau aktivitas komunitas")
      score -= 10
    }

    if (!hasAchievements) {
      issues.push("Pencapaian/prestasi tidak terdeteksi")
      recommendations.push("Tambahkan bagian pencapaian, sertifikat, atau penghargaan")
      score -= 10
    }
  } else {
    // Enhanced detection for summary/profile section (for actual CVs)
    const hasSummarySection = !!parsedCV.sections.summary
    
    // Additional check for summary content at the beginning of CV
    let hasSummaryContent = false
    let summaryQualityScore = 0
    
    if (!hasSummarySection) {
      // Check first few lines of CV for summary-like content
      const firstLines = parsedCV.text.split('\n').slice(0, 15).join(' ').toLowerCase()
      const summaryIndicators = [
        'professional', 'karir', 'career', 'pengalaman', 'experience', 
        'kompetensi', 'kompeten', 'skilled', 'skil', 'ability', 'kemampuan',
        'profesional', 'berpengalaman', 'experienced', 'dedicated', 'berdedikasi',
        'passionate', 'bersemangat', 'expert', 'ahli', 'specialist', 'spesialis',
        // Indonesian phrases
        'saya seorang', 'saya adalah', 'saya memiliki', 'minat dalam', 'tertarik dalam',
        'fokus pada', 'berfokus pada', 'spesialisasi dalam', 'berkonsentrasi pada'
      ]
      
      // Check if first lines contain summary indicators but are not part of other sections
      const isLikelySummary = summaryIndicators.some(indicator => firstLines.includes(indicator)) && 
                             !firstLines.includes('experience:') && 
                             !firstLines.includes('education:') && 
                             !firstLines.includes('skills:') &&
                             !firstLines.includes('pengalaman:') && 
                             !firstLines.includes('pendidikan:') && 
                             !firstLines.includes('keterampilan:') &&
                             // Additional checks to avoid false positives for certificates
                             !firstLines.includes('certificate') &&
                             !firstLines.includes('sertifikat') &&
                             !firstLines.includes('certification') &&
                             !firstLines.includes('penghargaan') &&
                             !firstLines.includes('award')
      
      // Additional validation to ensure it's actually a professional summary
      if (isLikelySummary && firstLines.length > 50) {
        // Check for characteristics of a real CV summary vs certificate
        const hasProfessionalIndicators = 
          (firstLines.includes('tahun') || firstLines.includes('years') || firstLines.includes('pengalaman') || firstLines.includes('experience')) &&
          (firstLines.includes('di ') || firstLines.includes('at ') || firstLines.includes('sebagai') || firstLines.includes('as ')) &&
          !firstLines.includes('diterbitkan oleh') && // Certificate issuer
          !firstLines.includes('issued by') && // Certificate issuer
          !firstLines.includes('tanggal diterbitkan') && // Certificate date
          !firstLines.includes('issue date') // Certificate date
          
        if (hasProfessionalIndicators) {
          hasSummaryContent = true
          // Add summary content to parsedCV for consistency
          parsedCV.sections.summary = firstLines
          
          // Evaluate quality of the summary content
          summaryQualityScore = evaluateSummaryQuality(firstLines)
        }
      }
    } else {
      // Evaluate quality of existing summary section
      summaryQualityScore = evaluateSummaryQuality(parsedCV.sections.summary || '')
    }

    const requiredSections = {
      'Nama': parsedCV.metadata.hasEmail || parsedCV.sections.contact,
      'Kontak': parsedCV.metadata.hasEmail && parsedCV.metadata.hasPhone,
      'Deskripsi/Summary': hasSummarySection || hasSummaryContent,
      'Pengalaman Kerja': parsedCV.sections.experience,
      'Pendidikan': parsedCV.sections.education,
      'Skills': parsedCV.sections.skills
    }

    const text = parsedCV.text.toLowerCase()
    
    // Check for organizational experience
    const hasOrganizational = /organisasi|volunteer|komunitas|committee|pengurus|anggota/i.test(text)
    
    // Check for achievements
    const hasAchievements = /achievement|prestasi|penghargaan|award|sertifikat|certification/i.test(text)
    
    Object.entries(requiredSections).forEach(([section, exists]) => {
      if (!exists) {
        issues.push(`Bagian ${section} tidak lengkap atau tidak terdeteksi`)
        recommendations.push(`Lengkapi bagian ${section} dalam CV`)
        
        // Adjust penalty based on section importance
        if (section === 'Deskripsi/Summary') {
          score -= 12 // Slightly lower penalty for summary
        } else if (section === 'Kontak') {
          score -= 20 // Higher penalty for contact info
        } else if (section === 'Pengalaman Kerja') {
          score -= 25 // Highest penalty for work experience
        } else {
          score -= 15 // Standard penalty for other sections
        }
      } else if (section === 'Deskripsi/Summary' && exists) {
        // If summary exists but is of poor quality, apply partial penalty
        if (summaryQualityScore < 30) {
          issues.push('Bagian Deskripsi/Summary ada tetapi kualitasnya perlu ditingkatkan')
          recommendations.push('Perbaiki bagian Deskripsi/Summary dengan menyertakan latar belakang profesional, keahlian utama, dan tujuan karir yang spesifik')
          score -= 8
        } else if (summaryQualityScore < 50) {
          recommendations.push('Pertimbangkan untuk memperkaya bagian Deskripsi/Summary dengan pencapaian atau keahlian spesifik')
        }
      }
    })

    if (!hasOrganizational) {
      issues.push("Pengalaman organisasi tidak terdeteksi")
      recommendations.push("Sertakan pengalaman organisasi, volunteer, atau aktivitas komunitas")
      score -= 10
    }

    if (!hasAchievements) {
      issues.push("Pencapaian/prestasi tidak terdeteksi")
      recommendations.push("Tambahkan bagian pencapaian, sertifikat, atau penghargaan")
      score -= 10
    }
  }

  let status: CVAnalysisResult["status"]
  if (score >= 85) status = "excellent"
  else if (score >= 70) status = "good"
  else if (score >= 50) status = "needs-improvement"
  else status = "poor"

  return {
    category: "Kelengkapan CV",
    score: Math.max(0, score),
    status,
    issues,
    recommendations,
  }
}

// Enhanced TF-IDF implementation for better keyword extraction
interface TFIDFEntry {
  term: string;
  tf: number;
  idf: number;
  tfidf: number;
}

// Simple TF-IDF calculation function
function calculateTFIDF(documents: string[], targetDocumentIndex: number): TFIDFEntry[] {
  // Tokenize and clean documents
  const stopWords = new Set([
    'dengan', 'untuk', 'yang', 'dari', 'dalam', 'pada', 'akan', 'dapat', 'harus', 
    'atau', 'dan', 'juga', 'this', 'that', 'with', 'from', 'will', 'have', 'been', 
    'are', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'as',
    'is', 'was', 'be', 'by', 'an', 'a', 'we', 'you', 'they', 'their', 'our', 'your'
  ]);
  
  const tokenize = (text: string): string[] => {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 3 && !stopWords.has(word));
  };
  
  // Tokenize all documents
  const tokenizedDocs = documents.map(doc => tokenize(doc));
  
  // Calculate term frequency for target document
  const targetDoc = tokenizedDocs[targetDocumentIndex];
  const termFreq: Record<string, number> = {};
  
  targetDoc.forEach(term => {
    termFreq[term] = (termFreq[term] || 0) + 1;
  });
  
  // Calculate TF (term frequency)
  const tf: Record<string, number> = {};
  const totalTerms = targetDoc.length;
  
  Object.keys(termFreq).forEach(term => {
    tf[term] = termFreq[term] / totalTerms;
  });
  
  // Calculate IDF (inverse document frequency)
  const idf: Record<string, number> = {};
  const totalDocs = documents.length;
  
  Object.keys(tf).forEach(term => {
    // Count how many documents contain this term
    const docsContainingTerm = tokenizedDocs.filter(doc => doc.includes(term)).length;
    // Add 1 to denominator to prevent division by zero
    idf[term] = Math.log(totalDocs / (1 + docsContainingTerm));
  });
  
  // Calculate TF-IDF
  const tfidf: TFIDFEntry[] = [];
  
  Object.keys(tf).forEach(term => {
    const tfidfValue = tf[term] * idf[term];
    tfidf.push({
      term,
      tf: tf[term],
      idf: idf[term],
      tfidf: tfidfValue
    });
  });
  
  // Sort by TF-IDF score descending
  return tfidf.sort((a, b) => b.tfidf - a.tfidf);
}

// Semantic similarity function using simple word overlap
function calculateSemanticSimilarity(text1: string, text2: string): number {
  const stopWords = new Set([
    'dengan', 'untuk', 'yang', 'dari', 'dalam', 'pada', 'akan', 'dapat', 'harus', 
    'atau', 'dan', 'juga', 'this', 'that', 'with', 'from', 'will', 'have', 'been', 
    'are', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'as',
    'is', 'was', 'be', 'by', 'an', 'a', 'we', 'you', 'they', 'their', 'our', 'your'
  ]);
  
  const tokenize = (text: string): Set<string> => {
    return new Set(
      text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= 3 && !stopWords.has(word))
    );
  };
  
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);
  
  // Find intersection
  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
  
  // Calculate Jaccard similarity
  const union = new Set([...tokens1, ...tokens2]);
  
  if (union.size === 0) return 0;
  
  return intersection.size / union.size;
}

// Analyze job-specific keywords with enhanced comparison
export async function analyzeJobKeywords(parsedCV: ParsedCV, jobDescription: string = '', jobName: string = ''): Promise<CVAnalysisResult> {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 0 // Start with 0 and calculate based on keyword match rate

  const cvText = parsedCV.text.toLowerCase()
  const jobDesc = jobDescription.toLowerCase()
  const jobTitle = jobName.toLowerCase()

  if (!jobDescription && !jobName) {
    issues.push("Tidak ada informasi pekerjaan target untuk analisis keyword")
    recommendations.push("Masukkan nama pekerjaan dan deskripsi untuk analisis yang lebih akurat")
    score = 0 // Give 0 score when no job info provided as requested
  } else {
    // First try AI-powered analysis
    let aiAnalysisResult = null;
    try {
      // Import the new AI analysis function
      const { analyzeJobKeywordsWithAI } = await import('./ai-analyzer');
      
      // Perform AI analysis
      aiAnalysisResult = await analyzeJobKeywordsWithAI(parsedCV.text, jobDescription, jobName);
      
      if (aiAnalysisResult) {
        // Use AI results
        score = aiAnalysisResult.score;
        issues.push(...aiAnalysisResult.issues);
        recommendations.push(...aiAnalysisResult.recommendations);
        
        // Add specific keyword insights
        if (aiAnalysisResult.relevantKeywords.length > 0) {
          recommendations.push(`Keywords yang sudah sesuai: ${aiAnalysisResult.relevantKeywords.slice(0, 5).join(', ')}`);
        }
        
        if (aiAnalysisResult.missingKeywords.length > 0) {
          issues.push(`Keywords yang perlu ditambahkan: ${aiAnalysisResult.missingKeywords.slice(0, 5).join(', ')}`);
        }
      }
    } catch (error: unknown) {
      console.warn("AI job keyword analysis failed:", error);
      // Continue with rule-based analysis if AI fails
    }
    
    // Fallback to rule-based analysis if AI fails or is not available
    if (!aiAnalysisResult) {
      // Enhanced keyword extraction with better filtering
      const stopWords = new Set([
        'dengan', 'untuk', 'yang', 'dari', 'dalam', 'pada', 'akan', 'dapat', 'harus', 
        'atau', 'dan', 'juga', 'this', 'that', 'with', 'from', 'will', 'have', 'been', 
        'are', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'as',
        'is', 'was', 'be', 'by', 'an', 'a', 'we', 'you', 'they', 'their', 'our', 'your'
      ])
      
      // Extract meaningful keywords from job description (4+ chars, not stop words)
      const jobKeywords = [...new Set([
        ...jobDesc.match(/\b\w{4,}\b/g) || [],
        ...jobTitle.match(/\b\w{3,}\b/g) || []
      ])].filter(word => !stopWords.has(word))
      
      // Extract technical skills and action verbs specifically
      const technicalTerms = jobKeywords.filter(word => 
        /^(javascript|python|react|node|java|sql|aws|docker|git|api|database|frontend|backend|full.?stack|html|css|mongodb|mysql|postgresql|redis|kubernetes|typescript|angular|vue|laravel|php|c\+\+|c#|.net|spring|django|flask|express|agile|scrum|devops|ci\/cd|restful|graphql|json|xml|bootstrap|jquery|sass|less|webpack|babel|npm|yarn|linux|windows|macos|android|ios|swift|kotlin|flutter|dart|go|rust|scala|ruby|rails|pandas|numpy|tensorflow|pytorch|machine.learning|ai|data.science|business.intelligence|powerbi|tableau|excel|word|powerpoint|photoshop|illustrator|figma|sketch|adobe|marketing|seo|sem|google.analytics|facebook.ads|content.marketing|social.media|copywriting|email.marketing|crm|salesforce|hubspot|jira|confluence|slack|teams|zoom|project.management|leadership|communication|teamwork|problem.solving|analytical|creative|detail.oriented|time.management)$/i.test(word)
      )
      
      const actionVerbs = jobKeywords.filter(word => 
        /^(develop|manage|lead|create|design|implement|analyze|optimize|coordinate|collaborate|execute|deliver|achieve|improve|build|maintain|support|troubleshoot|debug|test|deploy|monitor|document|train|mentor|supervise|organize|plan|strategize|negotiate|present|communicate|research|evaluate|assess|review|audit|ensure|verify|validate|integrate|configure|customize|automate|streamline|enhance|upgrade|migrate|scale|secure|protect|backup|restore|recover|install|setup|initialize|launch|execute|operate|administer|facilitate|moderate|guide|assist|counsel|advise|recommend|suggest|propose|draft|write|edit|publish|broadcast|market|promote|advertise|sell|purchase|procure|contract|budget|forecast|report|track|measure|calculate|compute|estimate|predict|model|simulate|visualize|chart|graph|dashboard|present|demonstrate|showcase|exhibit|display)$/i.test(word)
      )
      
      // Enhanced matching with partial word matching for technical terms
      const directMatches = jobKeywords.filter(keyword => cvText.includes(keyword))
      const partialMatches = technicalTerms.filter(term => {
        const baseWord = term.replace(/[.-]/g, '') // Remove dots and dashes
        return cvText.includes(baseWord) || cvText.includes(term.replace(/\./g, ''))
      })
      
      const allMatches = [...new Set([...directMatches, ...partialMatches])]
      
      // Advanced keyword analysis using TF-IDF
      const documents = [cvText, jobDesc];
      const cvKeywords = calculateTFIDF(documents, 0);
      const jobKeywordsTFIDF = calculateTFIDF(documents, 1);
      
      // Get top keywords from both documents
      const topCVKeywords = cvKeywords.slice(0, 20).map(entry => entry.term);
      const topJobKeywords = jobKeywordsTFIDF.slice(0, 20).map(entry => entry.term);
      
      // Find semantic matches between top keywords
      const semanticMatches = topCVKeywords.filter(cvTerm => 
        topJobKeywords.some(jobTerm => 
          calculateSemanticSimilarity(cvTerm, jobTerm) > 0.3 || 
          cvTerm.includes(jobTerm) || 
          jobTerm.includes(cvTerm)
        )
      );
      
      // Enhanced scoring algorithm based on ATS best practices
      // 1. Exact keyword match rate (30% weight)
      const exactMatchRate = (directMatches.length / Math.max(jobKeywords.length, 1)) * 100
      const exactMatchScore = exactMatchRate * 0.3
      
      // 2. Technical skills match rate (25% weight)
      const techMatchRate = technicalTerms.length > 0 
        ? (technicalTerms.filter(term => 
            cvText.includes(term) || cvText.includes(term.replace(/[.-]/g, ''))
          ).length / technicalTerms.length) * 100
        : 0
      const techMatchScore = techMatchRate * 0.25
      
      // 3. Action verbs match rate (15% weight)
      const actionVerbRate = actionVerbs.length > 0
        ? (actionVerbs.filter(verb => cvText.includes(verb)).length / actionVerbs.length) * 100
        : 0
      const actionVerbScore = actionVerbRate * 0.15
      
      // 4. Semantic similarity score (20% weight)
      const semanticSimilarity = calculateSemanticSimilarity(cvText, jobDesc);
      const semanticScore = semanticSimilarity * 100 * 0.2;
      
      // 5. TF-IDF based keyword relevance (10% weight)
      const tfidfRelevance = (semanticMatches.length / Math.max(topJobKeywords.length, 1)) * 100;
      const tfidfScore = tfidfRelevance * 0.1;
      
      // Calculate final score
      score = Math.round(exactMatchScore + techMatchScore + actionVerbScore + semanticScore + tfidfScore)
      
      // Provide detailed feedback with specific numbers
      const totalKeywords = jobKeywords.length
      const matchedCount = allMatches.length
      
      if (exactMatchRate === 0) {
        issues.push(`Tidak ada kata kunci job yang cocok (0 dari ${totalKeywords} kata kunci)`)
        recommendations.push("Sesuaikan CV dengan kata kunci dari job description yang disediakan")
      } else if (exactMatchRate < 20) {
        issues.push(`Hanya ${matchedCount} dari ${totalKeywords} kata kunci job yang cocok (${Math.round(exactMatchRate)}%)`)
        recommendations.push("Tingkatkan penggunaan kata kunci yang relevan dengan job description")
      } else if (exactMatchRate < 40) {
        issues.push(`${matchedCount} dari ${totalKeywords} kata kunci job yang cocok (${Math.round(exactMatchRate)}% - kurang optimal)`)
        recommendations.push("Tambahkan lebih banyak kata kunci yang sesuai dengan requirement job")
      } else if (exactMatchRate < 60) {
        recommendations.push(`${matchedCount} dari ${totalKeywords} kata kunci cocok (${Math.round(exactMatchRate)}%) - tingkatkan untuk hasil optimal`)
      } else {
        recommendations.push(`Bagus! ${matchedCount} dari ${totalKeywords} kata kunci cocok (${Math.round(exactMatchRate)}%) dengan job description`)
      }
      
      // Specific technical skills feedback
      if (technicalTerms.length > 0) {
        const techMatches = technicalTerms.filter(term => 
          cvText.includes(term) || cvText.includes(term.replace(/[.-]/g, ''))
        )
        if (techMatches.length === 0) {
          issues.push("Technical skills yang diminta tidak terdeteksi dalam CV")
          recommendations.push(`Tambahkan technical skills seperti: ${technicalTerms.slice(0, 5).join(', ')}`)
        } else if (techMatches.length < technicalTerms.length * 0.5) {
          recommendations.push(`Pertimbangkan menambah skills: ${technicalTerms.filter(t => !techMatches.includes(t)).slice(0, 3).join(', ')}`)
        }
      }

      // Check for job title relevance
      if (jobTitle && !cvText.includes(jobTitle.split(' ')[0])) {
        issues.push(`Posisi "${jobName}" tidak terdeteksi atau kurang prominent dalam CV`)
        recommendations.push(`Pastikan CV menunjukkan relevansi yang jelas dengan posisi ${jobName}`)
        score = Math.max(0, score - 5) // Small penalty
      }
      
      // Add semantic similarity feedback
      if (semanticSimilarity > 0.4) {
        recommendations.push(`Tingkat kesesuaian konteks yang tinggi (${Math.round(semanticSimilarity * 100)}%) antara CV dan deskripsi pekerjaan`)
      } else if (semanticSimilarity < 0.1) {
        issues.push("Kurangnya kesesuaian konteks antara CV dan deskripsi pekerjaan")
        recommendations.push("Sesuaikan konten CV dengan konteks dan persyaratan pekerjaan")
      }
    }
  }

  let status: CVAnalysisResult["status"]
  if (score >= 80) status = "excellent"
  else if (score >= 60) status = "good"
  else if (score >= 30) status = "needs-improvement"
  else status = "poor"

  return {
    category: "Kata Kunci Sesuai Job",
    score: Math.max(0, Math.min(100, score)),
    status,
    issues,
    recommendations,
  }
}


// AI-powered keyword analysis function
async function analyzeKeywordsWithAI(cvText: string, jobDescription: string, jobName: string): Promise<{ score: number; issues: string[]; recommendations: string[] } | null> {
  try {
    // Import the AI analysis function
    const { geminiChat } = await import('./ai-analyzer');
    
    // Create a prompt for AI analysis with more detailed instructions
    const prompt = `
    Anda adalah seorang ahli ATS (Applicant Tracking System) dan recruiter profesional. 
    Analisis kesesuaian keyword antara CV kandidat dan persyaratan pekerjaan berikut:

    Nama Pekerjaan: ${jobName}
    
    Deskripsi Pekerjaan:
    ${jobDescription}
    
    CV Kandidat:
    ${cvText.substring(0, 15000)} // Limit text length for AI processing
    
    Tugas Anda:
    1. Analisis kesesuaian keyword antara CV dan deskripsi pekerjaan
    2. Identifikasi keyword penting dari deskripsi pekerjaan yang tidak ditemukan di CV
    3. Evaluasi penggunaan keyword teknis, action verbs, dan istilah industri
    4. Berikan skor kesesuaian keyword (0-100) dengan penjelasan detail
    5. Berikan 3 issue utama terkait keyword yang kurang sesuai
    6. Berikan 3 rekomendasi spesifik untuk meningkatkan kesesuaian keyword
    
    Format respons dalam JSON:
    {
      "score": 75,
      "issues": [
        "Issue 1: Penjelasan detail masalah keyword",
        "Issue 2: Penjelasan detail masalah keyword", 
        "Issue 3: Penjelasan detail masalah keyword"
      ],
      "recommendations": [
        "Rekomendasi 1: Solusi spesifik untuk perbaikan keyword",
        "Rekomendasi 2: Solusi spesifik untuk perbaikan keyword",
        "Rekomendasi 3: Solusi spesifik untuk perbaikan keyword"
      ]
    }
    
    Kriteria penilaian:
    - Skor 90-100: Sangat baik, hampir semua keyword penting sudah digunakan dengan tepat
    - Skor 70-89: Baik, beberapa keyword penting perlu ditambahkan
    - Skor 50-69: Cukup, banyak keyword penting yang perlu ditambahkan
    - Skor 30-49: Kurang, perlu penambahan keyword secara signifikan
    - Skor 0-29: Sangat kurang, perlu overhaul konten keyword
    
    Penting: 
    - Berikan hanya JSON response, tanpa tambahan teks
    - Pastikan semua array issues dan recommendations berisi tepat 3 item
    - Fokus pada keyword yang spesifik terhadap pekerjaan ini
    `;
    
    const aiResponse = await geminiChat(prompt);
    
    // Parse AI response
    try {
      // Clean the response by removing markdown code blocks if present
      let cleanedText = aiResponse.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\s*/, '').replace(/\s*```$/, '');
      }
      
      const aiResult = JSON.parse(cleanedText);
      
      // Validate the structure
      if (typeof aiResult.score === 'number' && 
          Array.isArray(aiResult.issues) && 
          Array.isArray(aiResult.recommendations) &&
          aiResult.issues.length === 3 &&
          aiResult.recommendations.length === 3) {
        return {
          score: Math.max(0, Math.min(100, aiResult.score)),
          issues: aiResult.issues,
          recommendations: aiResult.recommendations
        };
      } else {
        // If structure is not exactly as expected, try to adapt
        return {
          score: Math.max(0, Math.min(100, typeof aiResult.score === 'number' ? aiResult.score : 50)),
          issues: Array.isArray(aiResult.issues) ? aiResult.issues.slice(0, 3) : ["Tidak dapat menganalisis issues keyword dengan tepat"],
          recommendations: Array.isArray(aiResult.recommendations) ? aiResult.recommendations.slice(0, 3) : ["Tidak dapat menganalisis rekomendasi keyword dengan tepat"]
        };
      }
    } catch (parseError) {
      console.warn("Failed to parse AI keyword analysis response:", parseError);
      console.warn("Raw AI response:", aiResponse);
    }
    
    return null;
  } catch (error) {
    console.warn("AI keyword analysis failed:", error);
    return null;
  }
}

// Analyze scoring with enhanced comparison
export function analyzeScoring(parsedCV: ParsedCV): CVAnalysisResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100

  const text = parsedCV.text.toLowerCase()

  // Check if document is likely a certificate
  const isCertificate = isLikelyCertificate(parsedCV.text)
  
  if (isCertificate) {
    // Different scoring approach for certificates
    issues.push("Dokumen yang diunggah tampaknya adalah sertifikat, bukan CV")
    recommendations.push("Silakan unggah CV Anda untuk analisis yang tepat")
    score -= 40 // Significant penalty for wrong document type
    // Return early for certificates
    let status: CVAnalysisResult["status"]
    if (score >= 85) status = "excellent"
    else if (score >= 70) status = "good"
    else if (score >= 50) status = "needs-improvement"
    else status = "poor"

    return {
      category: "Scoring & Ranking",
      score: Math.max(0, score),
      status,
      issues,
      recommendations,
    }
  }

  // Check CV length
  if (parsedCV.metadata.wordCount < 200) {
    issues.push("CV appears too short for comprehensive evaluation")
    recommendations.push("Expand experience descriptions with more detail")
    score -= 25
  } else if (parsedCV.metadata.wordCount > 800) {
    issues.push("CV may be too lengthy for ATS processing")
    recommendations.push("Condense content to 1-2 pages for better ATS compatibility")
    score -= 15
  }

  // Check for employment gaps explanation
  const hasDateRanges = /\d{4}[-–]\d{4}|\d{4}[-–]present/i.test(text)
  if (!hasDateRanges) {
    issues.push("Employment dates not clearly formatted")
    recommendations.push("Include clear date ranges (e.g., 2020-2023) for all positions")
    score -= 20
  }

  // Check for skills section
  if (!parsedCV.sections.skills) {
    issues.push("Skills section not clearly identified")
    recommendations.push("Include dedicated 'Skills' section with relevant competencies")
    score -= 15
  }

  // Enhanced check for professional summary/profile
  if (!parsedCV.sections.summary) {
    // Additional check for summary-like content at the beginning
    const firstLines = parsedCV.text.split('\n').slice(0, 15).join(' ').toLowerCase();
    const summaryIndicators = [
      'professional', 'karir', 'career', 'pengalaman', 'experience', 
      'kompetensi', 'kompeten', 'skilled', 'skil', 'ability', 'kemampuan',
      'profesional', 'berpengalaman', 'experienced', 'dedicated', 'berdedikasi',
      'saya seorang', 'saya adalah', 'saya memiliki', 'minat dalam', 'tertarik dalam'
    ];
    
    const hasSummaryContent = summaryIndicators.some(indicator => firstLines.includes(indicator)) && 
                             firstLines.length > 50 &&
                             !firstLines.includes('certificate') &&
                             !firstLines.includes('sertifikat') &&
                             !firstLines.includes('certification') &&
                             !firstLines.includes('penghargaan') &&
                             !firstLines.includes('award') &&
                             !firstLines.includes('diterbitkan oleh') &&
                             !firstLines.includes('issued by') &&
                             !firstLines.includes('tanggal diterbitkan') &&
                             !firstLines.includes('issue date');
    
    if (!hasSummaryContent) {
      issues.push("Professional summary or objective missing")
      recommendations.push("Add brief professional summary at the top of your CV highlighting your background, key skills, and career goals")
      score -= 15
    }
  } else {
    // Check quality of existing summary
    const summaryText = parsedCV.sections.summary;
    if (summaryText.length < 50) {
      issues.push("Professional summary is too brief")
      recommendations.push("Expand your professional summary to include 2-3 sentences about your background, key skills, and career objectives")
      score -= 10
    }
    
    // Check for generic phrases
    const genericPhrases = [
      'hard worker', 'team player', 'kerja keras', 'pekerja tim',
      'saya seorang pekerja keras', 'saya adalah pekerja tim'
    ];
    const hasGenericContent = genericPhrases.some(phrase => 
      summaryText.toLowerCase().includes(phrase.toLowerCase()));
      
    if (hasGenericContent) {
      issues.push("Professional summary contains generic phrases")
      recommendations.push("Replace generic phrases with specific achievements and quantifiable skills")
      score -= 5
    }
    
    // Check for specific, high-quality content
    const specificIndicators = [
      'tahun pengalaman', 'years experience', 'berpengalaman',
      'mencapai', 'achieved', 'berhasil', 'successfully',
      'meningkatkan', 'increased', 'improved', 'enhanced',
      'menguasai', 'proficient', 'skilled', 'expert'
    ];
    
    const hasSpecificContent = specificIndicators.some(indicator => 
      summaryText.toLowerCase().includes(indicator.toLowerCase()));
      
    if (!hasSpecificContent) {
      issues.push("Professional summary lacks specific achievements or skills")
      recommendations.push("Include specific achievements, skills, or quantifiable results in your summary")
      score -= 5
    }
  }

  let status: CVAnalysisResult["status"]
  if (score >= 85) status = "excellent"
  else if (score >= 70) status = "good"
  else if (score >= 50) status = "needs-improvement"
  else status = "poor"

  return {
    category: "Scoring & Ranking",
    score: Math.max(0, score),
    status,
    issues,
    recommendations,
  }
}

// Analyze format and readability
export function analyzeFormat(parsedCV: ParsedCV): CVAnalysisResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100

  const text = parsedCV.text

  // Check for consistent formatting indicators
  const hasBulletPoints = /[•·▪▫◦‣⁃]/.test(text) || /^\s*[\-\*\+]\s/m.test(text)
  if (!hasBulletPoints) {
    issues.push("Limited use of bullet points detected")
    recommendations.push("Use bullet points to organize information clearly")
    score -= 15
  }

  // Check for proper capitalization
  const hasProperCapitalization = /^[A-Z]/.test(text.trim())
  if (!hasProperCapitalization) {
    issues.push("Inconsistent capitalization detected")
    recommendations.push("Ensure proper capitalization throughout the document")
    score -= 10
  }

  // Check for special characters that might cause parsing issues
  const hasProblematicChars = /[^\x00-\x7F]/.test(text)
  if (hasProblematicChars) {
    issues.push("Special characters detected that may cause parsing issues")
    recommendations.push("Use standard ASCII characters to ensure compatibility")
    score -= 15
  }

  // Check line length and structure
  const lines = text.split("\n")
  const longLines = lines.filter((line) => line.length > 100).length
  if (longLines > lines.length * 0.3) {
    issues.push("Many lines appear too long for optimal readability")
    recommendations.push("Break long sentences into shorter, more readable lines")
    score -= 10
  }

  // Check for consistent spacing
  const hasConsistentSpacing = !/\s{3,}/.test(text)
  if (!hasConsistentSpacing) {
    issues.push("Inconsistent spacing detected")
    recommendations.push("Use consistent spacing throughout the document")
    score -= 10
  }

  let status: CVAnalysisResult["status"]
  if (score >= 85) status = "excellent"
  else if (score >= 70) status = "good"
  else if (score >= 50) status = "needs-improvement"
  else status = "poor"

  return {
    category: "Format & Readability",
    score: Math.max(0, score),
    status,
    issues,
    recommendations,
  }
}

// Main analysis function with AI-based evaluation
import { calculateComprehensiveScore, detectIndustry, generateRankingInsights } from "./scoring-system"
import { analyzeWithAIAndScore, AIAnalysisResult } from "./ai-analyzer"

// Import the AI completeness analyzer
import { analyzeCVCompletenessWithAI, AICompletenessResult } from "./ai-completeness-analyzer";

// Function to convert AI completeness result to CVAnalysisResult format
function convertAICompletenessToCVResult(aiResult: AICompletenessResult): CVAnalysisResult {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Add missing elements as issues
  issues.push(...aiResult.missingElements);

  // Add spelling issues if they're significant
  if (!aiResult.spellingIssues.some(issue => issue.includes("Tidak ditemukan"))) {
    issues.push(...aiResult.spellingIssues);
  }

  // Add grammar issues if they're significant
  if (!aiResult.grammarIssues.some(issue => issue.includes("Tidak ditemukan"))) {
    issues.push(...aiResult.grammarIssues);
  }

  // Add recommendations
  recommendations.push(...aiResult.recommendations);

  // Determine status based on completeness score
  let status: CVAnalysisResult["status"];
  if (aiResult.completenessScore >= 85) status = "excellent";
  else if (aiResult.completenessScore >= 70) status = "good";
  else if (aiResult.completenessScore >= 50) status = "needs-improvement";
  else status = "poor";

  return {
    category: "Kelengkapan CV",
    score: aiResult.completenessScore,
    status,
    issues,
    recommendations,
  };
}

// Enhanced CV completeness analysis using AI
export async function analyzeCVCompletenessWithAIWrapper(parsedCV: ParsedCV): Promise<CVAnalysisResult> {
  try {
    // Use the AI completeness analyzer
    const aiResult = await analyzeCVCompletenessWithAI(parsedCV.text);
    return convertAICompletenessToCVResult(aiResult);
  } catch (error) {
    console.warn("AI completeness analysis failed, falling back to rule-based analysis:", error);
    // Fallback to the existing rule-based analysis
    return analyzeCVCompleteness(parsedCV);
  }
}

// Main analysis function with AI-based evaluation (supports PDF input)
export async function analyzeCV(text: string, jobName: string = '', jobDescription: string = ''): Promise<{
  parsedCV: ParsedCV
  results: CVAnalysisResult[]
  overallScore: number
  comprehensiveScore: any
  industry: string
  rankingInsights: string[]
  aiAnalysis?: AIAnalysisResult
  isAIEnhanced: boolean
}> {
  const parsedCV = parseCV(text)

  // Try to get AI-enhanced analysis first
  let aiAnalysis: AIAnalysisResult | undefined
  let isAIEnhanced = false
  let results: CVAnalysisResult[] = []

  try {
    console.log("[CV Analyzer] Using traditional rule-based evaluation")
    
    // Use traditional rule-based evaluation for most sections
    const quantitativeResult = analyzeQuantitativeImpact(parsedCV, jobDescription, jobName)
    const lengthResult = analyzeCVLength(parsedCV)
    
    // Use AI-powered keyword analysis
    const jobKeywordsResult = await analyzeJobKeywords(parsedCV, jobDescription, jobName)
    
    // Use AI-powered completeness analysis
    const completenessResult = await analyzeCVCompletenessWithAIWrapper(parsedCV)
    
    results = [
      quantitativeResult,
      lengthResult,
      completenessResult,
      jobKeywordsResult,
    ]
    
    console.log("[CV Analyzer] Traditional analysis successful")
    
    // Try to get AI analysis for insights (client-side only)
    try {
      const aiResult = await analyzeWithAIAndScore(text)
      aiAnalysis = aiResult.aiAnalysis
      isAIEnhanced = true
    } catch (aiError) {
      console.log("AI insights not available on server-side, using traditional analysis only")
    }
    
  } catch (error) {
    console.warn("[CV Analyzer] Analysis error:", error)
    
    // Fallback to basic traditional evaluation
    results = [
      analyzeQuantitativeImpact(parsedCV, jobDescription, jobName),
      analyzeCVLength(parsedCV),
      analyzeCVCompleteness(parsedCV),
      await analyzeJobKeywords(parsedCV, jobDescription, jobName),
    ]
  }

  const overallScore = Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length)

  // Enhanced scoring system based on 4 criteria
  const categoryScores = {
    parsing: results.length >= 3 ? results[2].score : 75, // completeness
    keywords: results.length >= 4 ? results[3].score : 70, // job keywords
    content: results.length >= 2 ? (results[0].score + results[1].score) / 2 : 70, // quantitative + length
    format: results.length >= 3 ? results[2].score : 75 // completeness fallback
  }

  // Use AI-detected industry if available
  const industry = aiAnalysis?.industryDetected || 'general'
  
  return {
    parsedCV,
    results,
    overallScore,
    comprehensiveScore: null, // Removed comprehensive scoring
    industry,
    rankingInsights: [], // Removed ranking insights
    aiAnalysis,
    isAIEnhanced,
  }
}
