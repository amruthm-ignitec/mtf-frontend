export interface DonorRecord {
  id: string;
  donorName: string;
  age: number;
  gender: string;
  causeOfDeath: string;
  uploadTimestamp: Date;
  processingStatus: ProcessingStatus;
  status: ProcessingStatus;
  documents: Array<{
    id: string;
    fileName: string;
    fileType: string;
    uploadTimestamp: Date;
    status: string;
  }>;
  findings: FindingSummary[];
  requiredDocuments: RequiredDocument[];
  criticalFindings?: CriticalFinding[];
  screeningStatus?: 'ACTIVE' | 'HALTED' | 'REJECTED';
  rejectionReason?: string;
}

// Add speech recognition types
export interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

export interface SpeechRecognitionErrorEvent {
  error: string;
}

// Add this interface
export interface MDSummarySection {
  title: string;
  status: 'Normal' | 'Abnormal' | 'No' | 'Yes' | 'Reviewed' | 'Attention Required' | 'Completed' | 'Verified';
  details: string;
  pageReferences: string[];
  aiConfidence?: number;
  reviewedAt?: string;
  reviewedBy?: string;
}

// Add ProcessingStatus type
export type ProcessingStatus = 'completed' | 'processing' | 'pending' | 'failed' | 'rejected';

// Add these interfaces
export interface FindingSummary {
  id: string;
  category: string;
  description: string;
  severity: FindingSeverity;
  type: FindingType;
  aiConfidence: number;
  citations: FindingCitation[];
}

export type FindingSeverity = 'critical' | 'moderate' | 'low' | 'good';
export type FindingType = 'contraindication' | 'quality' | 'risk';

export interface FindingCitation {
  id: string;
  pageNumber: number;
  context: string;
  documentId: string;
}

export interface TissueAnalysis {
  id: string;
  name: string;
  status: string;
  probabilityScore: number;
  side?: string;
  factors: Array<{
    name: string;
    description: string;
    impact: string;
    confidence: number;
  }>;
  similarCases?: {
    count: number;
    successRate: number;
  };
}

export interface CVTissueAnalysis extends TissueAnalysis {
  tissueType: string;
  measurements?: {
    size: string;
    length?: string;
  };
}

// Add RequiredDocument type that was missing
export interface RequiredDocument {
  id: string;
  name: string;
  type: string;
  label: string;
  status: 'completed' | 'processing' | 'missing' | 'uploaded' | 'invalid';
  isRequired: boolean;
  uploadDate: Date;
  reviewedBy: string;
  notes: string;
  pageCount: number;
}

// Add CriticalFinding type
export interface CriticalFinding {
  type: 'HIV' | 'HBV' | 'HCV' | 'CJD' | 'ActiveTB';
  severity: 'CRITICAL';
  automaticRejection: true;
  detectedAt: Date;
  source: {
    documentId: string;
    pageNumber: number;
    confidence: number;
  };
}