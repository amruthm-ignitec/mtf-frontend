import React from 'react';
import { FileText, User, Calendar } from 'lucide-react';
import CitationBadge from '../ui/CitationBadge';
import Card from '../ui/Card';

interface AuthorizationSectionProps {
  data: any; // Accept flexible data structure from backend
  onCitationClick?: (sourceDocument: string, pageNumber?: number, documentId?: number) => void;
}

export default function AuthorizationSection({ data, onCitationClick }: AuthorizationSectionProps) {
  // Handle both old structure and new backend structure
  const summary = data?.summary || {};
  const extractedData = data?.extracted_data || {};
  const pages = data?.pages || [];
  
  // If component is explicitly marked as not present, show empty state
  if (data?.present === false) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authorization & Consent</h2>
          <p className="text-sm text-gray-500">No authorization data available for this donor.</p>
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
  
  // Extract values from summary or extracted_data
  const authorizer = extractedData?.Authorizer || summary?.Authorizer || '-';
  const date = extractedData?.Date || summary?.Date || '-';
  const type = extractedData?.Type || summary?.Type || '-';
  const conditions = extractedData?.Conditions || summary?.Conditions || '-';
  
  // Check if there's any meaningful data to display
  const hasFormInfo = (type && type !== '-') || (conditions && conditions !== '-');
  const hasAuthorizer = authorizer && authorizer !== '-';
  const hasDate = date && date !== '-';
  const hasSummary = summary && Object.keys(summary).length > 0;
  const hasExtractedData = extractedData && Object.keys(extractedData).length > 0;
  const hasPages = pages && pages.length > 0;
  
  // If no data is available, show empty state
  if (!hasFormInfo && !hasAuthorizer && !hasDate && !hasSummary && !hasExtractedData && !hasPages) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authorization & Consent</h2>
          <p className="text-sm text-gray-500">No authorization data available for this donor.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Authorization & Consent</h2>
        {data?.present !== undefined && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            data.present ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {data.present ? 'Present' : 'Not Present'}
          </span>
        )}
      </div>

      {/* Form Information */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Form Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Form Type</label>
            <p className="text-sm text-gray-900 mt-1">{type || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Conditions</label>
            <p className="text-sm text-gray-900 mt-1">{conditions || '-'}</p>
          </div>
        </div>
      </Card>

      {/* Authorized Party */}
      {authorizer && authorizer !== '-' && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Authorized Party</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Authorizer</label>
              <p className="text-sm text-gray-900 mt-1">{authorizer}</p>
            </div>
            {date && date !== '-' && (
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <p className="text-sm text-gray-900 mt-1">{date}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Authorization Date/Time */}
      {date && date !== '-' && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Authorization Timeline</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <label className="text-xs font-medium text-gray-500">Authorization Date/Time</label>
              <p className="text-sm font-semibold text-gray-900 mt-1">{date}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Summary Section */}
      {summary && Object.keys(summary).length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-gray-600" />
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
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Extracted Data</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(extractedData).map(([key, value]) => (
              value && (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-500">{key.replace(/_/g, ' ')}</label>
                  <p className="text-sm text-gray-900 mt-1">
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
                  documentName="Authorization for Tissue Donation"
                  documentId={documentId}
                  onClick={() => onCitationClick?.('Authorization for Tissue Donation', page, documentId)}
                />
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

