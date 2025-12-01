import React from 'react';
import { TissueRecovery } from '../../types/extraction';
import TissueEligibilityAnalysis from './TissueEligibilityAnalysis';
import Card from '../ui/Card';

interface TissueRecoverySectionProps {
  data?: TissueRecovery | any;
  eligibilityData?: any[];
  onCitationClick?: (sourceDocument: string, pageNumber?: number, documentId?: number) => void;
}

export default function TissueRecoverySection({ data, eligibilityData, onCitationClick }: TissueRecoverySectionProps) {
  // Check if data exists and has meaningful content
  const hasSummary = data?.summary && (
    data.summary['Tissues Recovered'] || 
    data.summary['Recovery Procedures'] || 
    data.summary['Timing'] || 
    data.summary['Special Handling']
  );
  const hasExtractedData = data?.extracted_data && Object.keys(data.extracted_data).length > 0;
  const hasPages = data?.pages && data.pages.length > 0;
  const hasRecoveryData = hasSummary || hasExtractedData || hasPages;
  
  return (
    <div className="space-y-6">
      {/* Tissue Recovery Information - Show if available and has content */}
      {data && hasRecoveryData && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tissue Recovery Information</h3>
          <div className="space-y-4">
            {data.summary && (
              <div className="space-y-3">
                {data.summary['Tissues Recovered'] && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tissues Recovered</h4>
                    <p className="text-sm text-gray-900">{data.summary['Tissues Recovered'] || '-'}</p>
                  </div>
                )}
                {data.summary['Recovery Procedures'] && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recovery Procedures</h4>
                    <p className="text-sm text-gray-900">{data.summary['Recovery Procedures'] || '-'}</p>
                  </div>
                )}
                {data.summary['Timing'] && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Timing</h4>
                    <p className="text-sm text-gray-900">{data.summary['Timing'] || '-'}</p>
                  </div>
                )}
                {data.summary['Special Handling'] && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Special Handling</h4>
                    <p className="text-sm text-gray-900">{data.summary['Special Handling'] || '-'}</p>
                  </div>
                )}
              </div>
            )}
            {data.extracted_data && Object.keys(data.extracted_data).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recovery Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(data.extracted_data).map(([key, value]) => (
                    value && (
                      <div key={key} className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500 mb-1">{key.replace(/_/g, ' ')}</div>
                        <div className="text-sm font-medium text-gray-900">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
            {data.pages && data.pages.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Source Pages</h4>
                <div className="flex flex-wrap gap-2">
                  {data.pages.map((citation: any, idx: number) => {
                    const page = typeof citation === 'object' && citation !== null && 'page' in citation
                      ? citation.page
                      : (typeof citation === 'number' ? citation : parseInt(String(citation), 10) || 1);
                    const documentId = typeof citation === 'object' && citation !== null && 'document_id' in citation
                      ? citation.document_id
                      : undefined;
                    return (
                      <button
                        key={idx}
                        onClick={() => onCitationClick?.('Tissue Recovery Information', page, documentId)}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors"
                      >
                        Page {page}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
      
      {/* Tissue Eligibility Analysis - Always show if available */}
      {eligibilityData && eligibilityData.length > 0 && (
        <TissueEligibilityAnalysis eligibilityData={eligibilityData} />
      )}
      
      {/* Show message if neither data nor eligibility is available */}
      {!hasRecoveryData && (!eligibilityData || eligibilityData.length === 0) && (
        <Card className="p-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Tissue Recovery</h2>
            <p className="text-sm text-gray-500">No tissue recovery and eligibility data available for this donor.</p>
          </div>
        </Card>
      )}
    </div>
  );
}

