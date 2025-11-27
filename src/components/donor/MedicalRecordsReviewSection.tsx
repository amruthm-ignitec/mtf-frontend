import React from 'react';
import { FileText, ClipboardList } from 'lucide-react';
import CitationBadge from '../ui/CitationBadge';
import Card from '../ui/Card';

interface MedicalRecordsReviewSectionProps {
  data: any; // Accept flexible data structure from backend
  onCitationClick?: (sourceDocument: string, pageNumber?: number) => void;
}

export default function MedicalRecordsReviewSection({
  data,
  onCitationClick,
}: MedicalRecordsReviewSectionProps) {
  // Handle both old structure and new backend structure
  const summary = data?.summary || {};
  const extractedData = data?.extracted_data || {};
  const pages = data?.pages || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Medical Records Review Summary</h2>
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
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(summary).map(([key, value]) => {
              if (!value) return null;
              
              // Handle array values (like Diagnoses, Procedures, Medications)
              if (Array.isArray(value)) {
                return (
                  <div key={key}>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">{key}</label>
                    <ul className="list-disc list-inside space-y-1">
                      {value.map((item: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-900">{item}</li>
                      ))}
                    </ul>
                  </div>
                );
              }
              
              // Handle string values
              return (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-500">{key}</label>
                  <p className="text-sm text-gray-900 mt-1">{String(value)}</p>
                </div>
              );
            })}
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
          <div className="space-y-4">
            {Object.entries(extractedData).map(([key, value]) => {
              if (!value) return null;
              
              // Handle nested objects
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
              
              // Handle arrays
              if (Array.isArray(value)) {
                return (
                  <div key={key}>
                    <label className="text-sm font-medium text-gray-500 mb-2 block">{key.replace(/_/g, ' ')}</label>
                    <ul className="list-disc list-inside space-y-1">
                      {value.map((item: any, idx: number) => (
                        <li key={idx} className="text-sm text-gray-900">{String(item)}</li>
                      ))}
                    </ul>
                  </div>
                );
              }
              
              // Handle simple values
              return (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-500">{key.replace(/_/g, ' ')}</label>
                  <p className="text-sm text-gray-900 mt-1">{String(value)}</p>
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
            {pages.map((page: number, idx: number) => (
              <CitationBadge
                key={idx}
                pageNumber={page}
                documentName="Medical Records Review Summary"
                onClick={() => onCitationClick?.('Medical Records Review Summary', page)}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

