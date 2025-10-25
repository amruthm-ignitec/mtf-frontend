import { TissueAnalysis } from '../types';

export const mockTissueAnalysis: TissueAnalysis[] = [
  {
    id: '1',
    name: 'Femur',
    side: 'Left',
    probabilityScore: 0.94,
    status: 'Eligible',
    factors: [
      {
        name: 'Age',
        impact: 'positive',
        description: 'Donor age within optimal range (45 years)',
        confidence: 0.98
      },
      {
        name: 'Bone Density',
        impact: 'positive',
        description: 'DEXA scan shows normal density (T-score: -0.5)',
        confidence: 0.95
      },
      {
        name: 'Local Condition',
        impact: 'neutral',
        description: 'No recent trauma or surgery in the area',
        confidence: 0.92
      }
    ],
    similarCases: {
      count: 245,
      successRate: 0.96
    }
  },
  {
    id: '2',
    name: 'Achilles Tendon',
    side: 'Right',
    probabilityScore: 0.88,
    status: 'Review Required',
    factors: [
      {
        name: 'Local Inflammation',
        impact: 'negative',
        description: 'Mild inflammation noted in recent imaging',
        confidence: 0.85
      },
      {
        name: 'Tissue Quality',
        impact: 'positive',
        description: 'Good collagen structure observed',
        confidence: 0.90
      }
    ],
    similarCases: {
      count: 180,
      successRate: 0.89
    }
  },
  {
    id: '3',
    name: 'Patellar Tendon',
    side: 'Left',
    probabilityScore: 0.92,
    status: 'Eligible',
    factors: [
      {
        name: 'Tissue Integrity',
        impact: 'positive',
        description: 'No degenerative changes noted',
        confidence: 0.94
      },
      {
        name: 'Size',
        impact: 'positive',
        description: 'Meets size requirements for transplant',
        confidence: 0.96
      }
    ],
    similarCases: {
      count: 210,
      successRate: 0.93
    }
  },
  {
    id: '4',
    name: 'Femur',
    side: 'Right',
    probabilityScore: 0.45,
    status: 'Ineligible',
    factors: [
      {
        name: 'Bone Infection',
        impact: 'negative',
        description: 'Active osteomyelitis present',
        confidence: 0.98
      },
      {
        name: 'Structural Integrity',
        impact: 'negative',
        description: 'Multiple fractures detected',
        confidence: 0.95
      }
    ],
    similarCases: {
      count: 85,
      successRate: 0.15
    }
  },
  {
    id: '5',
    name: 'Iliac Crest',
    side: 'Left',
    probabilityScore: 0.32,
    status: 'Ineligible',
    factors: [
      {
        name: 'Malignancy',
        impact: 'negative',
        description: 'Metastatic lesions detected',
        confidence: 0.99
      }
    ],
    similarCases: {
      count: 42,
      successRate: 0.08
    }
  }
]; 