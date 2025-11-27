import React from 'react';
import { TissueRecovery } from '../../types/extraction';
import TissueEligibilityAnalysis from './TissueEligibilityAnalysis';

interface TissueRecoverySectionProps {
  data: TissueRecovery;
  onCitationClick?: (sourceDocument: string, pageNumber?: number) => void;
}

export default function TissueRecoverySection({ data, onCitationClick }: TissueRecoverySectionProps) {
  return (
    <div className="space-y-6">
      {/* Tissue Eligibility Analysis */}
      <TissueEligibilityAnalysis />
    </div>
  );
}

