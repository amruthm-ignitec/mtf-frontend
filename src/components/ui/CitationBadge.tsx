import React from 'react';
import { FileText } from 'lucide-react';

interface CitationBadgeProps {
  pageNumber: number | string;
  documentName?: string;
  documentId?: number;
  onClick?: (documentId?: number) => void;
  className?: string;
}

export default function CitationBadge({
  pageNumber,
  documentName,
  documentId,
  onClick,
  className = '',
}: CitationBadgeProps) {
  const displayText = documentName 
    ? `${documentName} - [P${pageNumber}]`
    : `[P${pageNumber}]`;

  const handleClick = () => {
    if (onClick) {
      onClick(documentId);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors text-xs font-medium ${className}`}
      title={documentName ? `${documentName} - Page ${pageNumber}` : `Page ${pageNumber}`}
    >
      <FileText className="w-3 h-3" />
      <span>{displayText}</span>
    </button>
  );
}

