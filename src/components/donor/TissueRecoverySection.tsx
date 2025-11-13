import React from 'react';
import { TissueRecovery } from '../../types/extraction';
import { Package, MapPin } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import CitationBadge from '../ui/CitationBadge';
import Card from '../ui/Card';
import TissueEligibilityAnalysis from './TissueEligibilityAnalysis';

interface TissueRecoverySectionProps {
  data: TissueRecovery;
  onCitationClick?: (sourceDocument: string, pageNumber?: number) => void;
}

export default function TissueRecoverySection({ data, onCitationClick }: TissueRecoverySectionProps) {
  const { total_tissues_recovered, recovery_site, status, confidence } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Tissue Recovery</h2>
        <StatusBadge status={status} />
      </div>

      {/* Recovery Summary */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Package className="w-5 h-5 text-blue-600" />
              <label className="text-sm font-medium text-gray-500">Total Tissues Recovered</label>
            </div>
            <p className="text-2xl font-bold text-blue-900">{total_tissues_recovered}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <label className="text-sm font-medium text-gray-500">Recovery Site</label>
            </div>
            <p className="text-lg font-semibold text-green-900">{recovery_site}</p>
          </div>
        </div>
      </Card>

      {/* Tissue Eligibility Analysis */}
      <TissueEligibilityAnalysis />
    </div>
  );
}

