import React from 'react';
import { PlasmaDilution } from '../../types/extraction';
import { Droplets, Scale, Calculator } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import ConfidenceScore from '../ui/ConfidenceScore';
import SourceDocumentLink from '../ui/SourceDocumentLink';
import Card from '../ui/Card';

interface PlasmaDilutionSectionProps {
  data: PlasmaDilution;
}

export default function PlasmaDilutionSection({ data }: PlasmaDilutionSectionProps) {
  const { transfusion_status, status, confidence } = data;

  // Calculate TPV and TBV based on weight
  const calculateTPV = (weightKg: number) => {
    return weightKg / 0.025;
  };

  const calculateTBV = (weightKg: number) => {
    return weightKg / 0.015;
  };

  const tpv = transfusion_status.donor_weight_kg
    ? calculateTPV(transfusion_status.donor_weight_kg)
    : 0;
  const tbv = transfusion_status.donor_weight_kg
    ? calculateTBV(transfusion_status.donor_weight_kg)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Plasma Dilution</h2>
        <StatusBadge status={status} />
      </div>

      {/* Transfusion Status */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Droplets className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Transfusion Status</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <label className="text-xs font-medium text-gray-500">Transfused</label>
            <p className="text-lg font-semibold text-red-900 mt-1">
              {transfusion_status.transfused ? 'Yes' : 'No'}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Scale className="w-4 h-4 text-gray-500" />
              <label className="text-xs font-medium text-gray-500">Donor Weight</label>
            </div>
            <p className="text-lg font-semibold text-blue-900">
              {transfusion_status.donor_weight_kg} kg
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-4">
          <ConfidenceScore confidence={transfusion_status.confidence} />
          <SourceDocumentLink
            document={{
              source_document: transfusion_status.source_document,
            }}
          />
        </div>
      </Card>

      {/* Volume Calculations */}
      {transfusion_status.donor_weight_kg > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calculator className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Estimated Volumes</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <label className="text-xs font-medium text-gray-500">Total Plasma Volume (TPV)</label>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {tpv.toFixed(2)} mls
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Calculated: {transfusion_status.donor_weight_kg} kg / 0.025
              </p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <label className="text-xs font-medium text-gray-500">Total Blood Volume (TBV)</label>
              <p className="text-2xl font-bold text-indigo-900 mt-1">
                {tbv.toFixed(2)} mls
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Calculated: {transfusion_status.donor_weight_kg} kg / 0.015
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Source Document */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span className="font-medium">Source:</span>
        <SourceDocumentLink
          document={{
            source_document: data.source_document,
            source_pages: data.source_pages,
          }}
        />
        {confidence && <ConfidenceScore confidence={confidence} />}
      </div>
    </div>
  );
}

