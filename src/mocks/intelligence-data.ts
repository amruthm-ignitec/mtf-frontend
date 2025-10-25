import { ComparativeAnalysis, DecisionSupportData, ReviewNote } from '../types';

export const mockComparativeAnalysis: Record<string, ComparativeAnalysis> = {
  'femur-left': {
    historicalAverage: 0.89,
    lastMonth: {
      totalCases: 45,
      successRate: 0.92
    },
    similarDonors: [
      {
        age: 45,
        condition: 'Hypertension, Controlled',
        outcome: 'Successful',
        score: 0.94,
        date: '2024-02-15'
      },
      {
        age: 42,
        condition: 'Diabetes Type 2',
        outcome: 'Successful',
        score: 0.91,
        date: '2024-02-10'
      },
      {
        age: 48,
        condition: 'No Major Conditions',
        outcome: 'Successful',
        score: 0.96,
        date: '2024-02-05'
      }
    ]
  }
};

export const mockDecisionSupport: Record<string, DecisionSupportData> = {
  'femur-left': {
    recommendation: 'Proceed',
    confidence: 0.94,
    keyFactors: [
      {
        factor: 'Age within optimal range',
        impact: 'positive',
        weight: 0.8
      },
      {
        factor: 'Bone density normal',
        impact: 'positive',
        weight: 0.9
      },
      {
        factor: 'Previous medical history',
        impact: 'neutral',
        weight: 0.6
      }
    ],
    riskLevel: 'Low'
  }
};

export const mockReviewNotes: ReviewNote[] = [
  {
    id: 'note1',
    userName: 'Dr. Smith',
    timestamp: '2024-03-15T10:30:00Z',
    content: 'Reviewed bone density results. Appears suitable for donation.',
    status: 'Resolved',
    priority: 'Medium'
  },
  {
    id: 'note2',
    userName: 'Jane DRC',
    timestamp: '2024-03-15T11:15:00Z',
    content: 'Please verify previous surgical history on left leg.',
    status: 'Open',
    priority: 'High'
  }
]; 