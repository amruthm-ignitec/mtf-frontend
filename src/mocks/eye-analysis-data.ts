import { EyeTissueAnalysis } from '../types';

export const mockEyeAnalysis: EyeTissueAnalysis[] = [
  {
    id: 'eye1',
    tissueType: 'Eyes',
    name: 'Cornea',
    side: 'Right',
    probabilityScore: 0.91,
    status: 'Eligible',
    cornealProperties: {
      endothelialCellCount: 2800,
      clarity: 'Clear',
      thickness: '550 microns'
    },
    preservationTime: {
      deathToPreservation: '6 hours',
      viability: '14 days'
    },
    factors: [
      {
        name: 'Endothelial Cell Count',
        impact: 'positive',
        description: '2800 cells/mm² - Above minimum threshold',
        confidence: 0.97
      },
      {
        name: 'Corneal Clarity',
        impact: 'positive',
        description: 'No opacities or scarring',
        confidence: 0.95
      }
    ],
    similarCases: {
      count: 145,
      successRate: 0.92
    }
  }
]; 