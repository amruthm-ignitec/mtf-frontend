export type CriticalFinding = {
  type: 'HIV' | 'HBV' | 'HCV' | 'CJD' | 'ActiveTB';
  severity: 'CRITICAL';
  automaticRejection: true;
  detectedAt: Date;
  source: {
    documentId: string;
    pageNumber: number;
    confidence: number;
  };
};

export interface DonorScreeningStatus {
  hasCriticalFindings: boolean;
  criticalFindings: CriticalFinding[];
  screeningHalted: boolean;
  rejectionReason: string;
} 