# OCR Implementation for Image-Based PDFs in CV ATS Checker

## Problem Statement

The CV ATS Checker application was unable to process image-based PDF files (scanned documents) because the standard PDF text extraction library ([pdf-parse](file://c:/laragon/www/MiniProjectATS/Mini-Project-Ats-Checker/node_modules/.pnpm/pdf-parse@1.1.1/node_modules/pdf-parse/lib/pdf-parse.js)) can only extract text from text-based PDFs, not from images embedded in PDFs.

## Solution Overview

We implemented OCR (Optical Character Recognition) capability to extract text from image-based PDFs using the following libraries:

1. **Tesseract.js** - For OCR processing
2. **pdfjs-dist** - For PDF parsing and page rendering
3. **canvas** - For server-side image rendering

## Implementation Details

### 1. Dependencies Added

We added the following dependencies to the project:

```bash
pnpm add tesseract.js pdfjs-dist canvas
```

### 2. Updated Next.js Configuration

We updated [next.config.mjs](file://c:/laragon/www/MiniProjectATS/Mini-Project-Ats-Checker/next.config.mjs) to include the new external packages:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist', 'canvas', 'tesseract.js'],
}

export default nextConfig
```

### 3. Enhanced PDF Processing Function

We created an enhanced PDF processing function that:

1. First attempts standard text extraction using [pdf-parse](file://c:/laragon/www/MiniProjectATS/Mini-Project-Ats-Checker/node_modules/.pnpm/pdf-parse@1.1.1/node_modules/pdf-parse/lib/pdf-parse.js)
2. Falls back to OCR if no text is extracted
3. Handles errors gracefully

```typescript
// Enhanced PDF text extraction with fallback to OCR
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  console.log("[PDF Processing] Starting PDF text extraction");
  
  try {
    // First, try standard PDF parsing
    console.log("[PDF Processing] Attempting standard PDF parsing...");
    const pdfParse = (await import('pdf-parse')).default;
    
    const pdfData = await pdfParse(buffer);
    const extractedText = pdfData.text || "";
    
    console.log("[PDF Processing] Standard extraction completed. Text length:", extractedText.length);
    
    // If we got text, return it
    if (extractedText.trim().length > 0) {
      console.log("[PDF Processing] Standard extraction successful");
      return extractedText;
    }
    
    // If no text was extracted, try OCR
    console.log("[PDF Processing] No text extracted, falling back to OCR");
    return await extractTextFromImagePDF(buffer);
  } catch (error) {
    console.error("[PDF Processing] Standard extraction failed:", error);
    
    // If standard extraction fails, try OCR as fallback
    try {
      console.log("[PDF Processing] Attempting OCR fallback");
      return await extractTextFromImagePDF(buffer);
    } catch (ocrError) {
      console.error("[PDF Processing] OCR fallback also failed:", ocrError);
      throw new Error(`PDF processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
```

### 4. OCR Implementation for Image-Based PDFs

We implemented a function to perform OCR on image-based PDFs:

```typescript
// Add OCR function for image-based PDFs
async function extractTextFromImagePDF(pdfBuffer: Buffer): Promise<string> {
  console.log("[PDF OCR] Starting OCR processing for image-based PDF");
  
  try {
    // For server-side OCR, we'll convert PDF pages to images and use Tesseract.js
    console.log("[PDF OCR] Loading pdfjs-dist...");
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set up worker
    console.log("[PDF OCR] Setting up PDF.js worker...");
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';
    
    // Load PDF document
    console.log("[PDF OCR] Loading PDF document...");
    const pdfDoc = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
    console.log(`[PDF OCR] PDF loaded with ${pdfDoc.numPages} pages`);
    
    let fullText = '';
    
    // Process each page
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      console.log(`[PDF OCR] Processing page ${pageNum}`);
      
      try {
        // Get page
        const page = await pdfDoc.getPage(pageNum);
        
        // Get viewport at scale 2 (for better OCR quality)
        const viewport = page.getViewport({ scale: 2 });
        
        // Create canvas and context using node-canvas
        console.log(`[PDF OCR] Creating canvas for page ${pageNum}...`);
        const { createCanvas } = await import('canvas');
        const canvas = createCanvas(viewport.width, viewport.height);
        const context: any = canvas.getContext('2d');
        
        // Render page to canvas
        console.log(`[PDF OCR] Rendering page ${pageNum} to canvas...`);
        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: null // Set to null to use canvasContext instead
        }).promise;
        
        // Convert canvas to image buffer
        console.log(`[PDF OCR] Converting canvas to image buffer for page ${pageNum}...`);
        const imageBuffer = canvas.toBuffer('image/png');
        
        // Perform OCR using Tesseract.js
        console.log(`[PDF OCR] Performing OCR on page ${pageNum}...`);
        const worker = await createWorker('eng');
        const ret = await worker.recognize(imageBuffer);
        await worker.terminate();
        
        fullText += ret.data.text + '\n\n';
        console.log(`[PDF OCR] Page ${pageNum} processed, extracted ${ret.data.text.length} characters`);
      } catch (pageError) {
        console.error(`[PDF OCR] Error processing page ${pageNum}:`, pageError);
        // Continue with other pages even if one fails
      }
    }
    
    console.log(`[PDF OCR] OCR completed, total extracted text length: ${fullText.length}`);
    return fullText;
  } catch (error) {
    console.error("[PDF OCR] Error in OCR processing:", error);
    throw new Error(`OCR failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

### 5. Integration with Existing Code

We updated the PDF processing section in [app/api/analyze-cv/route.ts](file://c:/laragon/www/MiniProjectATS/Mini-Project-Ats-Checker/app/api/analyze-cv/route.ts) to use our enhanced extraction function:

```typescript
} else if (file.type === "application/pdf") {
  // Parse PDF file using our enhanced extraction function
  try {
    console.log("[PDF Processing] Starting PDF parsing...");
    const rawText = await extractTextFromPDF(originalFileBuffer);
    extractedText = preserveBulletPoints(rawText);
    
    console.log('[PDF Processing] Raw text length:', rawText.length);
    console.log('[PDF Processing] Processed text length:', extractedText.length);
    console.log('[PDF Processing] Sample processed text:', extractedText.substring(0, 500) + '...');
  } catch (pdfError) {
    console.error("[PDF Processing] PDF parsing failed:", pdfError);
    throw new Error(`Failed to extract text from PDF: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}`);
  }
}
```

## How It Works

1. **Standard PDF Processing**: When a PDF is uploaded, the system first attempts to extract text using the standard [pdf-parse](file://c:/laragon/www/MiniProjectATS/Mini-Project-Ats-Checker/node_modules/.pnpm/pdf-parse@1.1.1/node_modules/pdf-parse/lib/pdf-parse.js) library.

2. **OCR Fallback**: If no text is extracted (indicating an image-based PDF), the system automatically falls back to OCR processing:
   - The PDF is loaded using pdf.js
   - Each page is rendered to a canvas image
   - Tesseract.js performs OCR on each page image
   - The extracted text from all pages is combined

3. **Bullet Point Preservation**: The extracted text is processed through the existing [preserveBulletPoints](file://c:/laragon/www/MiniProjectATS/Mini-Project-Ats-Checker/app/api/analyze-cv/route.ts#L35-L127) function to maintain proper formatting.

## Benefits

1. **Improved Compatibility**: The system can now process both text-based and image-based PDFs
2. **Automatic Detection**: No user intervention required - the system automatically detects when OCR is needed
3. **Graceful Fallback**: If standard extraction fails, OCR is automatically attempted
4. **Maintained Functionality**: All existing features (bullet point preservation, AI analysis, etc.) continue to work with OCR-extracted text

## Testing

To test the OCR functionality:

1. Create a PDF with images containing text (scanned document)
2. Upload it to the CV ATS Checker
3. The system will automatically use OCR to extract the text
4. The extracted text will be processed through the same analysis pipeline as text-based PDFs

## Error Handling

The implementation includes comprehensive error handling:

- If standard PDF parsing fails, OCR is attempted
- If OCR fails, detailed error messages are provided
- Individual page processing failures don't stop the entire process
- All errors are logged for debugging purposes

## Performance Considerations

- OCR processing is more resource-intensive than standard text extraction
- Processing time depends on the number of pages and image complexity
- The system provides progress logging to monitor OCR processing
- OCR is only used when necessary (fallback mechanism)

## Future Improvements

1. **Multi-language Support**: Add support for languages other than English
2. **Performance Optimization**: Implement caching for OCR results
3. **Quality Improvements**: Fine-tune OCR parameters for better accuracy
4. **Progress Reporting**: Add real-time progress updates for long OCR processes