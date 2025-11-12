import React from 'react';
import { X } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  pageNumber?: number;
  onClose: () => void;
  documentName?: string;
}

export default function PDFViewer({
  pdfUrl,
  pageNumber,
  onClose,
  documentName,
}: PDFViewerProps) {
  // Construct PDF URL with page parameter if available
  const pdfUrlWithPage = pageNumber
    ? `${pdfUrl}#page=${pageNumber}`
    : pdfUrl;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-7xl mx-4 my-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {documentName || 'Document Viewer'}
            </h3>
            {pageNumber && (
              <p className="text-sm text-gray-500">Page {pageNumber}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close viewer"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={pdfUrlWithPage}
            className="w-full h-full border-0"
            title="PDF Viewer"
          />
        </div>
      </div>
    </div>
  );
}

