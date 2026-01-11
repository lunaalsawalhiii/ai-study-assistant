import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import * as mammoth from 'mammoth';

// Disable worker to avoid compatibility issues in bundled environments
// This uses the legacy synchronous mode which is more reliable
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

export interface ProcessedDocument {
  text: string;
  pageCount: number;
  success: boolean;
  error?: string;
  usedOCR?: boolean; // Indicates if OCR was used
}

/**
 * Extract text from a PDF using OCR (for scanned/image-based PDFs)
 */
async function extractTextWithOCR(file: File): Promise<ProcessedDocument> {
  try {
    console.log('Starting OCR extraction for scanned PDF...');
    const worker = await createWorker('eng');
    
    // Convert PDF to canvas and extract text
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });
    
    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;
    let fullText = '';

    // Process each page with OCR
    for (let pageNum = 1; pageNum <= Math.min(pageCount, 10); pageNum++) { // Limit to 10 pages for performance
      const page = await pdf.getPage(pageNum);
      
      // Render page to canvas
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR accuracy
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        continue;
      }
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
      
      // Run OCR on the canvas
      const { data: { text } } = await worker.recognize(canvas);
      fullText += text + '\n\n';
    }

    await worker.terminate();
    
    return {
      text: fullText.trim(),
      pageCount,
      success: true,
      usedOCR: true,
    };
  } catch (error) {
    console.error('OCR extraction error:', error);
    return {
      text: '',
      pageCount: 0,
      success: false,
      error: 'Failed to extract text using OCR. The document may be corrupted or in an unsupported format.',
      usedOCR: true,
    };
  }
}

/**
 * Extract text from a PDF file
 */
export async function extractTextFromPDF(file: File): Promise<ProcessedDocument> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Use standard build without worker for better compatibility
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });
    
    const pdf = await loadingTask.promise;
    
    const pageCount = pdf.numPages;
    let fullText = '';

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    // Check if we extracted meaningful text
    const hasText = fullText.trim().length > 50; // At least 50 characters
    
    if (!hasText) {
      // PDF appears to be scanned or image-based - try OCR
      console.log('No selectable text found. Attempting OCR...');
      return await extractTextWithOCR(file);
    }

    return {
      text: fullText.trim(),
      pageCount,
      success: true,
      usedOCR: false,
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    
    // If standard extraction fails, try OCR as fallback
    console.log('Standard PDF extraction failed. Attempting OCR...');
    return await extractTextWithOCR(file);
  }
}

/**
 * Extract text from a plain text file
 */
export async function extractTextFromTextFile(file: File): Promise<ProcessedDocument> {
  try {
    const text = await file.text();
    return {
      text: text.trim(),
      pageCount: 1,
      success: true,
    };
  } catch (error) {
    console.error('Text file extraction error:', error);
    return {
      text: '',
      pageCount: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read text file',
    };
  }
}

/**
 * Extract text from a Word document file
 */
export async function extractTextFromWordFile(file: File): Promise<ProcessedDocument> {
  try {
    const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
    return {
      text: result.value.trim(),
      pageCount: 1,
      success: true,
    };
  } catch (error) {
    console.error('Word file extraction error:', error);
    return {
      text: '',
      pageCount: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read Word file',
    };
  }
}

/**
 * Process a document file and extract its text content
 */
export async function processDocument(file: File): Promise<ProcessedDocument> {
  if (file.type === 'application/pdf') {
    return extractTextFromPDF(file);
  } else if (file.type === 'text/plain') {
    return extractTextFromTextFile(file);
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractTextFromWordFile(file);
  } else {
    return {
      text: '',
      pageCount: 0,
      success: false,
      error: 'Unsupported file type. Only PDF, TXT, and DOCX files are supported.',
    };
  }
}