import React from 'react';
import { InfectiousDiseaseTesting } from '../../types/extraction';
import { FlaskConical, Building2, FileText, CheckCircle, XCircle } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import CitationBadge from '../ui/CitationBadge';
import Card from '../ui/Card';
import Table from '../ui/Table';
import { getDocumentName, Document } from '../../utils/documentUtils';

interface InfectiousDiseaseSectionProps {
  data: any; // Accept flexible data structure from backend
  serologyResults?: Record<string, string>; // Optional serology results from extraction data
  cultureResults?: Array<{ tissue_location?: string; microorganism?: string; source_page?: number }>; // Optional culture results
  criticalLabValues?: Record<string, { value: string; reference: string; unit: string }>; // Optional critical lab values
  documents?: Document[]; // Documents array for resolving document names
  onCitationClick?: (sourceDocument: string, pageNumber?: number, documentId?: number) => void;
}

export default function InfectiousDiseaseSection({ data, serologyResults, cultureResults, criticalLabValues, documents = [], onCitationClick }: InfectiousDiseaseSectionProps) {
  // Handle both old structure and new backend structure
  const summary = data?.summary || {};
  const extractedData = data?.extracted_data || {};
  const pages = data?.pages || [];
  const present = data?.present !== undefined ? data.present : true;
  
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
  
  // Old structure support (for backward compatibility)
  const serology_report = data?.serology_report;
  const other_tests = data?.other_tests;
  const status = data?.status;

  const getTestResultColor = (result?: string) => {
    if (!result) return 'text-gray-600';
    const upperResult = result.toUpperCase();
    if (upperResult.includes('NON-REACTIVE') || upperResult.includes('NEGATIVE')) {
      return 'text-green-600';
    }
    if (upperResult.includes('POSITIVE') || upperResult.includes('REACTIVE')) {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  const testFields = other_tests ? Object.values(other_tests).filter((field) => field) : [];
  
  // Extract test results from extracted_data (needed for empty-state check)
  const testResults = Object.entries(extractedData)
    .filter(([key, value]) => {
      // Filter for test objects (Test_1, Test_2, etc.) or any object that looks like a test
      if (key.startsWith('Test_') && typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return true;
      }
      return false;
    })
    .map(([key, value]) => {
      if (key.startsWith('Test_') && typeof value === 'object' && value !== null) {
        // This is a structured test object - handle both underscore and space-separated keys
        const testData = value as any;
        // Format test name: Test_1 -> Test 1
        const formattedTestName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return {
          testName: formattedTestName, // Use formatted name (Test 1, Test 2, etc.)
          result: testData['Test_Result'] || testData['Test Result'] || testData['Result'] || '-',
          specimenDate: testData['Specimen_Date_Time'] || testData['Specimen Date-Time'] || testData['Specimen_Date'] || testData['Specimen Date'] || '-',
          specimenType: testData['Specimen_Type'] || testData['Specimen Type'] || '-',
          testMethod: testData['Test_Method'] || testData['Test Method'] || '-',
          comments: testData['Comments'] || testData['Comment'] || '-',
        };
      }
      return null;
    })
    .filter(Boolean);
  
  // Check if there's any meaningful data to display
  const hasSummary = summary && Object.keys(summary).length > 0;
  const hasTestResults = testResults.length > 0;
  const hasSerologyReport = !!serology_report;
  const hasSerologyResults = serologyResults && Object.keys(serologyResults).length > 0;
  const hasCultureResults = cultureResults && cultureResults.length > 0;
  const hasCriticalLabValues = criticalLabValues && Object.keys(criticalLabValues).length > 0;
  const hasOtherTests = other_tests && Object.keys(other_tests).length > 0;
  const hasPages = pages && pages.length > 0;
  
  // Aggregate check: if no data sources have content, show empty state
  if (!hasSummary && !hasTestResults && !hasSerologyReport && !hasSerologyResults && 
      !hasCultureResults && !hasCriticalLabValues && !hasOtherTests && !hasPages) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Infectious Disease Testing</h2>
          <p className="text-sm text-gray-500">No infectious disease testing data available for this donor.</p>
        </div>
      </Card>
    );
  }

  // Helper function to format value for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '-';
    }
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
    if (Array.isArray(value)) {
      return value.map(item => formatValue(item)).join(', ');
    }
    if (typeof value === 'object') {
      const entries = Object.entries(value)
        .filter(([_, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => {
          const formattedKey = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          const formattedValue = formatValue(v);
          return `${formattedKey}: ${formattedValue}`;
        });
      return entries.length > 0 ? entries.join('; ') : '-';
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Infectious Disease Testing</h2>
        {status ? (
          <StatusBadge status={status} />
        ) : present !== undefined && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            present ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {present ? 'Present' : 'Not Present'}
          </span>
        )}
      </div>

      {/* Summary Section - New Backend Structure */}
      {summary && Object.keys(summary).length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(summary).map(([key, value]) => {
              const formattedValue = formatValue(value);
              if (!formattedValue || formattedValue === '-') return null;
              
              return (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{formattedValue}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Infectious Disease Serology Section - Display all serology results */}
      {serologyResults && Object.keys(serologyResults).length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FlaskConical className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Infectious Disease Serology</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(serologyResults).map(([testName, resultData]) => {
              // Handle both new format (object with result and method) and legacy format (just result string)
              const resultValue = typeof resultData === 'object' && resultData !== null && 'result' in resultData
                ? resultData.result
                : resultData;
              const method = typeof resultData === 'object' && resultData !== null && 'method' in resultData
                ? resultData.method
                : null;
              
              const resultStr = String(resultValue).toLowerCase().trim();
              // First check for negative patterns - if found, it's NOT positive
              const negativePatterns = ['non-reactive', 'non reactive', 'nonreactive', 'negative', 'neg'];
              const isNegative = negativePatterns.some(pattern => resultStr.includes(pattern));
              
              // Only check for positive if it's not negative
              const isPositive = !isNegative && (resultStr.includes('positive') || resultStr.includes('reactive'));
              
              return (
                <div
                  key={testName}
                  className="bg-white rounded-lg border border-gray-200 p-3"
                >
                  <div className="text-xs font-medium text-gray-700 mb-1.5">
                    {testName}
                  </div>
                  {method && (
                    <div className="text-xs text-gray-500 mb-1 italic">
                      {method}
                    </div>
                  )}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                    isPositive 
                      ? 'bg-red-100 text-red-700 border border-red-200' 
                      : 'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {String(resultValue)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Test Results from Extracted Data - New Backend Structure */}
      {testResults.length > 0 && (
        <Card className="p-8">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FlaskConical className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Test Results</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testResults.map((test, index) => {
              const upperResult = (test?.result || '').toUpperCase();
              const isPositive = upperResult.includes('POSITIVE') || upperResult.includes('REACTIVE') || upperResult.includes('INDETERMINATE');
              const isNegative = upperResult.includes('NON-REACTIVE') || upperResult.includes('NEGATIVE');
              const dotColor = isPositive ? 'bg-red-500' : isNegative ? 'bg-green-500' : 'bg-gray-400';
              
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-400 transition-all flex flex-col"
                >
                  {/* Test Name */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[2.5rem] leading-snug">
                      {test?.testName || 'Unknown Test'}
                    </h4>
                    
                    {/* Result */}
                    {test?.result && test.result !== '-' ? (
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${dotColor} ring-2 ring-offset-1 ${
                          isPositive ? 'ring-red-200' : isNegative ? 'ring-green-200' : 'ring-gray-200'
                        }`}></div>
                        <span className={`text-sm font-semibold truncate ${getTestResultColor(test.result)}`}>
                          {test.result}
                        </span>
                      </div>
                    ) : null}

                    {/* Additional Test Details */}
                    {(test?.specimenDate && test.specimenDate !== '-') && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500">Specimen Date</p>
                        <p className="text-xs font-medium text-gray-900">{test.specimenDate}</p>
                      </div>
                    )}
                    {(test?.specimenType && test.specimenType !== '-') && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500">Specimen Type</p>
                        <p className="text-xs font-medium text-gray-900">{test.specimenType}</p>
                      </div>
                    )}
                    {(test?.testMethod && test.testMethod !== '-') && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500">Test Method</p>
                        <p className="text-xs font-medium text-gray-900">{test.testMethod}</p>
                      </div>
                    )}
                    {(test?.comments && test.comments !== '-' && test.comments !== '--') && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500">Comments</p>
                        <p className="text-xs font-medium text-gray-900">{test.comments}</p>
                      </div>
                    )}
                  </div>

                  {/* Citation */}
                  {pages && pages.length > 0 && (
                    <div className="mt-auto pt-4 border-t border-gray-100">
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
                              onClick={() => onCitationClick?.(documentName || 'Infectious Disease Testing', page, documentId)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Serology Report - Old Structure Support */}
      {serology_report && (
        <Card className="p-8">
          {/* Header Section */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Serology Report</h3>
                  {serology_report.report_type && (
                    <p className="text-sm text-gray-500 mt-1">{serology_report.report_type}</p>
                  )}
                </div>
              </div>
              {other_tests?.report_status && (
                <div className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                  <span className="text-xs font-semibold text-green-700">
                    {other_tests.report_status.result}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {/* Row 1: Infectious Disease Serology (3/4) + Culture Results (1/4) */}
            <div className="grid grid-cols-4 gap-6">
              {/* Infectious Disease Serology - 3 columns */}
              <div className="col-span-3 flex flex-col">
                <div className="flex items-center space-x-2 mb-5">
                  <div className="h-1 w-1 bg-blue-600 rounded-full"></div>
                  <h4 className="text-base font-bold text-gray-900">Infectious Disease Serology</h4>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5 flex-1">
                  {serologyResults && Object.keys(serologyResults).length > 0 ? (
                    <div className="grid grid-cols-3 gap-4 h-full">
                      {Object.entries(serologyResults).map(([testName, resultData]) => {
                        // Handle both new format (object with result and method) and legacy format (just result string)
                        const resultValue = typeof resultData === 'object' && resultData !== null && 'result' in resultData
                          ? resultData.result
                          : resultData;
                        const method = typeof resultData === 'object' && resultData !== null && 'method' in resultData
                          ? resultData.method
                          : null;
                        
                        const resultStr = String(resultValue).toLowerCase().trim();
                        // First check for negative patterns - if found, it's NOT positive
                        const negativePatterns = ['non-reactive', 'non reactive', 'nonreactive', 'negative', 'neg'];
                        const isNegative = negativePatterns.some(pattern => resultStr.includes(pattern));
                        
                        // Only check for positive if it's not negative
                        const isPositive = !isNegative && (resultStr.includes('positive') || resultStr.includes('reactive'));
                        return (
                          <div
                            key={testName}
                            className="bg-white rounded-lg border border-gray-200 p-3"
                          >
                            <div className="text-xs font-medium text-gray-700 mb-1.5">
                              {testName}
                            </div>
                            {method && (
                              <div className="text-xs text-gray-500 mb-1 italic">
                                {method}
                              </div>
                            )}
                            <div className={`text-sm font-semibold ${
                              isPositive ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {String(resultValue)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No serology results available</p>
                  )}
                </div>
              </div>

              {/* Culture Results - 1 column, stacked */}
              <div className="col-span-1 flex flex-col">
                <div className="flex items-center space-x-2 mb-5">
                  <div className="h-1 w-1 bg-purple-600 rounded-full"></div>
                  <h4 className="text-base font-bold text-gray-900">Culture Results</h4>
                </div>
                <div className="space-y-4 flex-1">
                  {cultureResults && cultureResults.length > 0 ? (
                    cultureResults.map((culture, idx) => {
                      const hasGrowth = culture.microorganism && 
                        culture.microorganism.toLowerCase() !== 'no growth' && 
                        culture.microorganism.toLowerCase() !== 'negative';
                      const microorganism = culture.microorganism || 'No Growth';
                      
                      return (
                        <div 
                          key={idx}
                          className="bg-white rounded-lg border border-gray-200 p-4"
                        >
                          <div className="text-xs font-semibold text-gray-900 mb-2">
                            {culture.tissue_location || 'Culture'}
                          </div>
                          <div className={`text-sm font-semibold mb-1 ${
                            hasGrowth ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {microorganism}
                          </div>
                          {(culture as any).collection_date && (
                            <div className="text-xs text-gray-500 mt-1">
                              Collected: {(culture as any).collection_date}
                            </div>
                          )}
                          {(culture as any).preliminary_result && (
                            <div className="text-xs text-gray-500 mt-1">
                              {(culture as any).preliminary_result}
                            </div>
                          )}
                          {(culture as any).status && (culture as any).status.toLowerCase() === 'pending' && (
                            <div className="text-xs text-orange-600 font-medium mt-1">
                              Pending
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <p className="text-sm text-gray-500">No culture results available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: Critical Lab Values (1/2) + Sample Information (1/2) */}
            <div className={`grid gap-6 ${(other_tests?.sample_date || other_tests?.sample_time || other_tests?.sample_type_1) ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {/* Critical Lab Values - 1/2 width, 2x2 grid */}
              <div>
                <div className="flex items-center space-x-2 mb-5">
                  <div className="h-1 w-1 bg-indigo-600 rounded-full"></div>
                  <h4 className="text-base font-bold text-gray-900">Critical Lab Values</h4>
                </div>
                {criticalLabValues && Object.keys(criticalLabValues).length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(criticalLabValues).map(([label, labValue]) => (
                      <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            {label}
                          </p>
                          <div className="flex items-baseline space-x-1">
                            <span className="text-lg font-bold text-gray-900">{labValue.value}</span>
                          </div>
                          </div>
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Reference: <span className="font-medium text-gray-700">{labValue.reference}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">No critical lab values available</p>
                  </div>
                )}
              </div>

              {/* Sample Information - 1/2 width */}
              {(other_tests?.sample_date || other_tests?.sample_time || other_tests?.sample_type_1) && (
                <div>
                  <div className="flex items-center space-x-2 mb-5">
                    <div className="h-1 w-1 bg-teal-600 rounded-full"></div>
                    <h4 className="text-base font-bold text-gray-900">Sample Information</h4>
                  </div>
                  <div className="bg-gradient-to-br from-teal-50 to-white rounded-xl border border-teal-200 p-5 h-full">
                    <div className="grid grid-cols-1 gap-4">
                      {other_tests.sample_date && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Sample Date</p>
                          <p className="text-sm font-semibold text-gray-900">{other_tests.sample_date.result}</p>
                        </div>
                      )}
                      {other_tests.sample_time && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Sample Time</p>
                          <p className="text-sm font-semibold text-gray-900">{other_tests.sample_time.result}</p>
                        </div>
                      )}
                      {other_tests.sample_type_1 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Sample Type</p>
                          <p className="text-sm font-semibold text-gray-900">{other_tests.sample_type_1.result}</p>
                          {other_tests.sample_type_2 && (
                            <p className="text-sm font-semibold text-gray-900 mt-1">{other_tests.sample_type_2.result}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Citation */}
            {serology_report.source_document && (
              <div className="pt-4 border-t border-gray-200">
                <CitationBadge
                  pageNumber={1}
                  documentName={getDocumentName(documents, (serology_report as any).document_id) || serology_report.source_document}
                  documentId={(serology_report as any).document_id}
                  onClick={() => onCitationClick?.(serology_report.source_document, 1, (serology_report as any).document_id)}
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Laboratory Information */}
      {other_tests && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Building2 className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Laboratory Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {other_tests.laboratory_name && (
              <div>
                <label className="text-xs font-medium text-gray-500">Laboratory Name</label>
                <p className="text-sm text-gray-900 mt-1">{other_tests.laboratory_name.result}</p>
              </div>
            )}
            {other_tests.laboratory_address && (
              <div>
                <label className="text-xs font-medium text-gray-500">Address</label>
                <p className="text-sm text-gray-900 mt-1">{other_tests.laboratory_address.result}</p>
              </div>
            )}
            {other_tests.phone && (
              <div>
                <label className="text-xs font-medium text-gray-500">Phone</label>
                <p className="text-sm text-gray-900 mt-1">
                  {other_tests.phone.result || 'Not specified'}
                </p>
              </div>
            )}
            {other_tests.fax && (
              <div>
                <label className="text-xs font-medium text-gray-500">Fax</label>
                <p className="text-sm text-gray-900 mt-1">
                  {other_tests.fax.result || 'Not specified'}
                </p>
              </div>
            )}
            {other_tests.fda && (
              <div>
                <label className="text-xs font-medium text-gray-500">FDA</label>
                <p className="text-sm text-gray-900 mt-1">{other_tests.fda.result}</p>
              </div>
            )}
            {other_tests.clia && (
              <div>
                <label className="text-xs font-medium text-gray-500">CLIA</label>
                <p className="text-sm text-gray-900 mt-1">{other_tests.clia.result}</p>
              </div>
            )}
            {other_tests.category && (
              <div>
                <label className="text-xs font-medium text-gray-500">Category</label>
                <p className="text-sm text-gray-900 mt-1">{other_tests.category.result}</p>
              </div>
            )}
            {other_tests.ashi && (
              <div>
                <label className="text-xs font-medium text-gray-500">ASHI</label>
                <p className="text-sm text-gray-900 mt-1">{other_tests.ashi.result}</p>
              </div>
            )}
            {other_tests.client && (
              <div>
                <label className="text-xs font-medium text-gray-500">Client</label>
                <p className="text-sm text-gray-900 mt-1">{other_tests.client.result}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Sample Information */}
      {other_tests && (other_tests.sample_date || other_tests.sample_time || other_tests.sample_type_1) && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FlaskConical className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Sample Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {other_tests.sample_date && (
              <div>
                <label className="text-xs font-medium text-gray-500">Sample Date</label>
                <p className="text-sm text-gray-900 mt-1">{other_tests.sample_date.result}</p>
              </div>
            )}
            {other_tests.sample_time && (
              <div>
                <label className="text-xs font-medium text-gray-500">Sample Time</label>
                <p className="text-sm text-gray-900 mt-1">{other_tests.sample_time.result}</p>
              </div>
            )}
            {other_tests.sample_type_1 && (
              <div>
                <label className="text-xs font-medium text-gray-500">Sample Type 1</label>
                <p className="text-sm text-gray-900 mt-1">{other_tests.sample_type_1.result}</p>
              </div>
            )}
            {other_tests.sample_type_2 && (
              <div>
                <label className="text-xs font-medium text-gray-500">Sample Type 2</label>
                <p className="text-sm text-gray-900 mt-1">{other_tests.sample_type_2.result}</p>
              </div>
            )}
            {other_tests.report_generated && (
              <div>
                <label className="text-xs font-medium text-gray-500">Report Generated</label>
                <p className="text-sm text-gray-900 mt-1">{other_tests.report_generated.result}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Test Results - Old Structure Support */}
      {testFields.length > 0 && !testResults.length && (
        <Card className="p-8">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FlaskConical className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Test Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testFields.map((field, index) => {
              const upperResult = field.result?.toUpperCase() || '';
              const isPositive = upperResult.includes('POSITIVE') || upperResult.includes('REACTIVE');
              const isNegative = upperResult.includes('NON-REACTIVE') || upperResult.includes('NEGATIVE');
              const dotColor = isPositive ? 'bg-red-500' : isNegative ? 'bg-green-500' : 'bg-gray-400';
              
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-400 transition-all flex flex-col group"
                >
                  {/* Test Name */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[2.5rem] leading-snug">
                      {field.test_name}
                    </h4>
                    
                    {/* Result */}
                    {field.result ? (
                      <div className="flex items-center gap-2.5">
                        <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${dotColor} ring-2 ring-offset-1 ${
                          isPositive ? 'ring-red-200' : isNegative ? 'ring-green-200' : 'ring-gray-200'
                        }`}></div>
                        <span className={`text-sm font-semibold truncate ${getTestResultColor(field.result)}`}>
                          {field.result}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-gray-300 flex-shrink-0"></div>
                        <span className="text-sm text-gray-400">Not specified</span>
                      </div>
                    )}
                  </div>

                  {/* Citation - Compact single line */}
                  {field.source_document && field.source_page && (
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <button
                        onClick={() => onCitationClick?.(field.source_document, field.source_page, field.document_id)}
                        className="w-full inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 transition-all text-xs font-medium group-hover:shadow-sm"
                        title={field.source_document ? `${field.source_document} - Page ${field.source_page}` : `Page ${field.source_page}`}
                      >
                        <FileText className="w-3 h-3 flex-shrink-0" />
                        <span className="flex-1 min-w-0 overflow-hidden text-left">
                          <span className="truncate block">{field.source_document}</span>
                        </span>
                        <span className="text-red-600 font-semibold flex-shrink-0 ml-1.5">[P{field.source_page}]</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Report Information */}
      {other_tests && (other_tests.report_status || other_tests.page_number) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {other_tests.report_status && (
              <div>
                <label className="text-xs font-medium text-gray-500">Report Status</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {other_tests.report_status.result}
                </p>
              </div>
            )}
            {other_tests.page_number && (
              <div>
                <label className="text-xs font-medium text-gray-500">Page Number</label>
                <p className="text-sm text-gray-900 mt-1">{other_tests.page_number.result}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Source Pages - New Backend Structure */}
      {pages && pages.length > 0 && !serology_report && (
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
                  onClick={() => onCitationClick?.(documentName || 'Infectious Disease Testing', page, documentId)}
                />
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

