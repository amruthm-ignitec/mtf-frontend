import React from 'react';
import { FileText } from 'lucide-react';
import { SourceDocument } from '../../types/extraction';

interface SourceDocumentLinkProps {
  document: SourceDocument | { source_document: string; source_page?: number; source_pages?: number[] };
  className?: string;
  showIcon?: boolean;
}

export default function SourceDocumentLink({
  document,
  className = '',
  showIcon = true,
}: SourceDocumentLinkProps) {
  const getFilename = () => {
    if ('filename' in document) {
      return document.filename;
    }
    return document.source_document;
  };

  const getPages = () => {
    if ('page' in document && document.page) {
      return [document.page];
    }
    if ('source_pages' in document && document.source_pages) {
      return document.source_pages;
    }
    if ('source_page' in document && document.source_page) {
      return [document.source_page];
    }
    return [];
  };

  const filename = getFilename();
  const pages = getPages();
  const pageText = pages.length > 0 ? ` (Page${pages.length > 1 ? 's' : ''}: ${pages.join(', ')})` : '';

  return (
    <div className={`flex items-center space-x-1 text-xs text-gray-600 ${className}`}>
      {showIcon && <FileText className="w-3 h-3" />}
      <span className="truncate max-w-xs" title={filename + pageText}>
        {filename}
        {pageText}
      </span>
    </div>
  );
}

