// Defines the structure for findings and citations
export interface FindingSummary {
  id: string;
  type: 'positive' | 'negative';
  category: string;
  description: string;
  citations: FindingCitation[];
}

export interface FindingCitation {
  id: string;
  pageNumber: string | number;
} 