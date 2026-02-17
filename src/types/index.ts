// src/types/index.ts
export * from './donor';
export * from './finding';
export * from './extraction';
export * from './donorApproval';

export type FindingType = 'contraindication' | 'quality' | 'risk';
export type FindingSeverity = 'critical' | 'moderate' | 'low' | 'good';

export interface FindingCitation {
  id: string;
  pageNumber: string;
  context: string;
  documentId?: number;
}

export interface FindingSummary {
  id: string;
  type: FindingType;
  category: string;
  description: string;
  severity: FindingSeverity;
  aiConfidence: number;
  citations: FindingCitation[];
}

export interface TissueAnalysis {
  id: string;
  name: string;
  side?: 'Left' | 'Right';
  probabilityScore: number;
  status: 'Eligible' | 'Ineligible' | 'Review Required';
  factors: {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
    confidence: number;
  }[];
  similarCases?: {
    count: number;
    successRate: number;
  };
}

export interface CVTissueAnalysis extends TissueAnalysis {
  tissueType: 'CV';
  valveType?: 'Aortic' | 'Pulmonary' | 'Mitral';
  vesselType?: 'Saphenous' | 'Femoral' | 'Iliac';
  measurements?: {
    size: string;
    length?: string;
  };
  hemodynamics?: {
    ejectionFraction?: number;
    valveFunction?: string;
  };
}

export interface SkinTissueAnalysis extends TissueAnalysis {
  tissueType: 'Skin';
  location: string;
  dimensions?: {
    length: string;
    width: string;
    thickness?: string;
  };
  tissueQuality?: {
    elasticity: string;
    vascularity: string;
    contamination?: string;
  };
}

export interface EyeTissueAnalysis extends TissueAnalysis {
  tissueType: 'Eyes';
  cornealProperties?: {
    endothelialCellCount: number;
    clarity: string;
    thickness: string;
  };
  preservationTime?: {
    deathToPreservation: string;
    viability: string;
  };
}

export interface ComparativeAnalysis {
  historicalAverage: number;
  lastMonth: {
    totalCases: number;
    successRate: number;
  };
  similarDonors: {
    age: number;
    condition: string;
    outcome: string;
    score: number;
    date: string;
  }[];
}

export interface DecisionSupportData {
  recommendation: 'Proceed' | 'Review' | 'Reject';
  confidence: number;
  keyFactors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }[];
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface ReviewNote {
  id: string;
  userName: string;
  timestamp: string;
  content: string;
  status: 'Open' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
}

export interface DonorRecord {
  id: string | number;
  donorName: string;
  name?: string | null;
  age?: number | null;
  gender?: string | null;
  causeOfDeath?: string | null;
  uploadTimestamp?: string;
  requiredDocuments?: Array<{ id: string; name: string; status: string; [key: string]: unknown }>;
  criticalFindings?: FindingSummary[];
}

export interface MDSummarySection {
  id: string;
  title: string;
  content: string;
  [key: string]: unknown;
}