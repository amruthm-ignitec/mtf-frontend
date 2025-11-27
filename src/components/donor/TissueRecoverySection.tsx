import React from 'react';
import { TissueRecovery } from '../../types/extraction';
import TissueEligibilityAnalysis from './TissueEligibilityAnalysis';

interface TissueRecoverySectionProps {
  data: TissueRecovery;
  eligibilityData?: any[];
  onCitationClick?: (sourceDocument: string, pageNumber?: number) => void;
}

export default function TissueRecoverySection({ data, eligibilityData, onCitationClick }: TissueRecoverySectionProps) {
  return (
    <div className="space-y-6">
      {/* Tissue Eligibility Analysis */}
      <TissueEligibilityAnalysis eligibilityData={eligibilityData} />
    </div>
  );
}

