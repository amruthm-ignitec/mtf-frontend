import React from 'react';
import { DRAI } from '../../types/extraction';
import { MapPin, Calendar, Briefcase, Heart, AlertTriangle, Globe } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import CitationBadge from '../ui/CitationBadge';
import Card from '../ui/Card';

interface DRAISectionProps {
  data: DRAI;
  onCitationClick?: (sourceDocument: string, pageNumber?: number) => void;
}

export default function DRAISection({ data, onCitationClick }: DRAISectionProps) {
  const {
    interview_location,
    interview_datetime,
    occupation,
    place_of_birth,
    medical_history,
    risk_factors,
    status,
  } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Donor Risk Assessment Interview (DRAI)
        </h2>
        <StatusBadge status={status} />
      </div>

      {/* Interview Information */}
      {(interview_location || interview_datetime) && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Interview Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interview_location && (
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-sm text-gray-900 mt-1">{interview_location.value}</p>
                {interview_location.source_document && interview_location.source_pages && interview_location.source_pages.length > 0 && (
                  <div className="mt-2">
                    <CitationBadge
                      pageNumber={interview_location.source_pages[0]}
                      documentName={interview_location.source_document}
                      onClick={() => onCitationClick?.(interview_location.source_document, interview_location.source_pages?.[0])}
                    />
                  </div>
                )}
              </div>
            )}
            {interview_datetime && (
              <div>
                <label className="text-sm font-medium text-gray-500">Date/Time</label>
                <p className="text-sm text-gray-900 mt-1">{interview_datetime.value}</p>
                {interview_datetime.source_document && interview_datetime.source_pages && interview_datetime.source_pages.length > 0 && (
                  <div className="mt-2">
                    <CitationBadge
                      pageNumber={interview_datetime.source_pages[0]}
                      documentName={interview_datetime.source_document}
                      onClick={() => onCitationClick?.(interview_datetime.source_document, interview_datetime.source_pages?.[0])}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Demographics */}
      {(occupation || place_of_birth) && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Demographics</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {occupation && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-500">Occupation</label>
                </div>
                <p className="text-sm text-gray-900">{occupation.value}</p>
                {occupation.source_document && occupation.source_pages && occupation.source_pages.length > 0 && (
                  <div className="mt-2">
                    <CitationBadge
                      pageNumber={occupation.source_pages[0]}
                      documentName={occupation.source_document}
                      onClick={() => onCitationClick?.(occupation.source_document, occupation.source_pages?.[0])}
                    />
                  </div>
                )}
              </div>
            )}
            {place_of_birth && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-500">Place of Birth</label>
                </div>
                <p className="text-sm text-gray-900">{place_of_birth.value}</p>
                {place_of_birth.source_document && place_of_birth.source_pages && place_of_birth.source_pages.length > 0 && (
                  <div className="mt-2">
                    <CitationBadge
                      pageNumber={place_of_birth.source_pages[0]}
                      documentName={place_of_birth.source_document}
                      onClick={() => onCitationClick?.(place_of_birth.source_document, place_of_birth.source_pages?.[0])}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Medical History */}
      {medical_history && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Heart className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Medical History</h3>
          </div>
          {medical_history.medications && medical_history.medications.length > 0 && (
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-500 mb-2 block">Medications</label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-2">
                  {medical_history.medications.map((med, index) => (
                    <li key={index} className="text-sm text-gray-900 flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span>{med}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {medical_history.source_document && medical_history.source_pages && medical_history.source_pages.length > 0 && (
            <div className="mt-4">
              <CitationBadge
                pageNumber={medical_history.source_pages[0]}
                documentName={medical_history.source_document}
                onClick={() => onCitationClick?.(medical_history.source_document, medical_history.source_pages?.[0])}
              />
            </div>
          )}
        </Card>
      )}

      {/* Risk Factors */}
      {risk_factors && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Risk Factors</h3>
          </div>
          <div className="space-y-4">
            {risk_factors.sexual_history && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <label className="text-xs font-medium text-yellow-800 mb-1 block">
                  Sexual History
                </label>
                <p className="text-sm text-yellow-900">{risk_factors.sexual_history}</p>
              </div>
            )}
            {risk_factors.international_travel && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-1">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <label className="text-xs font-medium text-blue-800">International Travel</label>
                </div>
                <p className="text-sm text-blue-900">{risk_factors.international_travel}</p>
              </div>
            )}
          </div>
          {risk_factors.source_document && risk_factors.source_pages && risk_factors.source_pages.length > 0 && (
            <div className="mt-4">
              <CitationBadge
                pageNumber={risk_factors.source_pages[0]}
                documentName={risk_factors.source_document}
                onClick={() => onCitationClick?.(risk_factors.source_document, risk_factors.source_pages?.[0])}
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

