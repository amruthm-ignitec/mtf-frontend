import React from 'react';
import { Droplets, Calculator, FileText } from 'lucide-react';
import CitationBadge from '../ui/CitationBadge';
import Card from '../ui/Card';
import { getDocumentName, Document } from '../../utils/documentUtils';

interface PlasmaDilutionSectionProps {
  data: any; // Accept flexible data structure from backend
  documents?: Document[]; // Documents array for resolving document names
  onCitationClick?: (sourceDocument: string, pageNumber?: number, documentId?: number) => void;
}

export default function PlasmaDilutionSection({ data, documents = [], onCitationClick }: PlasmaDilutionSectionProps) {
  // Handle both old structure and new backend structure
  const summary = data?.summary || {};
  const extractedData = data?.extracted_data || {};
  const pages = data?.pages || [];
  
  // If component is explicitly marked as not present, show empty state
  if (data?.present === false) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Plasma Dilution</h2>
          <p className="text-sm text-gray-500">No plasma dilution data available for this donor.</p>
        </div>
      </Card>
    );
  }
  
  // Helper function to check if an object has any meaningful (non-null, non-empty) values
  const hasMeaningfulData = (obj: any): boolean => {
    if (!obj || typeof obj !== 'object') return false;
    return Object.values(obj).some(value => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === 'object' && Object.keys(value).length === 0) return false;
      return true;
    });
  };
  
  // Check if there's any meaningful data to display
  const hasSummary = hasMeaningfulData(summary);
  const hasExtractedData = hasMeaningfulData(extractedData);
  const hasPages = Array.isArray(pages) && pages.length > 0;
  
  // If no data is available, show empty state
  if (!hasSummary && !hasExtractedData && !hasPages) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Plasma Dilution</h2>
          <p className="text-sm text-gray-500">No plasma dilution data available for this donor.</p>
        </div>
      </Card>
    );
  }
  
  // Helper function to extract page number and document_id from citation
  const getCitationInfo = (citation: any): { page: number; documentId?: number } => {
    if (typeof citation === 'object' && citation !== null && 'page' in citation) {
      return {
        page: citation.page,
        documentId: citation.document_id
      };
    }
    // Legacy format: just a number
    return {
      page: typeof citation === 'number' ? citation : parseInt(String(citation), 10) || 1
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Plasma Dilution</h2>
        {data?.present !== undefined && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            data.present ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {data.present ? 'Present' : 'Not Present'}
          </span>
        )}
      </div>

      {/* Summary Section - Only show if there's meaningful data */}
      {hasSummary && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Droplets className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(summary).map(([key, value]) => {
              // Only render if value is meaningful
              if (!value || (typeof value === 'string' && value.trim() === '') || 
                  (Array.isArray(value) && value.length === 0)) {
                return null;
              }
              return (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-500">{key}</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Extracted Data Section - Only show if there's meaningful data */}
      {hasExtractedData && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calculator className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Extracted Data</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(extractedData).map(([key, value]) => {
              // Only render if value is meaningful
              if (!value || value === null || (typeof value === 'string' && value.trim() === '') ||
                  (Array.isArray(value) && value.length === 0)) {
                return null;
              }
              return (
                <div key={key} className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-medium text-gray-500">{key.replace(/_/g, ' ')}</label>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Source Pages */}
      {hasPages && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Source Pages</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {pages.map((citation: any, idx: number) => {
              const { page, documentId } = getCitationInfo(citation);
              const documentName = getDocumentName(documents, documentId);
              return (
                <CitationBadge
                  key={idx}
                  pageNumber={page}
                  documentName={documentName || undefined}
                  documentId={documentId}
                  onClick={() => onCitationClick?.(documentName || 'Plasma Dilution', page, documentId)}
                />
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

