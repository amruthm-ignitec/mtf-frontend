import React from 'react';
import { PhysicalAssessment } from '../../types/extraction';
import { User, Ruler, Scale, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import CitationBadge from '../ui/CitationBadge';
import Card from '../ui/Card';

interface PhysicalAssessmentSectionProps {
  data: PhysicalAssessment;
  onCitationClick?: (sourceDocument: string, pageNumber?: number) => void;
}

export default function PhysicalAssessmentSection({
  data,
  onCitationClick,
}: PhysicalAssessmentSectionProps) {
  const { exam_performed_by, anthropometric_measurements, physical_findings, status } = data;

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
        <StatusBadge status={status} />
      </div>

      {/* Exam Performed By */}
      {exam_performed_by && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Exam Performed By</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-sm text-gray-900 mt-1">{exam_performed_by.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Title</label>
              <p className="text-sm text-gray-900 mt-1">{exam_performed_by.title}</p>
            </div>
          </div>
          {exam_performed_by.source_document && exam_performed_by.source_page && (
            <div className="mt-4">
              <CitationBadge
                pageNumber={exam_performed_by.source_page}
                documentName={exam_performed_by.source_document}
                onClick={() => onCitationClick?.(exam_performed_by.source_document, exam_performed_by.source_page)}
              />
            </div>
          )}
        </Card>
      )}

      {/* Anthropometric Measurements */}
      {anthropometric_measurements && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Ruler className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Anthropometric Measurements</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {anthropometric_measurements.height && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Ruler className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-500">Height</label>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {anthropometric_measurements.height.value.trim()}{' '}
                  {anthropometric_measurements.height.unit}
                </p>
                {anthropometric_measurements.height.source_document && anthropometric_measurements.height.source_page && (
                  <div className="mt-2">
                    <CitationBadge
                      pageNumber={anthropometric_measurements.height.source_page}
                      documentName={anthropometric_measurements.height.source_document}
                      onClick={() => onCitationClick?.(anthropometric_measurements.height.source_document, anthropometric_measurements.height.source_page)}
                    />
                  </div>
                )}
              </div>
            )}
            {anthropometric_measurements.weight && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Scale className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-500">Weight</label>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {anthropometric_measurements.weight.value.trim()}{' '}
                  {anthropometric_measurements.weight.unit}
                </p>
                {anthropometric_measurements.weight.source_document && anthropometric_measurements.weight.source_page && (
                  <div className="mt-2">
                    <CitationBadge
                      pageNumber={anthropometric_measurements.weight.source_page}
                      documentName={anthropometric_measurements.weight.source_document}
                      onClick={() => onCitationClick?.(anthropometric_measurements.weight.source_document, anthropometric_measurements.weight.source_page)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Physical Findings */}
      {physical_findings && (
        <>
          {/* Cleanliness */}
          {physical_findings.cleanliness && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cleanliness</h3>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                {physical_findings.cleanliness}
              </div>
            </Card>
          )}

          {/* Visual Findings */}
          {physical_findings.visual_findings && (
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Eye className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Visual Findings</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(physical_findings.visual_findings).map(([key, value]) => {
                  const status = getFindingStatus(value);
                  const StatusIcon = status.icon;
                  return (
                    <div
                      key={key}
                      className={`${status.bgColor} p-3 rounded-lg border border-gray-200`}
                    >
                      <div className="flex items-start space-x-2">
                        <StatusIcon className={`w-4 h-4 mt-0.5 ${status.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700 mb-1">{key}</p>
                          <p className="text-sm text-gray-900 break-words">{value}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Body Condition */}
          {physical_findings.body_condition && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Body Condition</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {physical_findings.body_condition.Color && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <label className="text-xs font-medium text-gray-500">Color</label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {physical_findings.body_condition.Color}
                    </p>
                  </div>
                )}
                {physical_findings.body_condition.Temperature && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <label className="text-xs font-medium text-gray-500">Temperature</label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {physical_findings.body_condition.Temperature}
                    </p>
                  </div>
                )}
                {physical_findings.body_condition.Temp && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <label className="text-xs font-medium text-gray-500">Temp</label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {physical_findings.body_condition.Temp}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Abnormalities */}
          {physical_findings.abnormalities && (
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">Abnormalities</h3>
              </div>
              {physical_findings.abnormalities.Comments && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-900">{physical_findings.abnormalities.Comments}</p>
                </div>
              )}
            </Card>
          )}

          {/* Source Document */}
          {physical_findings.source_document && physical_findings.source_page && (
            <div className="mt-4">
              <CitationBadge
                pageNumber={physical_findings.source_page}
                documentName={physical_findings.source_document}
                onClick={() => onCitationClick?.(physical_findings.source_document, physical_findings.source_page)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

