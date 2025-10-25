import { DonorRecord } from '../types';
import { mockFindings } from './findings-data';

export const mockDonors: DonorRecord[] = [
  {
    id: '1',
    donorName: 'John Doe',
    findings: mockFindings,
    status: 'completed',
    processingStatus: 'completed',
    uploadTimestamp: new Date().toISOString(),
    requiredDocuments: []
  },
  {
    id: '2',
    donorName: 'Jane Smith',
    findings: mockFindings.slice(0, 3),
    status: 'completed',
    processingStatus: 'completed',
    uploadTimestamp: new Date().toISOString(),
    requiredDocuments: []
  }
]; 