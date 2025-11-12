import React from 'react';
import { ConditionalDocuments } from '../../types/extraction';
import { FlaskConical, TestTube, FileSearch, AlertCircle } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import CitationBadge from '../ui/CitationBadge';
import Card from '../ui/Card';

interface ConditionalDocumentsSectionProps {
  data: ConditionalDocuments;
  onCitationClick?: (sourceDocument: string, pageNumber?: number) => void;
}

export default function ConditionalDocumentsSection({
  data,
  onCitationClick,
}: ConditionalDocumentsSectionProps) {
  const { bioburden_results, toxicology_report, autopsy_report } = data;

  const getConditionalStatusColor = (status: string) => {
    if (status.includes('CONDITION NOT MET')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    if (status.includes('CONDITION MET')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Conditional Documents</h2>

      {/* Bioburden Results */}
      {bioburden_results && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FlaskConical className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Bioburden Results</h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getConditionalStatusColor(
                bioburden_results.conditional_status
              )}`}
            >
              {bioburden_results.conditional_status}
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Condition Required</label>
              <p className="text-sm text-gray-900 mt-1">{bioburden_results.condition_required}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Testing Performed</label>
              <p className="text-sm text-gray-900 mt-1">
                {bioburden_results.bioburden_testing_performed ? 'Yes' : 'No'}
              </p>
            </div>
            {bioburden_results.test_result && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-xs font-medium text-gray-500">Test Result</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {bioburden_results.test_result.test_method}: {bioburden_results.test_result.result}
                </p>
              </div>
            )}
            {bioburden_results.laboratory_information && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <label className="text-xs font-medium text-gray-500 mb-2 block">
                  Laboratory Information
                </label>
                <p className="text-sm text-gray-900">
                  {bioburden_results.laboratory_information.testing_laboratory}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Directors: {bioburden_results.laboratory_information.laboratory_directors}
                </p>
                <p className="text-xs text-gray-600">CLIA: {bioburden_results.laboratory_information.clia}</p>
              </div>
            )}
            {bioburden_results.source_document && bioburden_results.source_pages && bioburden_results.source_pages.length > 0 && (
              <div className="mt-4">
                <CitationBadge
                  pageNumber={bioburden_results.source_pages[0]}
                  documentName={bioburden_results.source_document}
                  onClick={() => onCitationClick?.(bioburden_results.source_document, bioburden_results.source_pages?.[0])}
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Toxicology Report */}
      {toxicology_report && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TestTube className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Toxicology Report</h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getConditionalStatusColor(
                toxicology_report.conditional_status
              )}`}
            >
              {toxicology_report.conditional_status}
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Condition Required</label>
              <p className="text-sm text-gray-900 mt-1">{toxicology_report.condition_required}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Toxicology Screening</label>
              <p className="text-sm text-gray-900 mt-1">
                {toxicology_report.toxicology_screening_status.performed ? 'Performed' : 'Not Performed'}
              </p>
            </div>
            {toxicology_report.source_document && toxicology_report.source_pages && toxicology_report.source_pages.length > 0 && (
              <div className="mt-4">
                <CitationBadge
                  pageNumber={toxicology_report.source_pages[0]}
                  documentName={toxicology_report.source_document}
                  onClick={() => onCitationClick?.(toxicology_report.source_document, toxicology_report.source_pages?.[0])}
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Autopsy Report */}
      {autopsy_report && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FileSearch className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Autopsy Report</h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getConditionalStatusColor(
                autopsy_report.conditional_status
              )}`}
            >
              {autopsy_report.conditional_status}
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Condition Required</label>
              <p className="text-sm text-gray-900 mt-1">{autopsy_report.condition_required}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Autopsy Performed</label>
              <p className="text-sm text-gray-900 mt-1">
                {autopsy_report.autopsy_performed ? 'Yes' : 'No'}
              </p>
            </div>
            {autopsy_report.cause_of_death && (
              <div className="bg-red-50 p-4 rounded-lg">
                <label className="text-xs font-medium text-gray-500 mb-2 block">Cause of Death</label>
                {Object.entries(autopsy_report.cause_of_death).map(([key, value]) => (
                  <div key={key} className="mb-1">
                    <span className="text-xs text-gray-600">{key}:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">{value}</span>
                  </div>
                ))}
              </div>
            )}
            {autopsy_report.key_findings && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <label className="text-xs font-medium text-gray-500 mb-2 block">Key Findings</label>
                {Object.entries(autopsy_report.key_findings).map(([key, value]) => (
                  <div key={key} className="mb-2">
                    <span className="text-xs font-medium text-gray-700">{key}:</span>
                    <p className="text-sm text-gray-900 mt-1">{value}</p>
                  </div>
                ))}
              </div>
            )}
            {autopsy_report.source_document && autopsy_report.source_pages && autopsy_report.source_pages.length > 0 && (
              <div className="mt-4">
                <CitationBadge
                  pageNumber={autopsy_report.source_pages[0]}
                  documentName={autopsy_report.source_document}
                  onClick={() => onCitationClick?.(autopsy_report.source_document, autopsy_report.source_pages?.[0])}
                />
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

