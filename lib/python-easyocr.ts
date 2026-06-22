import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * Extract text from PDF using Python EasyOCR
 * This function requires Python and EasyOCR to be installed on the system
 * 
 * To install Python and EasyOCR:
 * 1. Install Python from https://www.python.org/downloads/
 * 2. Install EasyOCR: pip install easyocr
 * 
 * @param pdfBuffer - The PDF file buffer
 * @returns Promise<string> - Extracted text from the PDF
 */
export async function extractTextFromPDFWithEasyOCR(pdfBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if Python is available
    const pythonCheck = spawn('python', ['--version']);
    
    pythonCheck.on('error', () => {
      reject(new Error('Python is not installed or not available in PATH. Please install Python to use EasyOCR.'));
    });
    
    pythonCheck.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error('Python is not installed or not available in PATH. Please install Python to use EasyOCR.'));
        return;
      }
      
      // Create a temporary PDF file
      const tempDir = tmpdir();
      const tempPdfPath = join(tempDir, `temp-pdf-${Date.now()}.pdf`);
      const tempScriptPath = join(tempDir, `easyocr-script-${Date.now()}.py`);
      
      try {
        // Write PDF buffer to temporary file
        writeFileSync(tempPdfPath, pdfBuffer);
        
        // Create Python script for EasyOCR
        const pythonScript = `
import easyocr
import sys
import json
from pdf2image import convert_from_path

try:
    # Convert PDF to images
    pages = convert_from_path('${tempPdfPath.replace(/\\/g, '\\\\')}', 300)
    
    # Initialize EasyOCR reader
    reader = easyocr.Reader(['en'])
    
    full_text = ""
    
    # Process each page
    for i, page in enumerate(pages):
        # Save page as temporary image
        temp_image_path = '${tempDir.replace(/\\/g, '\\\\')}\\\\temp-page-' + str(i) + '.png'
        page.save(temp_image_path, 'PNG')
        
        # Perform OCR
        result = reader.readtext(temp_image_path)
        
        # Extract text from results
        page_text = ' '.join([item[1] for item in result])
        full_text += page_text + '\\n\\n'
        
        # Remove temporary image
        import os
        os.remove(temp_image_path)
    
    # Output the result
    print(json.dumps({"success": True, "text": full_text}))
    
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
`;
        
        // Write Python script to temporary file
        writeFileSync(tempScriptPath, pythonScript);
        
        // Execute Python script
        const pythonProcess = spawn('python', [tempScriptPath]);
        
        let stdout = '';
        let stderr = '';
        
        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        pythonProcess.on('close', (code) => {
          // Clean up temporary files
          try {
            unlinkSync(tempPdfPath);
            unlinkSync(tempScriptPath);
          } catch (cleanupError) {
            console.warn('[EasyOCR] Warning: Failed to clean up temporary files:', cleanupError);
          }
          
          if (code !== 0) {
            reject(new Error(`Python script failed with exit code ${code}. stderr: ${stderr}`));
            return;
          }
          
          try {
            // Parse the JSON output from Python
            const output = JSON.parse(stdout.trim());
            
            if (output.success) {
              resolve(output.text);
            } else {
              reject(new Error(`EasyOCR failed: ${output.error}`));
            }
          } catch (parseError) {
            reject(new Error(`Failed to parse Python output: ${stdout}. Error: ${parseError}`));
          }
        });
        
        pythonProcess.on('error', (error) => {
          // Clean up temporary files
          try {
            unlinkSync(tempPdfPath);
            unlinkSync(tempScriptPath);
          } catch (cleanupError) {
            console.warn('[EasyOCR] Warning: Failed to clean up temporary files:', cleanupError);
          }
          
          reject(new Error(`Failed to start Python process: ${error.message}`));
        });
      } catch (error) {
        // Clean up temporary files if they exist
        try {
          if (existsSync(tempPdfPath)) unlinkSync(tempPdfPath);
          if (existsSync(tempScriptPath)) unlinkSync(tempScriptPath);
        } catch (cleanupError) {
          console.warn('[EasyOCR] Warning: Failed to clean up temporary files:', cleanupError);
        }
        
        reject(new Error(`Failed to create temporary files: ${error instanceof Error ? error.message : String(error)}`));
      }
    });
  });
}

/**
 * Check if Python and EasyOCR are available
 * @returns Promise<boolean> - True if Python and EasyOCR are available, false otherwise
 */
export async function isEasyOCRAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if Python is available
    const pythonCheck = spawn('python', ['--version']);
    
    pythonCheck.on('error', () => {
      resolve(false);
    });
    
    pythonCheck.on('exit', (code) => {
      if (code !== 0) {
        resolve(false);
        return;
      }
      
      // Check if EasyOCR is available
      const easyocrCheck = spawn('python', ['-c', 'import easyocr; print("EasyOCR available")']);
      
      easyocrCheck.on('error', () => {
        resolve(false);
      });
      
      easyocrCheck.on('exit', (code) => {
        resolve(code === 0);
      });
    });
  });
}