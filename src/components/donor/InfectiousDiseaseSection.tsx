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
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Serology Report</h3>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-900">{serology_report.report_type}</p>
            {serology_report.source_document && (
              <div className="mt-2">
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

      {/* Test Results Table */}
      {testFields.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Citation
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testFields.map((field, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {field.test_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {field.result ? (
                        <span className={`text-sm font-medium ${getTestResultColor(field.result)}`}>
                          {field.result}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Not specified</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {field.source_document && field.source_page && (
                        <CitationBadge
                          pageNumber={field.source_page}
                          documentName={field.source_document}
                          onClick={() => onCitationClick?.(field.source_document, field.source_page)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

