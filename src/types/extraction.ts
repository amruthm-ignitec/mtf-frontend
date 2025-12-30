// TypeScript types for extraction data structure matching test.json

export type Status = 'COMPLETE' | 'INCOMPLETE' | 'PENDING';

export interface Citation {
  document_id: number;
  page: number;
}

export interface SourceDocument {
  filename: string;
  page?: number;
  confidence: number;
  document_id?: number;
}

export interface SourceDocumentReference {
  source_document: string;
  source_page?: number;
  source_pages?: number[];
  confidence?: number;
  document_id?: number;
}

// Donor Login Packet
export interface DonorLoginPacket {
  status: Status;
  form_type: string | null;
  template_number: string | null;
  template_name: string | null;
  source_documents: SourceDocument[];
}

// Donor Information
export interface DonorInformation {
  status: Status;
  gender?: {
    value: string;
    source_document: string;
    source_page: number;
    confidence: number;
  };
}

// Tissue Recovery
export interface TissueRecovery {
  status: Status;
  total_tissues_recovered: number;
  recovery_site: string;
  source_document: string;
  source_pages: number[];
  confidence: number;
}

// Infectious Disease Testing
export interface TestField {
  test_name: string;
  result?: string;
  source_document: string;
  source_page: number;
  confidence: number;
}

export interface SerologyReport {
  report_type: string;
  source_document: string;
  confidence: number;
}

export interface InfectiousDiseaseTesting {
  status: Status;
  serology_report: SerologyReport;
  other_tests: {
    laboratory_name?: TestField;
    laboratory_address?: TestField;
    phone?: TestField;
    fax?: TestField;
    fda?: TestField;
    clia?: TestField;
    category?: TestField;
    ashi?: TestField;
    client?: TestField;
    report_type?: TestField;
    report_status?: TestField;
    sample_date?: TestField;
    sample_time?: TestField;
    sample_type_1?: TestField;
    sample_type_2?: TestField;
    report_generated?: TestField;
    confidential_notice?: TestField;
    fda_licensed_methods?: TestField;
    page_number?: TestField;
  };
  source_document: string;
  source_pages: number[];
}

// Medical Records
export interface MedicalRecords {
  status: Status;
  records_summary: string;
  source_document: string;
  source_pages: number[];
  confidence: number;
}

// Physical Assessment
export interface AnthropometricMeasurements {
  height?: {
    value: string;
    unit: string;
    source_document: string;
    confidence: number;
  };
  weight?: {
    value: string;
    unit: string;
    source_document: string;
    confidence: number;
  };
}

export interface VisualFindings {
  [key: string]: string;
}

export interface BodyCondition {
  Color?: string;
  Temperature?: string;
  Temp?: string;
}

export interface PhysicalFindings {
  cleanliness?: string;
  visual_findings?: VisualFindings;
  abnormalities?: {
    Comments?: string;
  };
  body_condition?: BodyCondition;
  source_document?: string;
  source_page?: number;
  confidence?: number;
}

export interface PhysicalAssessment {
  status: Status;
  exam_performed_by?: {
    name: string;
    title: string;
    source_document: string;
    source_page: number;
    confidence: number;
  };
  anthropometric_measurements?: AnthropometricMeasurements;
  physical_findings?: PhysicalFindings;
  source_document: string;
  source_pages: number[];
}

// Authorization
export interface AuthorizedParty {
  name: string;
  relationship: string;
  source_document: string;
  source_page: number;
  confidence: number;
}

export interface AuthorizationDateTime {
  authorization_datetime: string;
  signature_datetime: string;
  signature_type: string;
  source_document: string;
  confidence: number;
}

export interface Authorization {
  status: Status;
  form_type: string;
  form_use: string;
  authorized_party: AuthorizedParty;
  authorization_datetime: AuthorizationDateTime;
  source_document: string;
  source_pages: number[];
  confidence: number;
}

// DRAI (Donor Risk Assessment Interview)
export interface DRAI {
  status: Status;
  interview_location?: {
    value: string;
    source_document: string;
    source_pages: number[];
    confidence: number;
  };
  interview_datetime?: {
    value: string;
    source_document: string;
    source_pages: number[];
    confidence: number;
  };
  occupation?: {
    value: string;
    source_document: string;
    source_pages: number[];
    confidence: number;
  };
  place_of_birth?: {
    value: string;
    source_document: string;
    source_pages: number[];
    confidence: number;
  };
  medical_history?: {
    medications?: string[];
    source_document: string;
    source_pages: number[];
    confidence: number;
  };
  risk_factors?: {
    sexual_history?: string;
    international_travel?: string;
    source_document: string;
    source_pages: number[];
    confidence: number;
  };
}

// Medical Records Review
export interface MedicalRecordsReview {
  status: Status;
  source_document: string;
  source_pages: number[];
  confidence: number;
}

// Plasma Dilution
export interface TransfusionStatus {
  transfused: boolean;
  donor_weight_kg: number;
  source_document: string;
  confidence: number;
}

export interface PlasmaDilution {
  status: Status;
  transfusion_status: TransfusionStatus;
  source_document: string;
  source_pages: number[];
  confidence: number;
}

// Conditional Documents
export interface BioburdenTestResult {
  test_method: string;
  result: string;
  source_document: string;
  confidence: number;
}

export interface BioburdenLaboratoryInformation {
  testing_laboratory: string;
  laboratory_directors: string;
  clia: string;
  source_document: string;
  confidence: number;
}

export interface BioburdenResults {
  condition_required: string;
  bioburden_testing_performed: boolean;
  test_result?: BioburdenTestResult;
  laboratory_information?: BioburdenLaboratoryInformation;
  conditional_status: string;
  source_document: string;
  source_pages: number[];
  confidence: number;
}

export interface ToxicologyScreeningStatus {
  performed: boolean;
  source_document: string;
  confidence: number;
}

export interface ToxicologyReport {
  condition_required: string;
  toxicology_screening_status: ToxicologyScreeningStatus;
  conditional_status: string;
  source_document: string;
  source_pages: number[];
  confidence: number;
}

export interface CauseOfDeath {
  'Apparent Cause of Death'?: string;
  'UNOS Cause of Death'?: string;
  'Circumstances of Death'?: string;
  'Mechanism of Death'?: string;
}

export interface AutopsyKeyFindings {
  'Admission Course'?: string;
  'PMH'?: string;
  'Cancer History/Type'?: string;
  'Plan of Care'?: string;
}

export interface AutopsyReport {
  condition_required: string;
  autopsy_performed: boolean;
  cause_of_death?: CauseOfDeath;
  key_findings?: AutopsyKeyFindings;
  conditional_status: string;
  source_document: string;
  source_pages: number[];
  confidence: number;
}

export interface ConditionalDocuments {
  bioburden_results?: BioburdenResults;
  toxicology_report?: ToxicologyReport;
  autopsy_report?: AutopsyReport;
}

// Validation
export interface ChecklistStatus {
  total_required_items: number;
  total_items_found: number;
  total_items_complete: number;
  total_items_incomplete: number;
  completion_percentage: number;
  overall_status: string;
}

export interface CriticalFinding {
  type: string;
  severity: string;
  automaticRejection: boolean;
  reasoning?: string;
  detectedAt?: string;
  source?: {
    documentId: string;
    pageNumber: string;
    confidence: number;
  };
}

export interface ValidationStatus {
  checklist_status?: ChecklistStatus;
  critical_findings?: CriticalFinding[];
  has_critical_findings?: boolean;
  automatic_rejection?: boolean;
}

// Compliance Status
export interface ComplianceStatus {
  aatb_compliant: boolean;
  all_required_documentation: boolean;
  tissue_viability: boolean;
  microbiological_clearance: boolean;
  authorization_valid: boolean;
  ready_for_distribution: boolean;
}

// Document Summary
export interface DocumentSummary {
  total_documents_processed: number;
  total_pages_processed: number;
  extraction_methods_used: string[];
}

// Main Extracted Data
export interface ExtractedData {
  donor_login_packet: DonorLoginPacket;
  donor_information: DonorInformation;
  tissue_recovery: TissueRecovery;
  infectious_disease_testing: InfectiousDiseaseTesting;
  medical_records: MedicalRecords;
  physical_assessment: PhysicalAssessment;
  authorization: Authorization;
  drai: DRAI;
  medical_records_review: MedicalRecordsReview;
  plasma_dilution: PlasmaDilution;
}

// Terminal Information
export interface TerminalInformation {
  cause_of_death?: string | null;
  time_of_death?: string | null;
  hypotension?: string | null;
  sepsis?: string | null;
}

// Recovery Information
export interface RecoveryInformation {
  recovery_window?: string | null;
  location?: string | null;
  consent_status?: string | null;
}

// Criteria Evaluation
export interface CriteriaEvaluation {
  extracted_data?: Record<string, any>;
  evaluation_result: 'acceptable' | 'unacceptable' | 'md_discretion';
  evaluation_reasoning?: string;
  tissue_types?: string[];
}

// Eligibility Status
export interface EligibilityStatus {
  status: 'eligible' | 'ineligible' | 'requires_review' | 'pending';
  blocking_criteria?: Array<{
    criterion_name: string;
    reasoning?: string;
  }>;
  md_discretion_criteria?: Array<{
    criterion_name: string;
    reasoning?: string;
  }>;
  evaluated_at?: string;
}

export interface EligibilityData {
  musculoskeletal?: EligibilityStatus;
  skin?: EligibilityStatus;
}

// Complete Extraction Response
export interface ExtractionDataResponse {
  donor_id: string;
  case_id: string;
  processing_timestamp: string;
  processing_duration_seconds: number;
  extracted_data: ExtractedData;
  conditional_documents?: ConditionalDocuments;
  validation?: ValidationStatus;
  compliance_status?: ComplianceStatus;
  document_summary?: DocumentSummary;
  terminal_information?: TerminalInformation;
  recovery_information?: RecoveryInformation;
  
  // New fields from criteria-focused backend
  serology_results?: {
    result: Record<string, string>;
    citations: Citation[];
  };
  culture_results?: {
    result: Array<{
      test_name: string;
      result: string;
      test_method?: string;
      specimen_type?: string;
      specimen_date?: string;
      comments?: string;
      tissue_location?: string;
      microorganism?: string;
      document_id?: number;
    }>;
    citations: Citation[];
  };
  criteria_evaluations?: Record<string, CriteriaEvaluation>;
  eligibility?: EligibilityData;
  
  // Legacy fields (deprecated, kept for backward compatibility)
  tissue_eligibility?: any[];
  critical_lab_values?: any;
  key_medical_findings?: any;
}

