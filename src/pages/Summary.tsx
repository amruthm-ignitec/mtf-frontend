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
import PhysicalAssessmentSection from '../components/donor/PhysicalAssessmentSection';
import AuthorizationSection from '../components/donor/AuthorizationSection';
import DRAISection from '../components/donor/DRAISection';
import InfectiousDiseaseSection from '../components/donor/InfectiousDiseaseSection';
import TissueRecoverySection from '../components/donor/TissueRecoverySection';
import ComplianceSection from '../components/donor/ComplianceSection';
import ConditionalDocumentsSection from '../components/donor/ConditionalDocumentsSection';
import MedicalRecordsReviewSection from '../components/donor/MedicalRecordsReviewSection';
import PlasmaDilutionSection from '../components/donor/PlasmaDilutionSection';
import PastDataSection from '../components/donor/PastDataSection';
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
  { id: 'physical-assessment', label: 'Physical Assessment', icon: UserCheck },
  { id: 'authorization', label: 'Authorization', icon: FileCheck },
  { id: 'drai', label: 'DRAI', icon: User },
  { id: 'infectious-disease', label: 'Infectious Disease', icon: FlaskConical },
  { id: 'tissue-recovery', label: 'Tissue Recovery', icon: Package },
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
            gender: donorFromState.gender || extractionDataResponse.extracted_data?.donor_information?.extracted_data?.Gender || 'Unknown',
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
            gender: donorInfo.Gender || 'Unknown',
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
          gender: donorFromState?.gender || 'Unknown',
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
                        Time of Death: {new Date(donor.uploadTimestamp).toLocaleString()}
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
            {extractionData?.key_medical_findings && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-md font-semibold mb-3 flex items-center">
                  <Stethoscope className="h-4 w-4 mr-2 text-gray-700" />
                  Key Medical Findings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Medical History</h4>
                      <p className="text-xs text-gray-700">
                        {extractionData.key_medical_findings.medical_history?.description || '-'}
                      </p>
                    </div>
                  )}
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
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(extractionData.serology_results.result).slice(0, 4).map(([testName, result]) => {
                          const resultStr = result ? String(result).toLowerCase() : '';
                          const isPositive = resultStr.includes('reactive') || resultStr.includes('positive');
                          return (
                            <div key={testName} className="bg-gray-50 p-2 rounded">
                              <div className="text-xs text-gray-500">{testName || '-'}</div>
                              <div className={`text-sm font-medium ${
                                isPositive ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {result ? String(result) : '-'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : extractionData?.extracted_data?.infectious_disease_testing?.serology_report?.report_type ? (
                      // Fallback to old structure if available
                      <div>
                        <div className="mb-2">
                          <p className="text-xs text-gray-600">
                            Report Type: {extractionData.extracted_data.infectious_disease_testing.serology_report.report_type}
                          </p>
                        </div>
                        {extractionData.extracted_data.infectious_disease_testing.other_tests && (
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(extractionData.extracted_data.infectious_disease_testing.other_tests)
                              .filter(([key, value]) => 
                                value && 
                                typeof value === 'object' &&
                                'result' in value && 
                                value.result && 
                                (key.includes('sample') || key.includes('report') || key.includes('laboratory'))
                              )
                              .slice(0, 6)
                              .map(([key, value]: [string, any]) => (
                                <div key={key} className="bg-gray-50 p-2 rounded">
                                  <div className="text-xs text-gray-500">{value?.test_name || key || '-'}</div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {value?.result || '-'}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No serology results available</p>
                    )}
                    {(extractionData?.serology_results?.result || extractionData?.extracted_data?.infectious_disease_testing) && (
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
                    )}
                  </div>

                  {/* Culture Results */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Culture Results</h4>
                    {extractionData?.culture_results?.result && extractionData.culture_results.result.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {extractionData.culture_results.result.slice(0, 2).map((culture: any, idx: number) => {
                          const microorganism = culture?.microorganism || '';
                          const hasGrowth = microorganism && microorganism.toLowerCase() !== 'no growth' && microorganism.toLowerCase() !== 'negative';
                          return (
                            <div key={idx} className="bg-gray-50 p-2 rounded">
                              <div className="text-xs text-gray-500">{culture?.tissue_location || 'Culture'}</div>
                              <div className={`text-sm font-medium ${
                                hasGrowth ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {microorganism || '-'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
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


      case 'physical-assessment':
        // Show partial data if available
        if (!extractionData?.extracted_data?.physical_assessment) {
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">Physical assessment data not available.</p>
            </div>
          );
        }
        return <PhysicalAssessmentSection data={extractionData.extracted_data.physical_assessment} onCitationClick={handleCitationClick} />;

      case 'authorization':
        // Check for authorization_for_tissue_donation key
        const authorizationData = extractionData?.extracted_data?.authorization_for_tissue_donation || extractionData?.extracted_data?.authorization;
        if (!authorizationData) {
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">Authorization data not available.</p>
            </div>
          );
        }
        return <AuthorizationSection data={authorizationData} onCitationClick={handleCitationClick} />;

      case 'drai':
        if (!extractionData?.extracted_data?.donor_risk_assessment_interview && !extractionData?.extracted_data?.drai) {
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">DRAI data not available.</p>
                    </div>
          );
        }
        // Try both keys - backend uses donor_risk_assessment_interview, types use drai
        const draiData = extractionData.extracted_data.donor_risk_assessment_interview || extractionData.extracted_data.drai;
        return <DRAISection data={draiData} onCitationClick={handleCitationClick} />;

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
            onCitationClick={handleCitationClick}
          />
        );

      case 'tissue-recovery':
        // Show tissue recovery tab if we have either tissue_recovery_information or tissue_eligibility
        const tissueRecoveryData = extractionData?.extracted_data?.tissue_recovery_information || extractionData?.extracted_data?.tissue_recovery;
        const eligibilityData = extractionData?.tissue_eligibility;
        
        // Always show the tab if we have eligibility data, even if recovery info is missing
        if (!tissueRecoveryData && !eligibilityData) {
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">Tissue recovery data not available.</p>
            </div>
          );
        }
        
        return <TissueRecoverySection 
          data={tissueRecoveryData} 
          eligibilityData={eligibilityData}
          onCitationClick={handleCitationClick} 
        />;


      case 'conditional-docs':
        if (!extractionData?.conditional_documents) {
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">Conditional documents data not available.</p>
          </div>
        );
        }
        return <ConditionalDocumentsSection data={extractionData.conditional_documents} onCitationClick={handleCitationClick} />;

      case 'plasma-dilution':
        const plasmaDilutionData = extractionData?.extracted_data?.plasma_dilution;
        if (!plasmaDilutionData) {
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">Plasma dilution data not available.</p>
            </div>
          );
        }
        return <PlasmaDilutionSection data={plasmaDilutionData} onCitationClick={handleCitationClick} />;

      default:
        return null;
    }
  };

  // Handle citation click
  const handleCitationClick = async (sourceDocument: string, pageNumber?: number, documentId?: number) => {
    // If document_id is provided, use proxied PDF endpoint (avoids CORS issues)
    if (documentId) {
      const document = documents.find(doc => doc.id === documentId);
      if (document) {
        try {
          // Use proxied PDF endpoint that streams with proper CORS headers
          const pdfUrl = apiService.getDocumentPdfUrl(documentId);
          setSelectedPdfUrl(pdfUrl);
          setSelectedPageNumber(pageNumber || undefined);
          setSelectedDocumentName(document.original_filename || document.filename || sourceDocument);
          return;
        } catch (error) {
          console.error('Error getting PDF URL:', error);
          // Fall through to fallback behavior
        }
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
          return;
        } catch (error) {
          console.error('Error getting PDF URL for matched document:', error);
          // Fall through to final fallback
        }
      }
    }
    
    // Final fallback: Use local PDF (for old data or missing documents)
    const localPdfUrl = '/chart-review-document.pdf';
    setSelectedPdfUrl(localPdfUrl);
    setSelectedPageNumber(pageNumber || undefined);
    setSelectedDocumentName(sourceDocument || 'Initial and Conditional documents for chart review');
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
                  }}
                  documentName={selectedDocumentName || 'Document'}
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