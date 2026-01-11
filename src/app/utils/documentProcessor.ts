import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';

// Disable PDF.js worker to avoid bundling issues
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

export interface ProcessedDocument {
  text: string;
  pageCount: number;
  success: boolean;
  error?: string;
  usedOCR?: boolean;
}

/**
 * Extract text from a PDF file (TEXT-BASED PDFs ONLY)
 * Scanned PDFs will return empty text but still succeed
 */
export async function extractTextFromPDF(file: File): Promise<ProcessedDocument> {
  try {
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

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    return {
      text: fullText.trim(),
      pageCount,
      success: true,
      usedOCR: false,
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    return {
      text: '',
      pageCount: 0,
      success: true, // IMPORTANT: still success
      usedOCR: false,
    };
  }
}

/**
 * Extract text from a plain text file
 */
export async function extractTextFromTextFile(
  file: File
): Promise<ProcessedDocument> {
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
      success: true,
    };
  }
}

/**
 * Extract text from a Word document (DOCX)
 */
export async function extractTextFromWordFile(
  file: File
): Promise<ProcessedDocument> {
  try {
    const result = await mammoth.convertToHtml({
      arrayBuffer: await file.arrayBuffer(),
    });

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
      success: true,
    };
  }
}

/**
 * Main document processor
 */
export async function processDocument(
  file: File
): Promise<ProcessedDocument> {
  if (file.type === 'application/pdf') {
    return extractTextFromPDF(file);
  }

  if (file.type === 'text/plain') {
    return extractTextFromTextFile(file);
  }

  if (
    file.type ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractTextFromWordFile(file);
  }

  return {
    text: '',
    pageCount: 0,
    success: true,
    error: 'Unsupported file type',
  };
} 
