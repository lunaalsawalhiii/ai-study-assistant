export interface ProcessedDocument {
  text: string;
  pageCount: number;
  success: boolean;
  error?: string;
  usedOCR?: boolean;
}

/**
 * LEGACY DOCUMENT PROCESSOR (DISABLED)
 *
 * The app now uses Supabase OCR Edge Functions.
 * This file exists ONLY to avoid crashes from old imports.
 * It must NEVER throw errors or show popups.
 */
export async function processDocument(): Promise<ProcessedDocument> {
  return {
    text: '',
    pageCount: 0,
    success: true,
    usedOCR: false,
  };
}
