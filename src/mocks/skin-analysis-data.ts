import { SkinTissueAnalysis } from '../types';

export const mockSkinAnalysis: SkinTissueAnalysis[] = [
  {
    id: 'skin1',
    tissueType: 'Skin',
    name: 'Posterior Trunk',
    location: 'Upper Back',
    probabilityScore: 0.95,
    status: 'Eligible',
    dimensions: {
      length: '30cm',
      width: '20cm',
      thickness: '1.5mm'
    },
    tissueQuality: {
      elasticity: 'Excellent',
      vascularity: 'Good',
      contamination: 'None'
    },
    factors: [
      {
        name: 'Skin Integrity',
        impact: 'positive',
        description: 'No lesions or damage noted',
        confidence: 0.96
      },
      {
        name: 'Tissue Viability',
        impact: 'positive',
        description: 'Excellent vascularity and cellular activity',
        confidence: 0.94
      }
    ],
    similarCases: {
      count: 178,
      successRate: 0.95
    }
  }
]; 