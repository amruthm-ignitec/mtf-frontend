import React from 'react';
import { MedicalRecordsReview } from '../../types/extraction';
import { FileText, User, ClipboardList } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import ConfidenceScore from '../ui/ConfidenceScore';
import SourceDocumentLink from '../ui/SourceDocumentLink';
import Card from '../ui/Card';

interface MedicalRecordsReviewSectionProps {
  data: MedicalRecordsReview;
}

export default function MedicalRecordsReviewSection({
  data,
}: MedicalRecordsReviewSectionProps) {
  const { status, confidence } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Medical Records Review</h2>
        <StatusBadge status={status} />
      </div>

      {/* Review Information */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <ClipboardList className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Review Status</h3>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700">
            Medical records have been reviewed and validated for this donor case.
          </p>
        </div>
      </Card>

      {/* Source Document */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Source Information</h3>
        <div className="space-y-2">
          <SourceDocumentLink
            document={{
              source_document: data.source_document,
              source_pages: data.source_pages,
            }}
          />
          {confidence && <ConfidenceScore confidence={confidence} />}
        </div>
      </Card>
    </div>
  );
}

