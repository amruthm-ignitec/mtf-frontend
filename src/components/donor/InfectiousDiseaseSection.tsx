import React from 'react';
import { InfectiousDiseaseTesting } from '../../types/extraction';
import { FlaskConical, Building2, FileText, CheckCircle, XCircle } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import CitationBadge from '../ui/CitationBadge';
import Card from '../ui/Card';
import Table from '../ui/Table';

interface InfectiousDiseaseSectionProps {
  data: InfectiousDiseaseTesting;
  onCitationClick?: (sourceDocument: string, pageNumber?: number) => void;
}

export default function InfectiousDiseaseSection({ data, onCitationClick }: InfectiousDiseaseSectionProps) {
  const { serology_report, other_tests, status } = data;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Infectious Disease Testing</h2>
        <StatusBadge status={status} />
      </div>

      {/* Serology Report */}
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
                  <div className="grid grid-cols-2 gap-3 h-full">
                    {[
                      { test: 'HIV 1/2 Ab/Ag', result: 'Non-reactive', isReactive: false },
                      { test: 'HBsAg', result: 'Non-reactive', isReactive: false },
                      { test: 'HBcAb', result: 'Non-reactive', isReactive: false },
                      { test: 'HCV Ab', result: 'Non-reactive', isReactive: false },
                      { test: 'CMV IgG', result: 'Reactive', isReactive: true },
                      { test: 'CMV IgM', result: 'Non-reactive', isReactive: false },
                      { test: 'Treponema pallidum', result: 'Non-reactive', isReactive: false },
                      { test: 'HTLV I/II', result: 'Non-reactive', isReactive: false },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          item.isReactive
                            ? 'bg-white border-orange-200 hover:border-orange-300'
                            : 'bg-white border-green-200 hover:border-green-300'
                        }`}
                      >
                        <span className="text-sm font-medium text-gray-700">{item.test}</span>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${
                            item.isReactive ? 'bg-orange-500' : 'bg-green-500'
                          }`}></div>
                          <span className={`text-sm font-semibold ${
                            item.isReactive ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {item.result}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Culture Results - 1 column, stacked */}
              <div className="col-span-1 flex flex-col">
                <div className="flex items-center space-x-2 mb-5">
                  <div className="h-1 w-1 bg-purple-600 rounded-full"></div>
                  <h4 className="text-base font-bold text-gray-900">Culture Results</h4>
                </div>
                <div className="space-y-4 flex-1">
                  <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-200 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="text-sm font-semibold text-gray-900 mb-1">Blood Culture</h5>
                        <p className="text-xs text-gray-500">72 hours</p>
                      </div>
                      <div className="px-2.5 py-1 bg-green-100 rounded-full">
                        <span className="text-xs font-semibold text-green-700">No Growth</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-green-200">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Collected:</span> March 11, 2024
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl border border-yellow-200 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="text-sm font-semibold text-gray-900 mb-1">Tissue Recovery Swabs</h5>
                        <p className="text-xs text-gray-500">48-hour preliminary</p>
                      </div>
                      <div className="px-2.5 py-1 bg-yellow-100 rounded-full">
                        <span className="text-xs font-semibold text-yellow-700">Pending</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-yellow-200">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Preliminary:</span> No Growth
                      </p>
                    </div>
                  </div>
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
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'WBC', value: '8.2 x 10³/μL', reference: '3.5-10.5', unit: 'x 10³/μL' },
                    { label: 'Hemoglobin', value: '13.8', reference: '12.0-15.5', unit: 'g/dL' },
                    { label: 'Platelets', value: '245 x 10³/μL', reference: '150-450', unit: 'x 10³/μL' },
                    { label: 'Creatinine', value: '0.9', reference: '0.6-1.2', unit: 'mg/dL' },
                  ].map((item, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          {item.label}
                        </p>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-lg font-bold text-gray-900">{item.value}</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Reference: <span className="font-medium text-gray-700">{item.reference}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
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
                  documentName={serology_report.source_document}
                  onClick={() => onCitationClick?.(serology_report.source_document, 1)}
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

      {/* Test Results - Modern Card Layout */}
      {testFields.length > 0 && (
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
                        onClick={() => onCitationClick?.(field.source_document, field.source_page)}
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
    </div>
  );
}

