import { FindingSummary } from './finding';

export interface Donor {
  id: string;
  donorName: string;
  findings: FindingSummary[];
}

export interface DonorRecord extends Donor {
  status: ProcessingStatus;
  requiredDocuments: RequiredDocument[];
  processingStatus: ProcessingStatus;
  uploadTimestamp: Date | string;
  causeOfDeath?: string;
  documents?: any[];
}

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'rejected' | 'failed' | 'uploaded';

export interface RequiredDocument {
  id: string;
  name: string;
  status: DocumentStatus;
  type?: string;
  label?: string;
  isRequired?: boolean;
}

export type DocumentStatus = 'missing' | 'processing' | 'completed' | 'uploaded' | 'invalid';

export interface MDSummarySection {
  id: string;
  title: string;
  content: string;
  status?: string;
  details?: string;
  pageReferences?: string[];
}

export type TissueType = 'bone' | 'skin' | 'heart_valve' | 'vessels' | 'cornea' | 'tendons' | 'ligaments' | 'veins' | 'fascia';
