import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "ATS CV Checker - Optimize Your Resume for Applicant Tracking Systems",
  description: "AI-powered ATS compatibility checker for resumes and CVs. Get detailed analysis and recommendations to improve your chances of passing automated resume screening. Free resume optimization tool.",
  keywords: "ATS checker, resume optimizer, CV analyzer, applicant tracking system, resume scanner, job application, career tool, hiring process, recruitment, job search",
  authors: [{ name: "CNT Recruitment Team" }],
  creator: "CNT",
  publisher: "CNT",
  generator: "v0.app",
  applicationName: "ATS CV Checker",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  alternates: {
    canonical: "https://ats-checker.cnt-recruitment.com"
  },
  openGraph: {
    title: "ATS CV Checker - Optimize Your Resume for Applicant Tracking Systems",
    description: "AI-powered ATS compatibility checker for resumes and CVs. Get detailed analysis and recommendations to improve your chances of passing automated resume screening.",
    url: "https://ats-checker.cnt-recruitment.com",
    siteName: "ATS CV Checker",
    images: [
      {
        url: "https://ats-checker.cnt-recruitment.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "ATS CV Checker - Optimize Your Resume"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ATS CV Checker - Optimize Your Resume for Applicant Tracking Systems",
    description: "AI-powered ATS compatibility checker for resumes and CVs. Get detailed analysis and recommendations to improve your chances of passing automated resume screening.",
    creator: "@cntrecruitment",
    images: ["https://ats-checker.cnt-recruitment.com/twitter-image.png"],
  },
  verification: {
    google: "your-google-verification-code",
  },
  other: {
    "google-site-verification": "your-google-verification-code"
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <script src="https://js.puter.com/v2/" async></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "ATS CV Checker",
              "url": "https://ats-checker.cnt-recruitment.com",
              "description": "AI-powered ATS compatibility checker for resumes and CVs. Get detailed analysis and recommendations to improve your chances of passing automated resume screening.",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "ATS Compatibility Analysis",
                "Resume Optimization",
                "Keyword Matching",
                "Formatting Check",
                "AI-Powered Recommendations"
              ]
            })
          }}
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}