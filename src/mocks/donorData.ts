import { DonorRecord } from '../types/donor';

export const mockDonors: DonorRecord[] = [
  {
    id: '1',
    donorName: 'John Doe',
    causeOfDeath: 'Natural causes',
    uploadTimestamp: new Date('2024-03-10T10:00:00'),
    processingStatus: 'completed',
    documents: [
      {
        id: 'd1',
        fileName: 'medical_history.pdf',
        fileType: 'application/pdf',
        uploadTimestamp: new Date('2024-03-10T10:00:00'),
        status: 'completed',
        pageCount: 12
      },
      {
        id: 'd2',
        fileName: 'lab_results.pdf',
        fileType: 'application/pdf',
        uploadTimestamp: new Date('2024-03-10T10:00:00'),
        status: 'completed',
        pageCount: 5
      }
    ],
    findings: []
  },
  {
    id: '2',
    donorName: 'Jane Smith',
    causeOfDeath: 'Cardiac arrest',
    uploadTimestamp: new Date('2024-03-10T11:30:00'),
    processingStatus: 'processing',
    documents: [
      {
        id: 'd3',
        fileName: 'medical_report.pdf',
        fileType: 'application/pdf',
        uploadTimestamp: new Date('2024-03-10T11:30:00'),
        status: 'processing',
        pageCount: 8
      }
    ],
    findings: []
  },
  {
    id: '3',
    donorName: 'Robert Johnson',
    causeOfDeath: 'Pending',
    uploadTimestamp: new Date('2024-03-10T09:15:00'),
    processingStatus: 'pending',
    documents: [
      {
        id: 'd4',
        fileName: 'initial_assessment.pdf',
        fileType: 'application/pdf',
        uploadTimestamp: new Date('2024-03-10T09:15:00'),
        status: 'pending',
        pageCount: 3
      }
    ],
    findings: []
  }
]; 