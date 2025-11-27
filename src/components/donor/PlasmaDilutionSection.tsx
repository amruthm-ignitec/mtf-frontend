import React from 'react';
import { Droplets, Calculator, FileText } from 'lucide-react';
import CitationBadge from '../ui/CitationBadge';
import Card from '../ui/Card';

interface PlasmaDilutionSectionProps {
  data: any; // Accept flexible data structure from backend
  onCitationClick?: (sourceDocument: string, pageNumber?: number, documentId?: number) => void;
}

export default function PlasmaDilutionSection({ data, onCitationClick }: PlasmaDilutionSectionProps) {
  // Handle both old structure and new backend structure
  const summary = data?.summary || {};
  const extractedData = data?.extracted_data || {};
  const pages = data?.pages || [];
  
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

      {/* Summary Section */}
      {summary && Object.keys(summary).length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Droplets className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(summary).map(([key, value]) => (
              value && (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-500">{key}</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </p>
                </div>
              )
            ))}
          </div>
        </Card>
      )}

      {/* Extracted Data Section */}
      {extractedData && Object.keys(extractedData).length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calculator className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Extracted Data</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(extractedData).map(([key, value]) => (
              value && (
                <div key={key} className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-medium text-gray-500">{key.replace(/_/g, ' ')}</label>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </p>
                </div>
              )
            ))}
          </div>
        </Card>
      )}

      {/* Source Pages */}
      {pages && pages.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Source Pages</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {pages.map((citation: any, idx: number) => {
              const { page, documentId } = getCitationInfo(citation);
              return (
                <CitationBadge
                  key={idx}
                  pageNumber={page}
                  documentName="Plasma Dilution"
                  documentId={documentId}
                  onClick={() => onCitationClick?.('Plasma Dilution', page, documentId)}
                />
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

