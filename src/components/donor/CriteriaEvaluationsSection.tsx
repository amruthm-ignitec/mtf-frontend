import React, { useState } from 'react';
import Card from '../ui/Card';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { CriteriaEvaluation } from '../../types/extraction';

interface CriteriaEvaluationsSectionProps {
  criteriaEvaluations?: Record<string, CriteriaEvaluation>;
}

export default function CriteriaEvaluationsSection({ 
  criteriaEvaluations 
}: CriteriaEvaluationsSectionProps) {
  const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'acceptable' | 'unacceptable' | 'md_discretion'>('all');

  if (!criteriaEvaluations || Object.keys(criteriaEvaluations).length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Criteria Evaluations</h3>
          <p className="text-sm text-gray-500">No criteria evaluations available.</p>
          <p className="text-xs text-gray-400 mt-1">Evaluations will appear here after document processing is complete.</p>
        </div>
      </Card>
    );
  }

  const toggleExpanded = (criterionName: string) => {
    const newExpanded = new Set(expandedCriteria);
    if (newExpanded.has(criterionName)) {
      newExpanded.delete(criterionName);
    } else {
      newExpanded.add(criterionName);
    }
    setExpandedCriteria(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'acceptable':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'unacceptable':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'md_discretion':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'acceptable':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'unacceptable':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'md_discretion':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Check if extracted_data has any actual data (not all nulls)
  const hasActualData = (extractedData: Record<string, any>): boolean => {
    if (!extractedData || Object.keys(extractedData).length === 0) {
      return false;
    }
    
    // Metadata fields to exclude from check
    const metadataFields = new Set(['_criterion_name', '_extraction_timestamp']);
    
    for (const [key, value] of Object.entries(extractedData)) {
      if (metadataFields.has(key)) {
        continue;
      }
      
      // Check if value is not null and not empty
      if (value !== null && value !== undefined) {
        if (typeof value === 'string' && value.trim() !== '') {
          return true;
        }
        if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0) {
          return true;
        }
        if (Array.isArray(value) && value.length > 0) {
          return true;
        }
        if (typeof value !== 'string' && typeof value !== 'object') {
          return true;
        }
      }
    }
    
    return false;
  };

  // Format field name for display (replace underscores, capitalize)
  const formatFieldName = (fieldName: string): string => {
    return fieldName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Format value for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Get non-null extracted data entries as badges
  const getExtractedDataBadges = (extractedData: Record<string, any>): Array<{ key: string; value: string }> => {
    if (!extractedData) return [];
    
    const metadataFields = new Set(['_criterion_name', '_extraction_timestamp']);
    const badges: Array<{ key: string; value: string }> = [];
    
    for (const [key, value] of Object.entries(extractedData)) {
      // Skip metadata fields
      if (metadataFields.has(key)) {
        continue;
      }
      
      // Skip null, undefined, or empty values
      if (value === null || value === undefined) {
        continue;
      }
      
      // Skip empty strings
      if (typeof value === 'string' && value.trim() === '') {
        continue;
      }
      
      // Skip empty arrays
      if (Array.isArray(value) && value.length === 0) {
        continue;
      }
      
      // Skip empty objects
      if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
        continue;
      }
      
      const formattedValue = formatValue(value);
      if (formattedValue) {
        badges.push({
          key: formatFieldName(key),
          value: formattedValue
        });
      }
    }
    
    return badges;
  };

  const filteredCriteria = Object.entries(criteriaEvaluations).filter(([_, evaluation]) => {
    if (filter === 'all') return true;
    return evaluation.evaluation_result === filter;
  });

  const stats = {
    total: Object.keys(criteriaEvaluations).length,
    acceptable: Object.values(criteriaEvaluations).filter(e => e.evaluation_result === 'acceptable').length,
    unacceptable: Object.values(criteriaEvaluations).filter(e => e.evaluation_result === 'unacceptable').length,
    md_discretion: Object.values(criteriaEvaluations).filter(e => e.evaluation_result === 'md_discretion').length,
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Acceptance Criteria Evaluations</h3>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-1 rounded ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('acceptable')}
            className={`px-2 py-1 rounded ${filter === 'acceptable' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
          >
            Acceptable ({stats.acceptable})
          </button>
          <button
            onClick={() => setFilter('unacceptable')}
            className={`px-2 py-1 rounded ${filter === 'unacceptable' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}
          >
            Unacceptable ({stats.unacceptable})
          </button>
          <button
            onClick={() => setFilter('md_discretion')}
            className={`px-2 py-1 rounded ${filter === 'md_discretion' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}
          >
            MD Discretion ({stats.md_discretion})
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {filteredCriteria.map(([criterionName, evaluation]) => {
          const isExpanded = expandedCriteria.has(criterionName);
          return (
            <div key={criterionName} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {getStatusIcon(evaluation.evaluation_result)}
                  <h4 className="font-medium text-gray-900 flex-1">{criterionName}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(evaluation.evaluation_result)}`}>
                    {formatStatus(evaluation.evaluation_result)}
                  </span>
                </div>
                <button
                  onClick={() => toggleExpanded(criterionName)}
                  className="ml-2 p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>

              {evaluation.evaluation_reasoning && (
                <p className="text-sm text-gray-600 mt-2">{evaluation.evaluation_reasoning}</p>
              )}

              {isExpanded && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  {evaluation.tissue_types && evaluation.tissue_types.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Tissue Types:</p>
                      <div className="flex gap-2">
                        {evaluation.tissue_types.map((tissueType, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            {tissueType}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {evaluation.extracted_data && hasActualData(evaluation.extracted_data) && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Extracted Data:</p>
                      <div className="flex flex-wrap gap-2">
                        {getExtractedDataBadges(evaluation.extracted_data).map((badge, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs"
                          >
                            <span className="font-medium text-blue-900">{badge.key}:</span>
                            <span className="text-blue-700">{badge.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredCriteria.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No criteria match the selected filter.</p>
        </div>
      )}
    </Card>
  );
}

