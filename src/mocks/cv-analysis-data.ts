import { CVTissueAnalysis } from '../types';

export const mockCVAnalysis: CVTissueAnalysis[] = [
  {
    id: 'cv1',
    tissueType: 'CV',
    name: 'Aortic Valve',
    valveType: 'Aortic',
    probabilityScore: 0.92,
    status: 'Eligible',
    measurements: {
      size: '23mm'
    },
    hemodynamics: {
      ejectionFraction: 55,
      valveFunction: 'Normal'
    },
    factors: [
      {
        name: 'Structural Integrity',
        impact: 'positive',
        description: 'No calcification or structural abnormalities',
        confidence: 0.95
      },
      {
        name: 'Sterility',
        impact: 'positive',
        description: 'No evidence of endocarditis or contamination',
        confidence: 0.97
      },
      {
        name: 'Size Match',
        impact: 'positive',
        description: 'Standard size suitable for most recipients',
        confidence: 0.94
      }
    ],
    similarCases: {
      count: 156,
      successRate: 0.93
    }
  },
  {
    id: 'cv2',
    tissueType: 'CV',
    name: 'Saphenous Vein',
    vesselType: 'Saphenous',
    probabilityScore: 0.89,
    status: 'Review Required',
    measurements: {
      size: '4mm',
      length: '15cm'
    },
    factors: [
      {
        name: 'Vessel Wall',
        impact: 'neutral',
        description: 'Mild atherosclerotic changes noted',
        confidence: 0.88
      },
      {
        name: 'Length',
        impact: 'positive',
        description: 'Adequate length for bypass grafting',
        confidence: 0.95
      }
    ],
    similarCases: {
      count: 203,
      successRate: 0.87
    }
  }
]; 