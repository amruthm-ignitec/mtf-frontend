import { DonorRecord, MDSummarySection } from '../types';

export const getMockDonorRecord = (id: string): DonorRecord => {
  return {
    id,
    donorName: 'John A. Smith',
    age: 45,
    gender: 'Male',
    causeOfDeath: 'Cerebrovascular Accident',
    uploadTimestamp: new Date('2024-03-15T10:30:00'),
    processingStatus: 'completed',
    status: 'completed',
    documents: [
      { id: 'doc1', fileName: 'Medical_History.pdf', fileType: 'application/pdf', uploadTimestamp: new Date(), status: 'completed' },
      { id: 'doc2', fileName: 'Lab_Results.pdf', fileType: 'application/pdf', uploadTimestamp: new Date(), status: 'completed' }
    ],
    findings: [],
    requiredDocuments: [
      {
        id: 'rd1',
        name: 'Medical History',
        type: 'medical_history',
        label: 'Medical History',
        status: 'completed',
        isRequired: true,
        uploadDate: new Date('2024-03-15T08:30:00'),
        reviewedBy: 'Dr. Sarah Johnson',
        notes: 'Complete medical history with all required sections',
        pageCount: 15
      },
      {
        id: 'rd2',
        name: 'Serology Report',
        type: 'serology',
        label: 'Serology Report',
        status: 'uploaded',
        isRequired: true,
        uploadDate: new Date('2024-03-15T09:15:00'),
        reviewedBy: 'Dr. Michael Chen',
        notes: 'All required tests completed and documented',
        pageCount: 3
      },
      {
        id: 'rd3',
        name: 'Death Certificate',
        type: 'death_certificate',
        label: 'Death Certificate',
        status: 'completed',
        isRequired: true,
        uploadDate: new Date('2024-03-15T08:45:00'),
        reviewedBy: 'Dr. Sarah Johnson',
        notes: 'Properly executed and verified',
        pageCount: 1
      },
      {
        id: 'rd4',
        name: 'Consent Forms',
        type: 'consent',
        label: 'Consent Documentation',
        status: 'completed',
        isRequired: true,
        uploadDate: new Date('2024-03-15T08:50:00'),
        reviewedBy: 'Lisa Thompson, DRC',
        notes: 'Next of kin consent obtained and verified',
        pageCount: 4
      },
      {
        id: 'rd5',
        name: 'Recovery Documentation',
        type: 'recovery',
        label: 'Recovery Documentation',
        status: 'processing',
        isRequired: true,
        uploadDate: new Date('2024-03-15T10:00:00'),
        reviewedBy: 'Pending Review',
        notes: 'Awaiting final verification',
        pageCount: 6
      },
      {
        id: 'rd6',
        name: 'Laboratory Results',
        type: 'lab_results',
        label: 'Laboratory Results',
        status: 'completed',
        isRequired: true,
        uploadDate: new Date('2024-03-15T09:30:00'),
        reviewedBy: 'Dr. Michael Chen',
        notes: 'Complete blood work and culture results',
        pageCount: 8
      },
      {
        id: 'rd7',
        name: 'Physical Assessment',
        type: 'physical_assessment',
        label: 'Physical Assessment',
        status: 'completed',
        isRequired: true,
        uploadDate: new Date('2024-03-15T09:00:00'),
        reviewedBy: 'Dr. James Wilson',
        notes: 'Comprehensive physical examination documented',
        pageCount: 5
      },
      {
        id: 'rd8',
        name: 'Social History',
        type: 'social_history',
        label: 'Social History Documentation',
        status: 'completed',
        isRequired: true,
        uploadDate: new Date('2024-03-15T08:40:00'),
        reviewedBy: 'Lisa Thompson, DRC',
        notes: 'Complete behavioral risk assessment',
        pageCount: 3
      }
    ]
  };
};

export const getMockMDSections = (): MDSummarySection[] => {
  return [
    {
      title: 'Medical History Review',
      status: 'Abnormal',
      details: 'Patient has history of controlled hypertension (medication compliant) and Type 2 Diabetes (HbA1c: 7.2%). No recent hospitalizations. No history of malignancy or autoimmune conditions.',
      pageReferences: ['1', '2', '3'],
      aiConfidence: 95,
      reviewedAt: '2024-03-15T10:30:00',
      reviewedBy: 'Dr. Smith'
    },
    {
      title: 'Laboratory Results',
      status: 'Normal',
      details: 'All critical lab values within acceptable range. CBC, CMP, and coagulation studies reviewed. Serology negative for HIV, HBV, HCV. Blood cultures show no growth at 5 days.',
      pageReferences: ['4', '5']
    },
    {
      title: 'Terminal Course',
      status: 'Reviewed',
      details: 'Terminal event was hemorrhagic CVA. No prolonged hypotension or sepsis. No chest compressions performed. Time from arrest to pronouncement: 15 minutes.',
      pageReferences: ['6', '7']
    },
    {
      title: 'Tissue Specific Findings',
      status: 'Attention Required',
      details: 'Musculoskeletal: No acute trauma or deformities noted. Cardiovascular: No significant valvular disease. Skin: Small 2cm laceration on right forearm, well-healed.',
      pageReferences: ['8', '9', '10']
    },
    {
      title: 'Recovery Logistics',
      status: 'Completed',
      details: 'Recovery location confirmed at Memorial Hospital OR. Team access arranged. All necessary equipment available on site. Recovery window within acceptable timeframe.',
      pageReferences: ['11']
    },
    {
      title: 'Consent Documentation',
      status: 'Verified',
      details: 'Next of kin (spouse) provided full consent. All required documentation properly executed and verified. No restrictions specified.',
      pageReferences: ['12', '13']
    }
  ];
}; 