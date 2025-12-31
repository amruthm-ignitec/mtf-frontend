import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FindingSummary, DonorRecord, MDSummarySection, ExtractionDataResponse } from '../types';
import { ApprovalStatus, ApprovalType, PastDataResponse } from '../types/donorApproval';
// import { getMockMDSections } from '../services/mockData';
// ClinicalInformation and FindingsSection components moved inline
import { Clock, Heart, AlertCircle, FileText, Stethoscope, Brain, CheckCircle, Layout, FileCheck, User, AlertTriangle, ChevronRight, UserCheck, FlaskConical, Package, Shield, FileSearch, Droplets, XCircle, History, ArrowLeft } from 'lucide-react';
import FindingDetailsModal from '../components/modals/FindingDetailsModal';
import ApprovalRejectionModal from '../components/modals/ApprovalRejectionModal';
import { apiService } from '../services/api';
import DRAISection from '../components/donor/DRAISection';
import InfectiousDiseaseSection from '../components/donor/InfectiousDiseaseSection';
import ComplianceSection from '../components/donor/ComplianceSection';
import ConditionalDocumentsSection from '../components/donor/ConditionalDocumentsSection';
import MedicalRecordsReviewSection from '../components/donor/MedicalRecordsReviewSection';
import PlasmaDilutionSection from '../components/donor/PlasmaDilutionSection';
import PastDataSection from '../components/donor/PastDataSection';
import EligibilityStatusSection from '../components/donor/EligibilityStatusSection';
import CriteriaEvaluationsSection from '../components/donor/CriteriaEvaluationsSection';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PDFViewer from '../components/ui/PDFViewer';
import PDFViewerWithPage from '../components/ui/PDFViewerWithPage';

// Inline components
const ClinicalInformation = ({ donor }: { donor: DonorRecord }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Donor Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Name</label>
          <p className="text-sm text-gray-900">{donor.name || '-'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Age</label>
          <p className="text-sm text-gray-900">{donor.age || '-'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Gender</label>
          <p className="text-sm text-gray-900">{donor.gender || '-'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Cause of Death</label>
          <p className="text-sm text-gray-900">{donor.causeOfDeath || '-'}</p>
        </div>
      </div>
    </div>
  </div>
);

const FindingsSection = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Findings Summary</h3>
      <div className="text-sm text-gray-600">
        No findings available at this time.
      </div>
    </div>
  </div>
);

const SUMMARY_TABS = [
  { id: 'overview', label: 'Overview', icon: Layout },
  { id: 'clinical', label: 'Clinical Information', icon: Heart },
  { id: 'eligibility', label: 'Eligibility Status', icon: Shield },
  { id: 'criteria', label: 'Criteria Evaluations', icon: FileCheck },
  { id: 'drai', label: 'DRAI', icon: User },
  { id: 'infectious-disease', label: 'Infectious Disease', icon: FlaskConical },
  { id: 'conditional-docs', label: 'Conditional Tests', icon: FileSearch },
  { id: 'plasma-dilution', label: 'Plasma Dilution', icon: Droplets }
] as const;

type TabId = typeof SUMMARY_TABS[number]['id'];

export default function Summary() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [donor, setDonor] = useState<DonorRecord | null>(null);
  const [mdSections, setMDSections] = useState<MDSummarySection[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<FindingSummary | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  
  // Handle tab change - clear PDF viewer
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    // Clear PDF viewer when switching tabs
    setSelectedPdfUrl(null);
    setSelectedPageNumber(null);
    setSelectedDocumentName(null);
  };
  const [selectedMDCitation, setSelectedMDCitation] = useState<number | null>(null);
  const [extractionData, setExtractionData] = useState<ExtractionDataResponse | null>(null);
  const [loadingExtraction, setLoadingExtraction] = useState(false);
  
  // Approval/Rejection state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalType, setApprovalType] = useState<ApprovalType>('donor_summary');
  const [pastData, setPastData] = useState<PastDataResponse | null>(null);
  const [loadingPastData, setLoadingPastData] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Critical findings and missing documents
  const [criticalFindings, setCriticalFindings] = useState<Array<{
    type: string;
    severity: string;
    automaticRejection: boolean;
    detectedAt?: string;
    source: {
      documentId: string;
      pageNumber: string;
      confidence: number;
    };
  }>>([]);
  const [missingDocuments, setMissingDocuments] = useState<Array<{
    id: string;
    name: string;
    type: string;
    label: string;
    status: 'completed' | 'processing' | 'missing' | 'invalid';
    isRequired: boolean;
    uploadDate?: string;
    reviewedBy?: string;
    reviewDate?: string;
    pageCount: number;
  }>>([]);
  
  // Documents for checklist and PDF viewer
  const [documents, setDocuments] = useState<Array<{
    id: number;
    document_type: string;
    created_at: string;
    updated_at?: string;
    azure_blob_url?: string;
    filename?: string;
    original_filename?: string;
  }>>([]);
  
  // PDF Viewer state
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedPageNumber, setSelectedPageNumber] = useState<number | null>(null);
  const [selectedDocumentName, setSelectedDocumentName] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);

  // useEffect(() => {
  //   console.log('Current ID:', id);
  //   const donorData = getMockDonorRecord(id || '');
  //   console.log('Donor Data:', donorData);
    
  //   if (!donorData) {
  //     console.log('No donor data found, navigating to not-found');
  //     navigate('/not-found');
  //     return;
  //   }
  //   setDonor(donorData);
  //   setMDSections(getMockMDSections());
  // }, [id, navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        console.error('No donor ID provided');
        navigate('/not-found');
        return;
      }

      console.log('Summary page loaded with ID:', id);
      
      // Check if donor data was passed from previous route
      const donorFromState = location.state?.donor;
      console.log('Donor from navigation state:', donorFromState);

      try {
        // Fetch extraction data from backend API
        console.log('Loading extraction data from API...');
        const extractionDataResponse = await apiService.getDonorExtractionData(Number(id));
        console.log('Extraction data loaded:', extractionDataResponse);
        
        // Set extraction data from API
        setExtractionData(extractionDataResponse as ExtractionDataResponse);
        
        // Use donor data from navigation state if available, otherwise create from extraction data
        let donorData: DonorRecord;
        
        if (donorFromState) {
          // Use donor data passed from Documents page
          donorData = {
            id: Number(id),
            donorName: donorFromState.name || `Donor ${id}`,
            name: donorFromState.name || `Donor ${id}`,
            age: donorFromState.age || extractionDataResponse.extracted_data?.donor_information?.extracted_data?.Age ? 
              Number(extractionDataResponse.extracted_data.donor_information.extracted_data.Age) : null,
            gender: donorFromState.gender || extractionDataResponse.extracted_data?.donor_information?.extracted_data?.Gender || null,
            causeOfDeath: extractionDataResponse.terminal_information?.cause_of_death || null,
            uploadTimestamp: donorFromState.created_at || extractionDataResponse.processing_timestamp || new Date().toISOString(),
            requiredDocuments: [],
          };
          console.log('Using donor data from navigation state:', donorData);
        } else {
          // Create donor data from extraction data
          const donorInfo = extractionDataResponse.extracted_data?.donor_information?.extracted_data || {};
          donorData = {
            id: Number(id),
            donorName: extractionDataResponse.donor_id ? `Donor ${extractionDataResponse.donor_id}` : `Donor ${id}`,
            name: extractionDataResponse.donor_id ? `Donor ${extractionDataResponse.donor_id}` : `Donor ${id}`,
            age: donorInfo.Age ? Number(donorInfo.Age) : null,
            gender: donorInfo.Gender || null,
            causeOfDeath: extractionDataResponse.terminal_information?.cause_of_death || null,
            uploadTimestamp: extractionDataResponse.processing_timestamp || new Date().toISOString(),
            requiredDocuments: [],
          };
          console.log('Using donor data from extraction data:', donorData);
        }
        
        setDonor(donorData);
        setLoadingExtraction(false);
        
        // Load user role
        const role = apiService.getUserRole();
        setUserRole(role);
        
        // Fetch documents for checklist
        try {
          const documentsData = await apiService.getDonorDocuments(Number(id));
          setDocuments(documentsData as any);
        } catch (err) {
          console.error('Error fetching documents:', err);
          setDocuments([]);
        }
        
        // Get critical findings from extraction data validation
        if (extractionDataResponse.validation?.critical_findings) {
          setCriticalFindings(extractionDataResponse.validation.critical_findings);
        } else {
          setCriticalFindings([]);
        }
        
        // Fetch donor details for missing documents
        try {
          const donorDetails = await apiService.getQueueDetails();
          const currentDonorDetails = donorDetails.find((d: any) => d.id === Number(id));
          if (currentDonorDetails) {
            setMissingDocuments(currentDonorDetails.requiredDocuments?.filter((doc: any) => doc.status === 'missing') || []);
          }
        } catch (err) {
          console.error('Error fetching donor details:', err);
          setMissingDocuments([]);
        }
        
      } catch (err) {
        console.error('Error loading extraction data:', err);
        // Fallback to basic donor data if API fails
        const fallbackDonor: DonorRecord = {
          id: Number(id),
          donorName: donorFromState?.name || `Donor ${id}`,
          name: donorFromState?.name || `Donor ${id}`,
          age: donorFromState?.age || null,
          gender: donorFromState?.gender || null,
          causeOfDeath: null,
          uploadTimestamp: donorFromState?.created_at || new Date().toISOString(),
          requiredDocuments: [],
        };
        setDonor(fallbackDonor);
        setLoadingExtraction(false);
        setCriticalFindings([]);
        setMissingDocuments([]);
      }
    };

    if (id) {
      setLoadingExtraction(true);
      loadData();
    }
  }, [id, navigate, location.state]);

  // Load past data
  const loadPastData = async () => {
    if (!id) return;
    
    try {
      setLoadingPastData(true);
      const data = await apiService.getDonorPastData(Number(id));
      setPastData(data);
    } catch (err) {
      console.error('Error loading past data:', err);
      // Don't show error to user, just log it
    } finally {
      setLoadingPastData(false);
    }
  };

  // Load past data when user role is available
  useEffect(() => {
    if (userRole && (userRole === 'medical_director' || userRole === 'admin') && id) {
      loadPastData();
    }
  }, [userRole, id]);

  // Handle approval/rejection
  const handleApprovalRejection = async (status: ApprovalStatus, comment: string) => {
    if (!id || !donor) return;
    
    // Get current checklist data from extraction data
    const checklistData = extractionData ? {
      initial_paperwork: extractionData.extracted_data ? {
        donor_login_packet: extractionData.extracted_data.donor_login_packet?.status || 'PENDING',
        donor_information: extractionData.extracted_data.donor_information?.status || 'PENDING',
        drai: extractionData.extracted_data.donor_risk_assessment_interview?.status || extractionData.extracted_data.drai?.status || 'PENDING',
        physical_assessment: extractionData.extracted_data.physical_assessment?.status || 'PENDING',
        medical_records_review: extractionData.extracted_data.medical_records_review?.status || 'PENDING',
        tissue_recovery: extractionData.extracted_data.tissue_recovery?.status || 'PENDING',
        plasma_dilution: extractionData.extracted_data.plasma_dilution?.status || 'PENDING',
        authorization: extractionData.extracted_data.authorization?.status || 'PENDING',
        infectious_disease_testing: extractionData.extracted_data.infectious_disease_testing?.status || 'PENDING',
        medical_records: extractionData.extracted_data.medical_records?.status || 'PENDING',
      } : {},
      conditional_documents: extractionData?.conditional_documents || {},
      compliance_status: extractionData?.compliance_status || null,
    } : null;
    
    await apiService.createDonorApproval({
      donor_id: Number(id),
      document_id: null, // For donor summary approval
      approval_type: approvalType,
      status,
      comment,
      checklist_data: checklistData,
    });
    
    // Reload past data after approval/rejection
    await loadPastData();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Donor Information Header */}
            {donor && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-gray-900">{donor.donorName}</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {donor.age ? `${donor.age} years` : '-'} • {donor.gender || '-'}
                      </span>
                      <span>|</span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Time of Death: {extractionData?.terminal_information?.time_of_death || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Critical Information Grid */}
            {donor && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recovery Information */}
                {extractionData?.recovery_information && (
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-md font-semibold mb-3 flex items-center text-red-700">
                      <Clock className="h-4 w-4 mr-2" />
                      Recovery Information
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="text-xs text-gray-500">Recovery Window</div>
                          <div className="text-sm font-medium">{extractionData.recovery_information?.recovery_window || '-'}</div>
                        </div>
                        {extractionData.recovery_information?.location && (
                          <div className="bg-green-50 p-2 rounded border border-green-200">
                            <div className="text-xs text-green-800">Location</div>
                            <div className="text-sm font-medium text-green-900">{extractionData.recovery_information.location || '-'}</div>
                          </div>
                        )}
                      </div>
                      {extractionData.recovery_information?.consent_status && (
                        <div className="bg-green-50 p-2 rounded border border-green-200">
                          <div className="text-xs text-green-800">Consent Status</div>
                          <div className="text-sm font-medium text-green-900">{extractionData.recovery_information.consent_status || '-'}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Terminal Information */}
                {extractionData?.terminal_information && (
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-md font-semibold mb-3 flex items-center text-purple-700">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Terminal Information
                    </h3>
                    <div className="space-y-3">
                      {extractionData.terminal_information?.cause_of_death && (
                        <div className="bg-purple-50 p-2 rounded border border-purple-200">
                          <div className="text-xs text-purple-800">Cause of Death</div>
                          <div className="text-sm font-medium text-purple-900">{extractionData.terminal_information.cause_of_death || '-'}</div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div className={`p-2 rounded border ${
                          extractionData.terminal_information?.hypotension === 'Present' 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-green-50 border-green-200'
                        }`}>
                          <div className={`text-xs ${extractionData.terminal_information?.hypotension === 'Present' ? 'text-red-800' : 'text-green-800'}`}>Hypotension</div>
                          <div className={`text-sm font-medium ${extractionData.terminal_information?.hypotension === 'Present' ? 'text-red-900' : 'text-green-900'}`}>
                            {extractionData.terminal_information?.hypotension || '-'}
                          </div>
                        </div>
                        <div className={`p-2 rounded border ${
                          extractionData.terminal_information?.sepsis === 'Present' 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-green-50 border-green-200'
                        }`}>
                          <div className={`text-xs ${extractionData.terminal_information?.sepsis === 'Present' ? 'text-red-800' : 'text-green-800'}`}>Sepsis</div>
                          <div className={`text-sm font-medium ${extractionData.terminal_information?.sepsis === 'Present' ? 'text-red-900' : 'text-green-900'}`}>
                            {extractionData.terminal_information?.sepsis || '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Required Documentation */}
            {donor && extractionData && (() => {
              // Mapping from display names to extraction data keys
              const documentMapping: Record<string, string> = {
                'Donor Log-In Information Packet': 'donor_log_in_information_packet',
                'Donor Information': 'donor_information',
                'Donor Risk Assessment Interview (DRAI)': 'donor_risk_assessment_interview',
                'Physical Assessment': 'physical_assessment',
                'Medical Records Review Summary': 'medical_records_review_summary',
                'Tissue Recovery Information': 'tissue_recovery_information',
                'Plasma Dilution': 'plasma_dilution',
                'Authorization for Tissue Donation': 'authorization_for_tissue_donation',
                'Infectious Disease Testing': 'infectious_disease_testing',
                'Medical Records': 'medical_records'
              };

              // Initial Paperwork items
              const initialPaperwork = [
                {
                  displayName: 'Donor Log-In Information Packet',
                  extractionKey: 'donor_log_in_information_packet'
                },
                {
                  displayName: 'Donor Information',
                  extractionKey: 'donor_information'
                },
                {
                  displayName: 'Donor Risk Assessment Interview (DRAI)',
                  extractionKey: 'donor_risk_assessment_interview'
                },
                {
                  displayName: 'Physical Assessment',
                  extractionKey: 'physical_assessment'
                },
                {
                  displayName: 'Medical Records Review Summary',
                  extractionKey: 'medical_records_review_summary'
                },
                {
                  displayName: 'Tissue Recovery Information',
                  extractionKey: 'tissue_recovery_information'
                },
                {
                  displayName: 'Plasma Dilution',
                  extractionKey: 'plasma_dilution'
                },
                {
                  displayName: 'Authorization for Tissue Donation',
                  extractionKey: 'authorization_for_tissue_donation'
                },
                {
                  displayName: 'Infectious Disease Testing',
                  extractionKey: 'infectious_disease_testing'
                },
                {
                  displayName: 'Medical Records',
                  extractionKey: 'medical_records'
                }
              ];

              // Conditional documents - map to topic results
              const conditionalDocuments = [
                {
                  name: 'Autopsy report',
                  condition: 'Autopsy',  // Topic name
                  extractionKey: 'autopsy_report',
                  displayName: 'Autopsy report',
                  topicName: 'Autopsy'
                },
                {
                  name: 'Toxicology report',
                  condition: 'Toxicology',  // Topic name
                  extractionKey: 'toxicology_report',
                  displayName: 'Toxicology report',
                  topicName: 'Toxicology'
                },
                {
                  name: 'Skin Dermal Cultures',
                  condition: 'Prep',  // Topic name
                  extractionKey: 'skin_dermal_cultures',
                  displayName: 'Skin Dermal Cultures',
                  topicName: 'Prep'
                },
                {
                  name: 'Bioburden results',
                  condition: 'Prep',  // Topic name
                  extractionKey: 'bioburden_results',
                  displayName: 'Bioburden results',
                  topicName: 'Prep'
                }
              ];

              // Check if document is present using extraction data
              const isDocumentPresent = (extractionKey: string): boolean => {
                if (!extractionData?.extracted_data) return false;
                const section = extractionData.extracted_data[extractionKey];
                return section?.present === true;
              };

              // Check conditional document status - uses conditional_documents first, falls back to topic results
              const getConditionalStatus = (extractionKey: string, topicName?: string) => {
                // First, check conditional_documents from backend
                if (extractionData?.conditional_documents) {
                  const conditionalDocs = extractionData.conditional_documents as any;
                  let doc: any = null;
                  
                  if (extractionKey === 'autopsy_report') {
                    doc = conditionalDocs.autopsy_report;
                  } else if (extractionKey === 'toxicology_report') {
                    doc = conditionalDocs.toxicology_report;
                  } else if (extractionKey === 'skin_dermal_cultures') {
                    doc = conditionalDocs.skin_dermal_cultures || conditionalDocs.skinDermalCultures;
                  } else if (extractionKey === 'bioburden_results') {
                    doc = conditionalDocs.bioburden_results;
                  }
                  
                  if (doc) {
                    const status = doc.conditional_status;
                    if (status && typeof status === 'string') {
                      return status.includes('CONDITION MET') ? 'met' : 'not_met';
                    }
                  }
                }
                
                // Fallback: Check topic results if topicName is provided
                if (topicName && extractionData?.topics) {
                  const topicResult = extractionData.topics[topicName];
                  if (topicResult) {
                    const decision = topicResult.decision?.toLowerCase();
                    const conditionResult = topicResult.condition_result?.toLowerCase();
                    
                    // For "done_or_not" topics, check if decision is "Yes"
                    if (decision === 'yes' || conditionResult === 'positive' || conditionResult === 'yes') {
                      return 'met';
                    } else if (decision === 'no' || conditionResult === 'negative' || conditionResult === 'no') {
                      return 'not_met';
                    }
                  }
                }
                
                return null;
              };

              // Get reviewer info - return null if not available (remove hardcoded data)
              const getReviewerInfo = (docName: string) => {
                // Reviewer information not available from backend yet
                return null;
              };

              return (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-md font-semibold mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-gray-700" />
                  Required Documentation
                </h3>
                  <div className="space-y-2">
                    {/* Initial Paperwork */}
                    {initialPaperwork.map((item, index) => {
                      const isPresent = isDocumentPresent(item.extractionKey);
                      const reviewerInfo = getReviewerInfo(item.displayName);
                      
                      return (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-2 rounded ${
                            isPresent
                              ? 'bg-gray-50'
                              : 'bg-gray-50 opacity-60'
                          }`}
                        >
                          <span className="text-sm text-gray-900">{item.displayName}</span>
                          <div className="flex items-center gap-3">
                            {isPresent && reviewerInfo && (
                              <>
                                <span className="text-xs text-gray-500">Reviewed by: {reviewerInfo.reviewer}</span>
                                <span className="text-xs text-gray-500">{reviewerInfo.date}</span>
                              </>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              isPresent
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {isPresent ? 'Completed' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Conditional Documents */}
                    {conditionalDocuments.map((item, index) => {
                      const conditionalStatus = getConditionalStatus(item.extractionKey, item.topicName);
                      const isPresent = conditionalStatus === 'met';
                      const reviewerInfo = getReviewerInfo(item.displayName);
                      
                      // Format condition display - show topic name with "Performed" suffix for display
                      const conditionDisplay = item.condition === 'Prep' 
                        ? 'Fresh Tissue Processed' 
                        : `${item.condition} Performed`;
                      
                      return (
                        <div
                          key={`conditional-${index}`}
                          className={`flex items-center justify-between p-2 rounded ${
                            isPresent ? 'bg-gray-50' : 'bg-gray-50 opacity-60'
                          }`}
                        >
                          <span className="text-sm text-gray-900">{item.displayName} | {conditionDisplay}</span>
                          <div className="flex items-center gap-3">
                            {isPresent && reviewerInfo && (
                              <>
                                <span className="text-xs text-gray-500">Reviewed by: {reviewerInfo.reviewer}</span>
                                <span className="text-xs text-gray-500">{reviewerInfo.date}</span>
                              </>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              isPresent
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {isPresent ? 'Completed' : 'Not Performed'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Key Medical Findings */}
            {(() => {
              // Extract key information from criteria_evaluations
              const getExtractedMedicalInfo = () => {
                if (!extractionData?.criteria_evaluations) return null;
                
                const criteria = extractionData.criteria_evaluations;
                const info: {
                  age?: number;
                  gender?: string;
                  causeOfDeath?: string;
                  medicalHistory?: string[];
                  biopsyFindings?: string[];
                } = {};
                
                // Extract Age and Gender from "Age" criterion
                if (criteria['Age']?.extracted_data) {
                  const ageData = criteria['Age'].extracted_data;
                  if (ageData.donor_age) info.age = ageData.donor_age;
                  if (ageData.gender) info.gender = ageData.gender;
                }
                
                // Extract Cause of Death from various criteria
                const causeOfDeathCriteria = ['High Risk Non-IV Related Drug Use', 'High Risk Behavior', 'Cause of Death'];
                for (const criterionName of causeOfDeathCriteria) {
                  if (criteria[criterionName]?.extracted_data?.cause_of_death) {
                    info.causeOfDeath = criteria[criterionName].extracted_data.cause_of_death;
                    break;
                  }
                }
                
                // Extract Medical History from various criteria
                const medicalHistoryItems: string[] = [];
                
                // From Dementia criterion
                if (criteria['Dementia']?.extracted_data) {
                  const dementiaData = criteria['Dementia'].extracted_data;
                  if (dementiaData.dementia_diagnosis) {
                    medicalHistoryItems.push(`Dementia: ${dementiaData.dementia_diagnosis}`);
                  }
                  if (dementiaData.dementia_etiology) {
                    medicalHistoryItems.push(`Dementia Etiology: ${dementiaData.dementia_etiology}`);
                  }
                }
                
                // From Long Term Illness criterion
                if (criteria['Long Term Illness']?.extracted_data) {
                  const ltiData = criteria['Long Term Illness'].extracted_data;
                  if (ltiData.long_term_illness) {
                    medicalHistoryItems.push(`Long Term Illness: ${ltiData.long_term_illness}`);
                  }
                  if (ltiData.disease_history) {
                    medicalHistoryItems.push(`Disease History: ${ltiData.disease_history}`);
                  }
                }
                
                // From Cancer criterion (biopsy findings)
                if (criteria['Cancer']?.extracted_data) {
                  const cancerData = criteria['Cancer'].extracted_data;
                  if (cancerData.cancer_type) {
                    medicalHistoryItems.push(`Cancer: ${cancerData.cancer_type}`);
                  }
                }
                
                // From Infection criterion
                if (criteria['Infection']?.extracted_data) {
                  const infectionData = criteria['Infection'].extracted_data;
                  if (infectionData.active_infection) {
                    medicalHistoryItems.push(`Active Infection: ${infectionData.active_infection}`);
                  }
                  if (infectionData.infection_type) {
                    medicalHistoryItems.push(`Infection Type: ${infectionData.infection_type}`);
                  }
                }
                
                // From Sepsis criterion
                if (criteria['Sepsis']?.extracted_data) {
                  const sepsisData = criteria['Sepsis'].extracted_data;
                  if (sepsisData.sepsis_diagnosis) {
                    medicalHistoryItems.push(`Sepsis: ${sepsisData.sepsis_diagnosis}`);
                  }
                  if (sepsisData.sepsis_symptoms) {
                    medicalHistoryItems.push(`Sepsis Symptoms: ${sepsisData.sepsis_symptoms}`);
                  }
                }
                
                // From Diabetes criterion
                if (criteria['Diabetes']?.extracted_data) {
                  const diabetesData = criteria['Diabetes'].extracted_data;
                  if (diabetesData.diabetes_amputation) {
                    medicalHistoryItems.push(`Diabetes Amputation: ${diabetesData.diabetes_amputation}`);
                  }
                }
                
                if (medicalHistoryItems.length > 0) {
                  info.medicalHistory = medicalHistoryItems;
                }
                
                // Extract biopsy findings from Cancer criterion
                if (criteria['Cancer']?.extracted_data) {
                  const cancerData = criteria['Cancer'].extracted_data;
                  const biopsyFindings: string[] = [];
                  
                  // Look for biopsy-related findings
                  if (cancerData.cancer_type && cancerData.cancer_type.toLowerCase().includes('negative')) {
                    biopsyFindings.push(cancerData.cancer_type);
                  }
                  
                  if (biopsyFindings.length > 0) {
                    info.biopsyFindings = biopsyFindings;
                  }
                }
                
                return Object.keys(info).length > 0 ? info : null;
              };
              
              const extractedInfo = getExtractedMedicalInfo();
              const hasKeyFindings = extractionData?.key_medical_findings && Object.keys(extractionData.key_medical_findings).length > 0;
              const hasExtractedInfo = extractedInfo !== null;
              
              if (!hasKeyFindings && !hasExtractedInfo) {
                return null;
              }
              
              return (
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-md font-semibold mb-3 flex items-center">
                    <Stethoscope className="h-4 w-4 mr-2 text-gray-700" />
                    Key Medical Findings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Extracted Demographics */}
                    {extractedInfo && (extractedInfo.age || extractedInfo.gender) && (
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Demographics</h4>
                        <div className="space-y-1 text-xs text-gray-700">
                          {extractedInfo.age && (
                            <p><span className="font-medium">Age:</span> {extractedInfo.age} years</p>
                          )}
                          {extractedInfo.gender && (
                            <p><span className="font-medium">Gender:</span> {extractedInfo.gender}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Extracted Cause of Death */}
                    {extractedInfo?.causeOfDeath && (
                      <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Cause of Death</h4>
                        <p className="text-xs text-gray-700">{extractedInfo.causeOfDeath}</p>
                      </div>
                    )}
                    
                    {/* Extracted Medical History */}
                    {extractedInfo?.medicalHistory && extractedInfo.medicalHistory.length > 0 && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Medical History</h4>
                        <ul className="space-y-1 text-xs text-gray-700">
                          {extractedInfo.medicalHistory.map((item, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Extracted Biopsy Findings */}
                    {extractedInfo?.biopsyFindings && extractedInfo.biopsyFindings.length > 0 && (
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Biopsy Findings</h4>
                        <ul className="space-y-1 text-xs text-gray-700">
                          {extractedInfo.biopsyFindings.map((finding, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-1">•</span>
                              <span>{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Legacy Key Medical Findings */}
                    {extractionData.key_medical_findings?.tissue_quality && (
                      <div className={`p-3 rounded-lg border ${
                        extractionData.key_medical_findings.tissue_quality?.status === 'Good' 
                          ? 'bg-green-50 border-green-100' 
                          : extractionData.key_medical_findings.tissue_quality?.status === 'Review Required'
                          ? 'bg-yellow-50 border-yellow-100'
                          : 'bg-gray-50 border-gray-100'
                      }`}>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Tissue Quality</h4>
                        <p className="text-xs text-gray-700">
                          {extractionData.key_medical_findings.tissue_quality?.description || '-'}
                        </p>
                      </div>
                    )}
                    {extractionData.key_medical_findings?.bone_density && (
                      <div className={`p-3 rounded-lg border ${
                        extractionData.key_medical_findings.bone_density?.status === 'Available' 
                          ? 'bg-green-50 border-green-100' 
                          : 'bg-gray-50 border-gray-100'
                      }`}>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Bone Density</h4>
                        <p className="text-xs text-gray-700">
                          {extractionData.key_medical_findings.bone_density?.description || '-'}
                        </p>
                      </div>
                    )}
                    {extractionData.key_medical_findings?.cardiovascular_health && (
                      <div className={`p-3 rounded-lg border ${
                        extractionData.key_medical_findings.cardiovascular_health?.status === 'No significant findings' 
                          ? 'bg-green-50 border-green-100' 
                          : 'bg-blue-50 border-blue-100'
                      }`}>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Cardiovascular Health</h4>
                        <p className="text-xs text-gray-700">
                          {extractionData.key_medical_findings.cardiovascular_health?.description || '-'}
                        </p>
                      </div>
                    )}
                    {extractionData.key_medical_findings?.medical_history && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Medical History (Legacy)</h4>
                        <p className="text-xs text-gray-700">
                          {extractionData.key_medical_findings.medical_history?.description || '-'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Eligibility Status Summary */}
            {extractionData?.eligibility && (
              <EligibilityStatusSection eligibility={extractionData.eligibility} />
            )}

            {/* Criteria Evaluations Summary */}
            {extractionData?.criteria_evaluations && Object.keys(extractionData.criteria_evaluations).length > 0 && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-md font-semibold mb-3 flex items-center">
                  <FileCheck className="h-4 w-4 mr-2 text-gray-700" />
                  Criteria Evaluations Summary
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-2xl font-bold text-gray-900">
                      {Object.keys(extractionData.criteria_evaluations).length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Total Criteria</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                    <p className="text-2xl font-bold text-green-700">
                      {Object.values(extractionData.criteria_evaluations).filter((e: any) => e.evaluation_result === 'acceptable').length}
                    </p>
                    <p className="text-xs text-green-700 mt-1">Acceptable</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded border border-red-200">
                    <p className="text-2xl font-bold text-red-700">
                      {Object.values(extractionData.criteria_evaluations).filter((e: any) => e.evaluation_result === 'unacceptable').length}
                    </p>
                    <p className="text-xs text-red-700 mt-1">Unacceptable</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-2xl font-bold text-yellow-700">
                      {Object.values(extractionData.criteria_evaluations).filter((e: any) => e.evaluation_result === 'md_discretion').length}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">MD Discretion</p>
                  </div>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => handleTabChange('criteria')}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    View all criteria evaluations →
                  </button>
                </div>
              </div>
            )}

            {/* Critical Findings */}
            {criticalFindings.length > 0 && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-md font-semibold mb-3 flex items-center text-red-700">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Critical Findings
                </h3>
                <div className="space-y-2">
                  {criticalFindings.map((finding, index) => (
                    <div key={index} className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-900">{finding.type}</p>
                          {finding.reasoning && (
                            <p className="text-xs text-red-700 mt-1">{finding.reasoning}</p>
                          )}
                          <p className="text-xs text-red-700 mt-1">Severity: {finding.severity}</p>
                          {finding.automaticRejection && (
                            <p className="text-xs text-red-800 font-medium mt-1">Automatic Rejection</p>
                          )}
                      </div>
                      </div>
                    </div>
                  ))}
                  </div>
                    </div>
            )}

            {/* Document Summary */}
            {extractionData?.document_summary && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-md font-semibold mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-gray-700" />
                  Document Processing Summary
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-2xl font-bold text-gray-900">
                      {extractionData.document_summary.total_documents_processed}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Documents Processed</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-2xl font-bold text-gray-900">
                      {extractionData.document_summary.total_pages_processed}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Pages Processed</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-lg font-bold text-blue-700">
                      {extractionData.serology_results?.result ? Object.keys(extractionData.serology_results.result).length : 0}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">Serology Tests</p>
                  </div>
                </div>
                {extractionData.document_summary.extraction_methods_used && extractionData.document_summary.extraction_methods_used.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-2">Extraction Methods:</p>
                    <div className="flex gap-2 flex-wrap">
                      {extractionData.document_summary.extraction_methods_used.map((method, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Missing Documents */}
            {missingDocuments.length > 0 && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-md font-semibold mb-3 flex items-center text-yellow-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Missing Documents
                </h3>
                <div className="space-y-2">
                  {missingDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200">
                      <span className="text-sm text-gray-900">{doc.label}</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Missing
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Data Section - Historical Approval/Rejection Records */}
            <PastDataSection data={pastData} loading={loadingPastData} />
          </div>
        );

      case 'clinical':
        // Check if any clinical data is available
        const clinicalHasSerology = extractionData?.serology_results?.result && Object.keys(extractionData.serology_results.result).length > 0;
        const clinicalHasCulture = extractionData?.culture_results?.result && extractionData.culture_results.result.length > 0;
        const clinicalHasTerminalInfo = extractionData?.terminal_information;
        
        // If no clinical data is available, show empty state
        if (
          !clinicalHasSerology &&
          !clinicalHasCulture &&
          !clinicalHasTerminalInfo
        ) {
          return (
            <Card className="p-6">
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Clinical Information</h2>
                <p className="text-sm text-gray-500">No clinical data available for this donor.</p>
              </div>
            </Card>
          );
        }
        
        return (
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Infection & Immunology */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-md font-semibold mb-3 flex items-center text-red-700">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Infection & Immunology
                </h3>
                <div className="space-y-4">
                  {/* Serology Results - Check root level serology_results first, then infectious_disease_testing */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Serology Results</h4>
                    {extractionData?.serology_results?.result && Object.keys(extractionData.serology_results.result).length > 0 ? (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(extractionData.serology_results.result).slice(0, 4).map(([testName, resultData]) => {
                            // Handle both new format (object with result and method) and legacy format (just result string)
                            const resultValue = typeof resultData === 'object' && resultData !== null && 'result' in resultData
                              ? resultData.result
                              : resultData;
                            const method = typeof resultData === 'object' && resultData !== null && 'method' in resultData
                              ? resultData.method
                              : null;
                            
                            const resultStr = resultValue ? String(resultValue).toLowerCase().trim() : '';
                            // First check for negative patterns - if found, it's NOT positive
                            const negativePatterns = ['non-reactive', 'non reactive', 'nonreactive', 'negative', 'neg'];
                            const isNegative = negativePatterns.some(pattern => resultStr.includes(pattern));
                            
                            // Only check for positive if it's not negative
                            const isPositive = !isNegative && (resultStr.includes('positive') || resultStr.includes('reactive'));
                            return (
                              <div key={testName} className="bg-gray-50 p-2 rounded">
                                <div className="text-xs text-gray-500 mb-1.5 truncate" title={testName}>
                                  {testName || '-'}
                                </div>
                                {method && (
                                  <div className="text-xs text-gray-400 mb-1 italic truncate" title={method}>
                                    {method}
                                  </div>
                                )}
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                  isPositive 
                                    ? 'bg-red-100 text-red-700 border border-red-200' 
                                    : 'bg-green-100 text-green-700 border border-green-200'
                                }`}>
                                  {resultValue ? String(resultValue) : '-'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-2">
                          <a
                            href="#infectious-disease"
                            onClick={(e) => {
                              e.preventDefault();
                              handleTabChange('infectious-disease');
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            View detailed test results →
                          </a>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-gray-500">No serology results available</p>
                    )}
                  </div>

                  {/* Culture Results */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Culture Results</h4>
                    {extractionData?.culture_results?.result && extractionData.culture_results.result.length > 0 ? (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          {extractionData.culture_results.result.slice(0, 2).map((culture: any, idx: number) => {
                            // Parse culture data - handle stringified dictionaries
                            let parsedCulture = culture;
                            if (typeof culture === 'string') {
                              try {
                                // Try to parse stringified Python dict (replace single quotes with double quotes)
                                const jsonString = culture.replace(/'/g, '"');
                                parsedCulture = JSON.parse(jsonString);
                              } catch (e) {
                                // If parsing fails, treat as regular string
                                parsedCulture = { result: culture };
                              }
                            }
                            
                            // Check if it's old format (tissue_location + microorganism) or new format (test_name + result)
                            const isOldFormat = parsedCulture?.tissue_location || parsedCulture?.microorganism;
                            const isNewFormat = parsedCulture?.test_name || parsedCulture?.Test_Name || parsedCulture?.result || parsedCulture?.Result;
                            
                            if (isOldFormat) {
                              // Old format: tissue_location + microorganism
                              const microorganism = parsedCulture?.microorganism || 'No Growth';
                              const hasGrowth = microorganism && 
                                microorganism.toLowerCase() !== 'no growth' && 
                                microorganism.toLowerCase() !== 'negative';
                              
                              return (
                                <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
                                  <div className="text-xs font-semibold text-gray-900 mb-2">
                                    {parsedCulture?.tissue_location || 'Culture'}
                                  </div>
                                  <div className={`text-sm font-semibold mb-1 ${
                                    hasGrowth ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {microorganism}
                                  </div>
                                  {parsedCulture?.collection_date && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Collected: {parsedCulture.collection_date}
                                    </div>
                                  )}
                                  {parsedCulture?.preliminary_result && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {parsedCulture.preliminary_result}
                                    </div>
                                  )}
                                  {parsedCulture?.status && parsedCulture.status.toLowerCase() === 'pending' && (
                                    <div className="text-xs text-orange-600 font-medium mt-1">
                                      Pending
                                    </div>
                                  )}
                                </div>
                              );
                            } else if (isNewFormat) {
                              // New format: test_name + result + optional fields
                              const testName = parsedCulture?.test_name || parsedCulture?.Test_Name || 'Culture';
                              const resultValue = parsedCulture?.result || parsedCulture?.Result || '';
                              const resultStr = resultValue.toLowerCase().trim();
                              
                              // Check for negative patterns
                              const negativePatterns = ['no growth', 'negative', 'neg', 'no organisms', 'not detected'];
                              const isNegative = negativePatterns.some(pattern => resultStr.includes(pattern));
                              
                              // Check for pending status
                              const isPending = parsedCulture?.status?.toLowerCase() === 'pending' || 
                                               parsedCulture?.Status?.toLowerCase() === 'pending';
                              
                              // Determine if there's growth (positive result)
                              const hasGrowth = !isNegative && !isPending && (
                                resultStr.includes('positive') || 
                                resultStr.includes('detected') || 
                                (resultStr.length > 0 && !resultStr.includes('no'))
                              );
                              
                              return (
                                <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
                                  <div className="text-xs font-semibold text-gray-900 mb-2">
                                    {testName}
                                  </div>
                                  {parsedCulture?.specimen_type && (
                                    <div className="text-xs text-gray-500 mb-1 italic">
                                      {parsedCulture.specimen_type}
                                    </div>
                                  )}
                                  {isPending ? (
                                    <div className="text-sm font-semibold text-orange-600 mb-1">
                                      Pending
                                    </div>
                                  ) : (
                                    <div className={`text-sm font-semibold mb-1 ${
                                      hasGrowth ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                      {resultValue || 'No Growth'}
                                    </div>
                                  )}
                                  {(parsedCulture?.specimen_date || parsedCulture?.Specimen_Date_Time || parsedCulture?.collection_date) && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Collected: {parsedCulture.specimen_date || parsedCulture.Specimen_Date_Time || parsedCulture.collection_date}
                                    </div>
                                  )}
                                  {parsedCulture?.preliminary_result && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {parsedCulture.preliminary_result}
                                    </div>
                                  )}
                                </div>
                              );
                            } else {
                              // Fallback for unknown format - try to display whatever we have
                              return (
                                <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
                                  <div className="text-xs font-semibold text-gray-900 mb-2">Culture</div>
                                  <div className="text-sm font-semibold text-gray-600">-</div>
                                </div>
                              );
                            }
                          })}
                        </div>
                        {extractionData.culture_results.result.length > 2 && (
                          <div className="mt-2">
                            <a
                              href="#infectious-disease"
                              onClick={(e) => {
                                e.preventDefault();
                                handleTabChange('infectious-disease');
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              View detailed culture results →
                            </a>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-gray-500">No culture results available</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical History Assessment */}
              {extractionData?.extracted_data?.medical_records_review_summary && (
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-md font-semibold mb-3 flex items-center text-blue-700">
                    <FileText className="h-4 w-4 mr-2" />
                    Medical History
                  </h3>
                  <div className="space-y-3">
                    {extractionData.extracted_data.medical_records_review_summary.summary && (
                      <>
                        {extractionData.extracted_data.medical_records_review_summary.summary.Diagnoses && (
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-2">Diagnoses</h4>
                            <ul className="space-y-1.5">
                              {Array.isArray(extractionData.extracted_data.medical_records_review_summary.summary.Diagnoses) ? (
                                extractionData.extracted_data.medical_records_review_summary.summary.Diagnoses.slice(0, 5).map((diag: string, idx: number) => (
                                  <li key={idx} className="flex items-start text-sm">
                                    <span className="text-gray-500 mr-2">•</span>
                                    <span>{diag || '-'}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="flex items-start text-sm">
                                  <span className="text-gray-500 mr-2">•</span>
                                  <span>{extractionData.extracted_data.medical_records_review_summary.summary.Diagnoses ? String(extractionData.extracted_data.medical_records_review_summary.summary.Diagnoses) : '-'}</span>
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                        {extractionData.extracted_data.medical_records_review_summary.summary.Procedures && (
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-2">Procedures</h4>
                            <ul className="space-y-1.5">
                              {Array.isArray(extractionData.extracted_data.medical_records_review_summary.summary.Procedures) ? (
                                extractionData.extracted_data.medical_records_review_summary.summary.Procedures.slice(0, 3).map((proc: string, idx: number) => (
                                  <li key={idx} className="flex items-start text-sm">
                                    <span className="text-gray-500 mr-2">•</span>
                                    <span>{proc || '-'}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="flex items-start text-sm">
                                  <span className="text-gray-500 mr-2">•</span>
                                  <span>{extractionData.extracted_data.medical_records_review_summary.summary.Procedures ? String(extractionData.extracted_data.medical_records_review_summary.summary.Procedures) : '-'}</span>
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Risk Assessment */}
              {extractionData?.extracted_data?.donor_risk_assessment_interview && (
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-md font-semibold mb-3 flex items-center text-yellow-700">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Risk Assessment
                  </h3>
                  <div className="space-y-3">
                    {extractionData.extracted_data.donor_risk_assessment_interview.extracted_data?.Risk_Factors && (
                      <div className="bg-yellow-50 p-3 rounded">
                        <h4 className="text-xs font-medium text-yellow-800 mb-2">Risk Factors</h4>
                        <ul className="space-y-1 text-sm text-yellow-700">
                          {Object.entries(extractionData.extracted_data.donor_risk_assessment_interview.extracted_data.Risk_Factors || {}).map(([key, value]) => (
                            <li key={key} className="flex items-start">
                              <CheckCircle className="w-4 h-4 mr-1.5 text-green-500 mt-0.5" />
                              <span>{key || '-'}: {value ? String(value) : '-'}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {extractionData.extracted_data.donor_risk_assessment_interview.extracted_data?.Social_History && (
                      <div className="bg-blue-50 p-3 rounded">
                        <h4 className="text-xs font-medium text-blue-800 mb-2">Social History</h4>
                        <ul className="space-y-1 text-sm text-blue-700">
                          {Object.entries(extractionData.extracted_data.donor_risk_assessment_interview.extracted_data.Social_History || {}).map(([key, value]) => (
                            <li key={key} className="flex items-start">
                              <CheckCircle className="w-4 h-4 mr-1.5 text-green-500 mt-0.5" />
                              <span>{key || '-'}: {value ? String(value) : '-'}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Terminal Events & Medications */}
              {extractionData?.terminal_information && (
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-md font-semibold mb-3 flex items-center text-purple-700">
                    <Clock className="h-4 w-4 mr-2" />
                    Terminal Events & Medications
                  </h3>
                  <div className="space-y-4">
                    {extractionData.terminal_information?.cause_of_death && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 mb-2">Cause of Death Details</h4>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-sm font-medium">{extractionData.terminal_information.cause_of_death || '-'}</p>
                          {extractionData.processing_timestamp && (
                            <p className="text-xs text-gray-500 mt-1">
                              Processing Time: {new Date(extractionData.processing_timestamp).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 mb-2">Terminal Course</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className={`p-2 rounded ${
                          extractionData.terminal_information?.hypotension === 'Present' 
                            ? 'bg-red-50' 
                            : 'bg-gray-50'
                        }`}>
                          <div className="text-xs text-gray-500">Hypotension</div>
                          <div className={`text-sm font-medium ${
                            extractionData.terminal_information?.hypotension === 'Present' 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            {extractionData.terminal_information?.hypotension || '-'}
                          </div>
                        </div>
                        <div className={`p-2 rounded ${
                          extractionData.terminal_information?.sepsis === 'Present' 
                            ? 'bg-red-50' 
                            : 'bg-gray-50'
                        }`}>
                          <div className="text-xs text-gray-500">Sepsis</div>
                          <div className={`text-sm font-medium ${
                            extractionData.terminal_information?.sepsis === 'Present' 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            {extractionData.terminal_information?.sepsis || '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                    {extractionData.extracted_data?.medical_records_review_summary?.summary?.Medications && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 mb-2">Medications</h4>
                        <div className="bg-gray-50 p-2 rounded">
                          {Array.isArray(extractionData.extracted_data.medical_records_review_summary.summary.Medications) ? (
                            <ul className="space-y-1">
                              {extractionData.extracted_data.medical_records_review_summary.summary.Medications.slice(0, 3).map((med: string, idx: number) => (
                                <li key={idx} className="text-xs text-gray-700">• {med || '-'}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-gray-700">{extractionData.extracted_data.medical_records_review_summary.summary.Medications ? String(extractionData.extracted_data.medical_records_review_summary.summary.Medications) : '-'}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );


      case 'drai':
        // Try both keys - backend uses donor_risk_assessment_interview, types use drai
        const draiData = extractionData?.extracted_data?.donor_risk_assessment_interview || extractionData?.extracted_data?.drai;
        if (!draiData) {
          return (
            <Card className="p-6">
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Donor Risk Assessment Interview (DRAI)</h2>
                <p className="text-sm text-gray-500">No DRAI data available for this donor.</p>
              </div>
            </Card>
          );
        }
        return <DRAISection data={draiData} documents={documents} onCitationClick={handleCitationClick} />;

      case 'infectious-disease':
        // Show infectious disease tab if we have any related data
        const infectiousDiseaseData = extractionData?.extracted_data?.infectious_disease_testing;
        const hasSerology = extractionData?.serology_results?.result && Object.keys(extractionData.serology_results.result).length > 0;
        const hasCulture = extractionData?.culture_results?.result && extractionData.culture_results.result.length > 0;
        const hasCriticalLabs = extractionData?.critical_lab_values && Object.values(extractionData.critical_lab_values).some(v => v !== null);
        
        if (!infectiousDiseaseData && !hasSerology && !hasCulture && !hasCriticalLabs) {
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">Infectious disease testing data not available.</p>
            </div>
          );
        }
        
        return (
          <InfectiousDiseaseSection
            data={infectiousDiseaseData}
            serologyResults={extractionData?.serology_results?.result}
            cultureResults={extractionData?.culture_results?.result}
            criticalLabValues={extractionData?.critical_lab_values}
            documents={documents}
            onCitationClick={handleCitationClick}
          />
        );

      case 'conditional-docs':
        if (!extractionData?.conditional_documents) {
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">Conditional documents data not available.</p>
          </div>
        );
        }
        return <ConditionalDocumentsSection data={extractionData.conditional_documents} documents={documents} onCitationClick={handleCitationClick} />;

      case 'plasma-dilution':
        const plasmaDilutionData = extractionData?.extracted_data?.plasma_dilution;
        if (!plasmaDilutionData) {
          return (
            <Card className="p-6">
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Plasma Dilution</h2>
                <p className="text-sm text-gray-500">No plasma dilution data available for this donor.</p>
              </div>
            </Card>
          );
        }
        return <PlasmaDilutionSection data={plasmaDilutionData} documents={documents} onCitationClick={handleCitationClick} />;

      case 'eligibility':
        return <EligibilityStatusSection eligibility={extractionData?.eligibility} />;

      case 'criteria':
        return <CriteriaEvaluationsSection criteriaEvaluations={extractionData?.criteria_evaluations} />;

      default:
        return null;
    }
  };

  // Handle citation click
  const handleCitationClick = async (sourceDocument: string, pageNumber?: number, documentId?: number) => {
    // If document_id is provided, use it directly - backend will query the database
    // We don't need the document to be in the local documents array
    if (documentId) {
      try {
        // Use proxied PDF endpoint that streams with proper CORS headers
        // The backend endpoint queries the database directly, so we don't need the document locally
        const pdfUrl = apiService.getDocumentPdfUrl(documentId);
        
        // Try to get document name from local array if available, otherwise use sourceDocument
        const document = documents.find(doc => doc.id === documentId);
        const documentName = document?.original_filename || document?.filename || sourceDocument;
        
        setSelectedPdfUrl(pdfUrl);
        setSelectedPageNumber(pageNumber || undefined);
        setSelectedDocumentName(documentName);
        setSelectedDocumentId(documentId);
        return;
      } catch (error) {
        console.error('Error getting PDF URL:', error);
        // Fall through to fallback behavior
      }
    }
    
    // Fallback: Try to match by source_document name (backward compatibility)
    if (sourceDocument) {
      const matchedDocument = documents.find(doc => {
        const originalName = doc.original_filename?.toLowerCase() || '';
        const sourceName = sourceDocument.toLowerCase();
        return originalName.includes(sourceName) || sourceName.includes(originalName);
      });
      
      if (matchedDocument) {
        try {
          // Use proxied PDF endpoint for matched document
          const pdfUrl = apiService.getDocumentPdfUrl(matchedDocument.id);
          setSelectedPdfUrl(pdfUrl);
          setSelectedPageNumber(pageNumber || undefined);
          setSelectedDocumentName(matchedDocument.original_filename || matchedDocument.filename || sourceDocument);
          setSelectedDocumentId(matchedDocument.id);
          return;
        } catch (error) {
          console.error('Error getting PDF URL for matched document:', error);
          // Fall through to final fallback
        }
      }
    }
    
    // No document found - do not open PDF viewer
    // Log for debugging but don't show hardcoded fallback
    console.warn('No document found for citation:', { sourceDocument, pageNumber, documentId });
  };

  if (!donor) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/documents/${id}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Back to Documents</span>
        </button>
      </div>

      {/* Approval/Rejection Actions - Visible to Medical Directors */}
      {(userRole === 'medical_director' || userRole === 'admin') && (
        <div className="mb-6 flex justify-end space-x-3">
          <Button
            onClick={() => {
              setApprovalType('donor_summary');
              setShowApprovalModal(true);
            }}
            variant="primary"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve/Reject Donor Summary
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8 overflow-x-auto">
        <nav className="-mb-px flex space-x-8 min-w-max" aria-label="Tabs">
          {SUMMARY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon
                className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${
                    activeTab === tab.id
                      ? 'text-blue-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }
                `}
              />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Loading Indicator for Extraction Data */}
      {loadingExtraction && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-blue-700">Loading extraction data...</span>
        </div>
      )}

      {/* Tab Content with PDF Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={selectedPdfUrl ? "lg:col-span-2" : "lg:col-span-3"}>
      {renderTabContent()}
        </div>
        {/* PDF Viewer Sidebar - Only shown when citation is clicked */}
        {selectedPdfUrl && (
          <div className="lg:col-span-1 sticky top-4 h-[calc(100vh-2rem)]">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {selectedDocumentName || 'Document'}
                  </h3>
                  {selectedPageNumber && (
                    <p className="text-xs text-gray-500">Page {selectedPageNumber}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedPdfUrl(null);
                    setSelectedPageNumber(null);
                    setSelectedDocumentName(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors ml-2 flex-shrink-0"
                  aria-label="Close viewer"
                >
                  <XCircle className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden bg-gray-50">
                <PDFViewerWithPage
                  pdfUrl={selectedPdfUrl}
                  pageNumber={selectedPageNumber || 1}
                  onClose={() => {
                    setSelectedPdfUrl(null);
                    setSelectedPageNumber(null);
                    setSelectedDocumentName(null);
                    setSelectedDocumentId(null);
                  }}
                  documentName={selectedDocumentName || 'Document'}
                  documentId={selectedDocumentId || undefined}
                />
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Finding Details Modal */}
      {selectedFinding && (
        <FindingDetailsModal
          finding={selectedFinding}
          isOpen={!!selectedFinding}
          onClose={() => setSelectedFinding(null)}
          documents={documents}
          onCitationClick={handleCitationClick}
        />
      )}

      {/* Approval/Rejection Modal */}
      {showApprovalModal && (
        <ApprovalRejectionModal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          onConfirm={handleApprovalRejection}
          donorId={Number(id)}
          documentId={null}
          approvalType={approvalType}
          donorName={donor?.donorName}
        />
      )}
    </div>
  );
} 