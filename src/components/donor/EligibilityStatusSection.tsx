import React from 'react';
import Card from '../ui/Card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { EligibilityData } from '../../types/extraction';

interface EligibilityStatusSectionProps {
  eligibility?: EligibilityData;
}

export default function EligibilityStatusSection({ eligibility }: EligibilityStatusSectionProps) {
  if (!eligibility) {
    return null;
  }

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'eligible':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'ineligible':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'requires_review':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'eligible':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'ineligible':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'requires_review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatStatus = (status?: string) => {
    if (!status) return 'Pending';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Donor Eligibility Status</h3>
      <div className="space-y-4">
        {eligibility.musculoskeletal && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Musculoskeletal</h4>
              <div className="flex items-center gap-2">
                {getStatusIcon(eligibility.musculoskeletal.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(eligibility.musculoskeletal.status)}`}>
                  {formatStatus(eligibility.musculoskeletal.status)}
                </span>
              </div>
            </div>
            {eligibility.musculoskeletal.blocking_criteria && eligibility.musculoskeletal.blocking_criteria.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-red-700 mb-1">Blocking Criteria:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {eligibility.musculoskeletal.blocking_criteria.map((criterion: any, idx: number) => (
                    <li key={idx}>
                      <span className="font-medium">{criterion.criterion_name || criterion}</span>
                      {criterion.reasoning && (
                        <span className="text-gray-500 ml-2">- {criterion.reasoning}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {eligibility.musculoskeletal.md_discretion_criteria && eligibility.musculoskeletal.md_discretion_criteria.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-yellow-700 mb-1">MD Discretion Required:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {eligibility.musculoskeletal.md_discretion_criteria.map((criterion: any, idx: number) => (
                    <li key={idx}>
                      <span className="font-medium">{criterion.criterion_name || criterion}</span>
                      {criterion.reasoning && (
                        <span className="text-gray-500 ml-2">- {criterion.reasoning}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {eligibility.musculoskeletal.evaluated_at && (
              <p className="text-xs text-gray-500 mt-2">
                Evaluated at: {new Date(eligibility.musculoskeletal.evaluated_at).toLocaleString()}
              </p>
            )}
          </div>
        )}
        
        {eligibility.skin && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Skin</h4>
              <div className="flex items-center gap-2">
                {getStatusIcon(eligibility.skin.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(eligibility.skin.status)}`}>
                  {formatStatus(eligibility.skin.status)}
                </span>
              </div>
            </div>
            {eligibility.skin.blocking_criteria && eligibility.skin.blocking_criteria.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-red-700 mb-1">Blocking Criteria:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {eligibility.skin.blocking_criteria.map((criterion: any, idx: number) => (
                    <li key={idx}>
                      <span className="font-medium">{criterion.criterion_name || criterion}</span>
                      {criterion.reasoning && (
                        <span className="text-gray-500 ml-2">- {criterion.reasoning}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {eligibility.skin.md_discretion_criteria && eligibility.skin.md_discretion_criteria.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-yellow-700 mb-1">MD Discretion Required:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {eligibility.skin.md_discretion_criteria.map((criterion: any, idx: number) => (
                    <li key={idx}>
                      <span className="font-medium">{criterion.criterion_name || criterion}</span>
                      {criterion.reasoning && (
                        <span className="text-gray-500 ml-2">- {criterion.reasoning}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {eligibility.skin.evaluated_at && (
              <p className="text-xs text-gray-500 mt-2">
                Evaluated at: {new Date(eligibility.skin.evaluated_at).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {!eligibility.musculoskeletal && !eligibility.skin && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No eligibility data available yet.</p>
            <p className="text-xs text-gray-400 mt-1">Eligibility will be determined after all documents are processed.</p>
          </div>
        )}
      </div>
    </Card>
  );
}

