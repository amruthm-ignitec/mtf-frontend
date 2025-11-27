import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker - use jsdelivr CDN for reliable worker loading
// Using explicit version to match installed package (5.4.394)
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  // Use jsdelivr CDN which is more reliable than unpkg for workers
  // Using .min.js instead of .mjs for better compatibility
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.394/build/pdf.worker.min.js`;
}

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
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(pageNumber);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    console.log('PDF document loaded successfully:', { numPages, pdfUrl });
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
    console.error('PDF document load error:', error);
    console.error('PDF URL:', pdfUrl);
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  };

  const onPageLoadError = (error: Error) => {
    console.warn('PDF page load error:', error);
    // Don't set error state for page errors - just log them
    // The page will show a placeholder or skip rendering
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
                cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.394/cmaps/',
                cMapPacked: true,
                httpHeaders: {
                  'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
                },
                withCredentials: false,
                standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.394/standard_fonts/',
              }}
            >
              {loading && numPages === null ? null : pagesToRender.map((pageNum) => {
                const isTargetPage = pageNum === currentPage;
                
                return (
                  <div
                    key={`page_${pageNum}`}
                    ref={isTargetPage ? pageRef : null}
                    className={`mb-2 ${isTargetPage ? 'ring-2 ring-blue-500 rounded shadow-lg' : ''}`}
                  >
                    <Page
                      pageNumber={pageNum}
                      renderTextLayer={false}
                      renderAnnotationLayer={true}
                      width={pageWidth}
                      onLoadError={onPageLoadError}
                      loading={
                        <div className="flex items-center justify-center p-4 bg-white rounded shadow min-h-[400px]">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      }
                      error={
                        <div className="flex items-center justify-center p-4 bg-white rounded shadow min-h-[400px] border border-red-200">
                          <p className="text-sm text-red-600">Failed to load page {pageNum}</p>
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

