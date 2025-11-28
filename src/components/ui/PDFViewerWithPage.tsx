import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ZoomIn, ZoomOut, ExternalLink, ChevronLeft, ChevronRight, X } from 'lucide-react';

// Set up PDF.js worker - must match react-pdf's internal pdfjs-dist version (5.4.296)
// react-pdf 10.2.0 uses pdfjs-dist 5.4.296 internally, so we must use the same version
// CRITICAL: Set worker synchronously at module load time, before any imports use it
// Using CDN URL to ensure version compatibility and avoid module resolution issues
if (typeof window !== 'undefined') {
  // Always set it, don't check if it exists - ensures it's set before react-pdf initializes
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs`;
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
  // Ensure worker is set before component renders - critical for PDF.js initialization
  useEffect(() => {
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs`;
    }
  }, []);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(pageNumber);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<ArrayBuffer | string | null>(null);
  const [scale, setScale] = useState(1.0);
  const [pageInput, setPageInput] = useState<string>('');
  const pageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch PDF as blob/arraybuffer to handle authentication properly
  // This avoids CORS issues when PDF.js worker tries to load from Azure Blob Storage
  useEffect(() => {
    const fetchPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if URL needs to be fetched with authentication
        // - API endpoints need auth headers (check for /documents/ or /api/ in URL)
        // - Azure Blob Storage URLs should be fetched to avoid CORS issues
        // - Local files can be used directly
        const isApiUrl = pdfUrl.includes('/documents/') && pdfUrl.includes('/pdf');
        const isAzureBlobUrl = pdfUrl.includes('blob.core.windows.net');
        const isLocalFile = pdfUrl.startsWith('/') && !isApiUrl && !isAzureBlobUrl;
        
        if (isApiUrl || isAzureBlobUrl) {
          // Fetch PDF with authentication headers for API endpoints
          // For Azure Blob URLs, fetch to avoid CORS issues even if they have SAS tokens
          const token = localStorage.getItem('authToken');
          const headers: HeadersInit = {};
          
          if (isApiUrl && token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          const response = await fetch(pdfUrl, {
            headers,
          });

          if (!response.ok) {
            throw new Error(`Failed to load PDF: ${response.status} ${response.statusText}`);
          }

          // Convert response to arraybuffer for PDF.js
          const arrayBuffer = await response.arrayBuffer();
          setPdfData(arrayBuffer);
        } else {
          // For local files, use URL directly
          setPdfData(pdfUrl);
        }
      } catch (err) {
        console.error('Error fetching PDF:', err);
        setError(err instanceof Error ? err.message : 'Failed to load PDF');
        setLoading(false);
      }
    };

    fetchPdf();
  }, [pdfUrl]);

  useEffect(() => {
    setCurrentPage(pageNumber);
    setPageInput(pageNumber.toString());
  }, [pageNumber]);

  // Update page input when current page changes
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    // Scroll to the target page after it renders
    if (pageRef.current && containerRef.current && currentPage) {
      setTimeout(() => {
        pageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }, [currentPage, numPages]);

  // Memoize PDF.js options to prevent unnecessary reloads
  // Must be called before any conditional returns to follow Rules of Hooks
  const pdfOptions = useMemo(() => ({
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/standard_fonts/',
  }), []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF document loaded successfully:', { numPages, pdfUrl });
    // Add a small delay to ensure worker is fully initialized before rendering pages
    setTimeout(() => {
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
    }, 100);
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

  // Calculate width for sidebar with zoom
  const baseWidth = Math.min(600, window.innerWidth * 0.3);
  const pageWidth = baseWidth * scale;

  // Zoom controls
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setScale(1.0);
  };

  // Page navigation
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (numPages && currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageJump = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput);
    if (pageNum >= 1 && numPages && pageNum <= numPages) {
      setCurrentPage(pageNum);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  // Open in new tab
  const handleOpenInNewTab = () => {
    // Create a blob URL from the PDF data if it's an ArrayBuffer
    if (pdfData instanceof ArrayBuffer) {
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      // Clean up the blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } else {
      // For URLs, open directly
      window.open(pdfUrl, '_blank');
    }
  };

  // Don't render Document until PDF data is loaded
  if (!pdfData && loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading PDF...</span>
        </div>
      </div>
    );
  }

  // Render all pages for full document navigation
  // Only render pages after document is fully loaded to avoid worker transport issues
  const pagesToRender = numPages && !loading ? Array.from({ length: numPages }, (_, i) => i + 1) : [];

  return (
    <div className="h-full w-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-700 truncate">
            {documentName || 'Document'}
          </span>
          {numPages && (
            <span className="text-xs text-gray-500 whitespace-nowrap">
              ({currentPage} / {numPages})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Page Navigation */}
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
              className="p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <form onSubmit={handlePageJump} className="flex items-center">
              <input
                type="text"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={handlePageJump}
                className="w-12 px-2 py-1 text-sm text-center border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                title="Go to page"
              />
            </form>
            <button
              onClick={handleNextPage}
              disabled={!numPages || currentPage >= numPages}
              className="p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              className="p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomReset}
              className="px-2 py-1 text-xs hover:bg-gray-100 transition-colors"
              title="Reset zoom"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 3.0}
              className="p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Open in New Tab */}
          <button
            onClick={handleOpenInNewTab}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close viewer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div ref={containerRef} className="flex-1 overflow-auto bg-gray-100 p-2">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-600 mb-2 text-sm">{error}</p>
              <p className="text-xs text-gray-500">Please try again or contact support.</p>
            </div>
          </div>
        ) : pdfData ? (
          <div className="flex flex-col items-center">
            <Document
              file={pdfData}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Loading PDF...</span>
                </div>
              }
              options={pdfOptions}
            >
              {pagesToRender.length > 0 ? pagesToRender.map((pageNum) => {
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
                      scale={scale}
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
              }) : null}
            </Document>
          </div>
        ) : null}
      </div>
    </div>
  );
}

