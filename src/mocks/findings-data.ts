import { FindingSummary } from '../types';

export const mockFindings: FindingSummary[] = [
  // Critical Contraindications
  {
    id: '1',
    type: 'contraindication',
    category: 'Systemic Infections',
    description: 'Blood cultures positive for MRSA. Active systemic infection present.',
    severity: 'critical',
    aiConfidence: 0.98,
    citations: [
      { id: 'c1', pageNumber: '12', context: 'Lab Results' },
      { id: 'c2', pageNumber: '15', context: 'Progress Notes' }
    ]
  },
  {
    id: '2',
    type: 'contraindication',
    category: 'Bone/Joint Infections',
    description: 'History of osteomyelitis in left femur, treated and resolved 2 years ago.',
    severity: 'moderate',
    aiConfidence: 0.95,
    citations: [
      { id: 'c3', pageNumber: '8', context: 'Medical History' }
    ]
  },
  
  // Quality Indicators
  {
    id: '3',
    type: 'quality',
    category: 'Bone Density',
    description: 'DEXA scan from 6 months ago shows normal bone density. T-score: -0.5',
    severity: 'good',
    aiConfidence: 0.92,
    citations: [
      { id: 'c4', pageNumber: '25', context: 'Imaging Reports' }
    ]
  },
  {
    id: '4',
    type: 'quality',
    category: 'Previous Surgeries',
    description: 'Right knee replacement 5 years ago. No complications reported.',
    severity: 'moderate',
    aiConfidence: 0.97,
    citations: [
      { id: 'c5', pageNumber: '10', context: 'Surgical History' }
    ]
  },

  // Risk Factors
  {
    id: '5',
    type: 'risk',
    category: 'Substance Use',
    description: 'No evidence of IV drug use. Physical exam shows no track marks.',
    severity: 'low',
    aiConfidence: 0.89,
    citations: [
      { id: 'c6', pageNumber: '5', context: 'Physical Exam' },
      { id: 'c7', pageNumber: '18', context: 'Social History' }
    ]
  },
  {
    id: '6',
    type: 'risk',
    category: 'Trauma History',
    description: 'Recent fall with impact to right hip. X-ray shows no fracture.',
    severity: 'moderate',
    aiConfidence: 0.94,
    citations: [
      { id: 'c8', pageNumber: '30', context: 'Emergency Records' }
    ]
  }
]; 