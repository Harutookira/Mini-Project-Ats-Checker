"use client"

import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FileQuestion, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PDFErrorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
}

export function PDFErrorDialog({ open, onOpenChange, title, message }: PDFErrorDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md border-yellow-500 bg-yellow-50">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-yellow-700">
            <div className="p-2 bg-yellow-100 rounded-full">
              <FileQuestion className="h-6 w-6 text-yellow-600" />
            </div>
            <span>{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-line text-foreground pl-2">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Tip:</strong> For best results, ensure your PDF contains selectable text, not just images.
              </p>
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction 
            onClick={() => onOpenChange(false)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            OK, I Understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}