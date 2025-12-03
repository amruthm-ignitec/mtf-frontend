/**
 * Utility functions for working with documents
 */

export interface Document {
  id: number;
  document_type?: string;
  created_at?: string;
  updated_at?: string;
  azure_blob_url?: string;
  filename?: string;
  original_filename?: string;
}

/**
 * Get document name from documents array by documentId
 * Priority: original_filename > filename > null
 * 
 * @param documents - Array of document objects
 * @param documentId - ID of the document to find
 * @returns Document name or null if not found
 */
export function getDocumentName(
  documents: Document[],
  documentId?: number
): string | null {
  if (!documentId || !documents || documents.length === 0) {
    return null;
  }

  const document = documents.find(doc => doc.id === documentId);
  
  if (!document) {
    return null;
  }

  // Priority: original_filename > filename
  return document.original_filename || document.filename || null;
}

