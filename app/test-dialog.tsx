"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PDFErrorDialog } from "@/components/pdf-error-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"

export default function TestDialogPage() {
  const [isPDFDialogOpen, setIsPDFDialogOpen] = useState(false)
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)

  const pdfErrorMessage = "Unable to extract text from the uploaded file. This could be due to:\n\n" +
    "1. The file is a scanned image PDF without selectable text\n" +
    "2. The file is password-protected\n" +
    "3. The file is corrupted or in an unsupported format\n\n" +
    "Please try:\n" +
    "- Converting your CV to a text-based PDF or DOCX format\n" +
    "- Using a different PDF file\n" +
    "- Converting your CV to plain text (.txt) format"

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-6">Dialog Test Page</h1>
        <p className="text-muted-foreground mb-8">
          Test the custom error dialogs for the ATS CV Checker application
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Button 
            onClick={() => setIsPDFDialogOpen(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white h-16"
          >
            Show PDF Error Dialog
          </Button>
          
          <Button 
            onClick={() => setIsErrorDialogOpen(true)}
            variant="destructive"
            className="h-16"
          >
            Show Standard Error Dialog
          </Button>
        </div>
        
        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
          <ul className="text-left space-y-2 text-muted-foreground">
            <li>1. Click "Show PDF Error Dialog" to see the specialized dialog for non-text-based PDFs</li>
            <li>2. Click "Show Standard Error Dialog" to see the general error dialog</li>
            <li>3. Verify that both dialogs display correctly with appropriate styling</li>
          </ul>
        </div>
      </div>
      
      {/* PDF Error Dialog */}
      <PDFErrorDialog 
        open={isPDFDialogOpen} 
        onOpenChange={setIsPDFDialogOpen} 
        title="Non-Text Based PDF Detected" 
        message={pdfErrorMessage} 
      />
      
      {/* Standard Error Dialog */}
      <AlertDialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              General Error
            </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line text-foreground">
              This is a standard error message for issues not related to PDF text extraction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsErrorDialogOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}