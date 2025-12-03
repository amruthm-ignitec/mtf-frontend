import React from 'react';
import { FileText } from 'lucide-react';

interface CitationBadgeProps {
  pageNumber: number | string;
  documentName?: string;
  documentId?: number;
  onClick?: (documentId?: number) => void;
  className?: string;
}

// Truncate document name to max length with ellipsis
const truncateDocumentName = (name: string, maxLength: number = 35): string => {
  if (name.length <= maxLength) {
    return name;
  }
  return name.substring(0, maxLength - 3) + '...';
};

export default function CitationBadge({
  pageNumber,
  documentName,
  documentId,
  onClick,
  className = '',
}: CitationBadgeProps) {
  // Truncate document name if provided
  const truncatedName = documentName ? truncateDocumentName(documentName) : null;
  const displayText = truncatedName 
    ? `${truncatedName} - [P${pageNumber}]`
    : `[P${pageNumber}]`;

  // Tooltip shows full document name
  const tooltipText = documentName 
    ? `${documentName} - Page ${pageNumber}`
    : `Page ${pageNumber}`;

  const handleClick = () => {
    if (onClick) {
      onClick(documentId);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors text-xs font-medium ${className}`}
      title={tooltipText}
    >
      <FileText className="w-3 h-3" />
      <span>{displayText}</span>
    </button>
  );
}

