import React from 'react';
import { Calendar, Briefcase, Heart, AlertTriangle, Globe, FileText } from 'lucide-react';
import CitationBadge from '../ui/CitationBadge';
import Card from '../ui/Card';

interface DRAISectionProps {
  data: any; // Accept flexible data structure from backend
  onCitationClick?: (sourceDocument: string, pageNumber?: number, documentId?: number) => void;
}

export default function DRAISection({ data, onCitationClick }: DRAISectionProps) {
  // Handle both old structure and new backend structure
  const summary = data?.summary || {};
  const extractedData = data?.extracted_data || {};
  const pages = data?.pages || [];
  
  // Check if there's any meaningful data to display
  const hasSummary = summary && Object.keys(summary).length > 0;
  const hasMedicalHistory = extractedData?.Medical_History;
  const hasSocialHistory = extractedData?.Social_History;
  const hasRiskFactors = extractedData?.Risk_Factors;
  const hasAdditionalInfo = extractedData?.Additional_Information;
  const hasOtherData = extractedData && Object.keys(extractedData).filter(key => 
    !['Medical_History', 'Social_History', 'Risk_Factors', 'Additional_Information'].includes(key)
  ).length > 0;
  const hasPages = pages && pages.length > 0;
  
  // If no data is available, show empty state
  if (!hasSummary && !hasMedicalHistory && !hasSocialHistory && !hasRiskFactors && !hasAdditionalInfo && !hasOtherData && !hasPages) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Donor Risk Assessment Interview (DRAI)</h2>
          <p className="text-sm text-gray-500">No DRAI data available for this donor.</p>
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
        <h2 className="text-xl font-semibold text-gray-900">
          Donor Risk Assessment Interview (DRAI)
        </h2>
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
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(summary).map(([key, value]) => (
              value && (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">{key}</label>
                  <p className="text-sm text-gray-900">{String(value)}</p>
                </div>
              )
            ))}
          </div>
        </Card>
      )}

      {/* Medical History */}
      {extractedData?.Medical_History && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Heart className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Medical History</h3>
          </div>
          <div className="space-y-3">
            {typeof extractedData.Medical_History === 'object' && !Array.isArray(extractedData.Medical_History) ? (
              Object.entries(extractedData.Medical_History).map(([key, value]) => {
                if (!value) return null;
                
                // Handle nested objects (like Symptoms)
                if (typeof value === 'object' && !Array.isArray(value)) {
                  return (
                    <div key={key} className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">{key.replace(/_/g, ' ')}</label>
                      <div className="space-y-2">
                        {Object.entries(value as Record<string, any>).map(([subKey, subValue]) => (
                          <div key={subKey} className="flex justify-between">
                            <span className="text-sm text-gray-600">{subKey.replace(/_/g, ' ')}:</span>
                            <span className="text-sm font-medium text-gray-900">{String(subValue)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div key={key}>
                    <label className="text-sm font-medium text-gray-500">{key.replace(/_/g, ' ')}</label>
                    <p className="text-sm text-gray-900 mt-1">{String(value)}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-900">{String(extractedData.Medical_History)}</p>
            )}
          </div>
        </Card>
      )}

      {/* Social History */}
      {extractedData?.Social_History && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Social History</h3>
          </div>
          <div className="space-y-3">
            {typeof extractedData.Social_History === 'object' && !Array.isArray(extractedData.Social_History) ? (
              Object.entries(extractedData.Social_History).map(([key, value]) => (
                value && (
                  <div key={key}>
                    <label className="text-sm font-medium text-gray-500">{key.replace(/_/g, ' ')}</label>
                    <p className="text-sm text-gray-900 mt-1">{String(value)}</p>
                  </div>
                )
              ))
            ) : (
              <p className="text-sm text-gray-900">{String(extractedData.Social_History)}</p>
            )}
          </div>
        </Card>
      )}

      {/* Risk Factors */}
      {extractedData?.Risk_Factors && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Risk Factors</h3>
          </div>
          <div className="space-y-3">
            {typeof extractedData.Risk_Factors === 'object' && !Array.isArray(extractedData.Risk_Factors) ? (
              Object.entries(extractedData.Risk_Factors).map(([key, value]) => (
                value && (
                  <div key={key} className="bg-yellow-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-yellow-800">{key.replace(/_/g, ' ')}</label>
                    <p className="text-sm text-yellow-900 mt-1">{String(value)}</p>
                  </div>
                )
              ))
            ) : (
              <p className="text-sm text-gray-900">{String(extractedData.Risk_Factors)}</p>
            )}
          </div>
        </Card>
      )}

      {/* Additional Information */}
      {extractedData?.Additional_Information && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
          </div>
          <div className="space-y-3">
            {typeof extractedData.Additional_Information === 'object' && !Array.isArray(extractedData.Additional_Information) ? (
              Object.entries(extractedData.Additional_Information).map(([key, value]) => {
                if (!value) return null;
                
                // Handle nested objects (like Family_History)
                if (typeof value === 'object' && !Array.isArray(value)) {
                  return (
                    <div key={key} className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">{key.replace(/_/g, ' ')}</label>
                      <div className="space-y-2">
                        {Object.entries(value as Record<string, any>).map(([subKey, subValue]) => (
                          <div key={subKey} className="flex justify-between">
                            <span className="text-sm text-gray-600">{subKey.replace(/_/g, ' ')}:</span>
                            <span className="text-sm font-medium text-gray-900">{String(subValue)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div key={key}>
                    <label className="text-sm font-medium text-gray-500">{key.replace(/_/g, ' ')}</label>
                    <p className="text-sm text-gray-900 mt-1">{String(value)}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-900">{String(extractedData.Additional_Information)}</p>
            )}
          </div>
        </Card>
      )}

      {/* Other Extracted Data */}
      {extractedData && Object.keys(extractedData).filter(key => 
        !['Medical_History', 'Social_History', 'Risk_Factors', 'Additional_Information'].includes(key)
      ).length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Other Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(extractedData).map(([key, value]) => {
              if (['Medical_History', 'Social_History', 'Risk_Factors', 'Additional_Information'].includes(key)) return null;
              if (!value) return null;
              
              return (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-500">{key.replace(/_/g, ' ')}</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </p>
                </div>
              );
            })}
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
                  documentName="Donor Risk Assessment Interview"
                  documentId={documentId}
                  onClick={() => onCitationClick?.('Donor Risk Assessment Interview', page, documentId)}
                />
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
