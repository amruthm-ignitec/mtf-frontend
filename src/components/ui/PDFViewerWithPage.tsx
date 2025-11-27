import React, { useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker - use the worker from the installed pdfjs-dist package
// This avoids CDN issues and protocol-relative URL problems
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerWithPageProps {
  pdfUrl: string;
  pageNumber?: number;
  onClose: () => void;
  documentName?: string;
}

export default function PDFViewerWithPage({
  pdfUrl,
  pageNumber = 1,
  onClose,
  documentName,
}: PDFViewerWithPageProps) {
  const [numPages, setNumPages] = React.useState<number | null>(null);
  const [currentPage, setCurrentPage] = React.useState(pageNumber);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPage(pageNumber);
  }, [pageNumber]);

  useEffect(() => {
    // Scroll to the target page after it renders
    if (pageRef.current && containerRef.current && currentPage) {
      setTimeout(() => {
        pageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }, [currentPage, numPages]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    // Ensure we're on the correct page
    if (pageNumber && pageNumber <= numPages) {
      setCurrentPage(pageNumber);
      // Scroll to target page after document loads
      setTimeout(() => {
        if (pageRef.current) {
          pageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    }
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  };

  // Calculate width for sidebar (approximately 1/3 of screen)
  const pageWidth = Math.min(600, window.innerWidth * 0.3);

  // Render all pages for full document navigation
  const pagesToRender = numPages ? Array.from({ length: numPages }, (_, i) => i + 1) : [];

  return (
    <div className="h-full w-full flex flex-col">
      {/* PDF Content */}
      <div ref={containerRef} className="flex-1 overflow-auto bg-gray-100 p-2">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-600 mb-2 text-sm">{error}</p>
              <p className="text-xs text-gray-500">Please try again or contact support.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Loading PDF...</span>
                </div>
              }
              options={{
                cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
                cMapPacked: true,
                httpHeaders: {
                  'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
                },
              }}
            >
              {pagesToRender.map((pageNum) => {
                const isTargetPage = pageNum === currentPage;
                
                return (
                  <div
                    key={`page_${pageNum}`}
                    ref={isTargetPage ? pageRef : null}
                    className={`mb-2 ${isTargetPage ? 'ring-2 ring-blue-500 rounded shadow-lg' : ''}`}
                  >
                    <Page
                      pageNumber={pageNum}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      width={pageWidth}
                      loading={
                        <div className="flex items-center justify-center p-4 bg-white rounded shadow min-h-[400px]">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      }
                    />
                  </div>
                );
              })}
            </Document>
          </div>
        )}
      </div>
    </div>
  );
}

