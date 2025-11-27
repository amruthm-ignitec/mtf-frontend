import React from 'react';
import { Ruler, Scale, Eye, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import CitationBadge from '../ui/CitationBadge';
import Card from '../ui/Card';

interface PhysicalAssessmentSectionProps {
  data: any; // Accept flexible data structure from backend
  onCitationClick?: (sourceDocument: string, pageNumber?: number) => void;
}

export default function PhysicalAssessmentSection({
  data,
  onCitationClick,
}: PhysicalAssessmentSectionProps) {
  // Handle both old structure and new backend structure
  const summary = data?.summary || {};
  const extractedData = data?.extracted_data || {};
  const pages = data?.pages || [];

  const getFindingStatus = (value: string) => {
    if (!value || value.includes('No') || value.includes('---------')) {
      return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
    }
    if (value.includes('Unable') || value.includes('unable')) {
      return { icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    }
    return { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Physical Assessment</h2>
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

      {/* Body Measurements from Extracted Data */}
      {(extractedData?.Height || extractedData?.Weight || extractedData?.BMI) && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Ruler className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Body Measurements</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {extractedData.Height && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500">Height</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{extractedData.Height}</p>
              </div>
            )}
            {extractedData.Weight && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500">Weight</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{extractedData.Weight}</p>
              </div>
            )}
            {extractedData.BMI && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500">BMI</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{extractedData.BMI}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Physical Findings from Extracted Data */}
      {extractedData && Object.keys(extractedData).length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Eye className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Physical Findings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(extractedData).map(([key, value]) => {
              // Skip measurements already shown
              if (['Height', 'Weight', 'BMI'].includes(key)) return null;
              
              if (!value) return null;
              
              const valueStr = String(value);
              const status = getFindingStatus(valueStr);
              const StatusIcon = status.icon;
              
              return (
                <div
                  key={key}
                  className={`${status.bgColor} p-3 rounded-lg border border-gray-200`}
                >
                  <div className="flex items-start space-x-2">
                    <StatusIcon className={`w-4 h-4 mt-0.5 ${status.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 mb-1">{key.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-gray-900 break-words">{valueStr}</p>
                    </div>
                  </div>
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
                documentName="Physical Assessment"
                onClick={() => onCitationClick?.('Physical Assessment', page)}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

