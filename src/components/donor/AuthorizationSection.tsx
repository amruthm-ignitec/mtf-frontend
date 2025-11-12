import React from 'react';
import { Authorization } from '../../types/extraction';
import { FileText, User, Calendar, CheckCircle } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import CitationBadge from '../ui/CitationBadge';
import Card from '../ui/Card';

interface AuthorizationSectionProps {
  data: Authorization;
  onCitationClick?: (sourceDocument: string, pageNumber?: number) => void;
}

export default function AuthorizationSection({ data, onCitationClick }: AuthorizationSectionProps) {
  const { form_type, form_use, authorized_party, authorization_datetime, status } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Authorization & Consent</h2>
        <StatusBadge status={status} />
      </div>

      {/* Form Information */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Form Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Form Type</label>
            <p className="text-sm text-gray-900 mt-1">{form_type}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Form Use</label>
            <p className="text-sm text-gray-900 mt-1">{form_use}</p>
          </div>
        </div>
      </Card>

      {/* Authorized Party */}
      {authorized_party && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Authorized Party</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-sm text-gray-900 mt-1">{authorized_party.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Relationship</label>
              <p className="text-sm text-gray-900 mt-1">{authorized_party.relationship}</p>
            </div>
          </div>
          {authorized_party.source_document && authorized_party.source_page && (
            <div className="mt-4">
              <CitationBadge
                pageNumber={authorized_party.source_page}
                documentName={authorized_party.source_document}
                onClick={() => onCitationClick?.(authorized_party.source_document, authorized_party.source_page)}
              />
            </div>
          )}
        </Card>
      )}

      {/* Authorization Date/Time */}
      {authorization_datetime && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Authorization Timeline</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <label className="text-xs font-medium text-gray-500">Authorization Date/Time</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {authorization_datetime.authorization_datetime}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <label className="text-xs font-medium text-gray-500">Signature Date/Time</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {authorization_datetime.signature_datetime}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-xs font-medium text-gray-500">Signature Type</label>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {authorization_datetime.signature_type}
              </p>
            </div>
          </div>
          {authorization_datetime.source_document && (
            <div className="mt-4">
              <CitationBadge
                pageNumber={1}
                documentName={authorization_datetime.source_document}
                onClick={() => onCitationClick?.(authorization_datetime.source_document, 1)}
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

