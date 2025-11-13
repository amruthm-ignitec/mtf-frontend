import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FindingSummary, DonorRecord, MDSummarySection, ExtractionDataResponse } from '../types';
import { ApprovalStatus, ApprovalType, PastDataResponse } from '../types/donorApproval';
// import { getMockMDSections } from '../services/mockData';
// ClinicalInformation and FindingsSection components moved inline
import { Clock, Heart, AlertCircle, FileText, Stethoscope, Brain, CheckCircle, Layout, FileCheck, User, AlertTriangle, ChevronRight, UserCheck, FlaskConical, Package, Shield, FileSearch, Droplets, XCircle, History, ArrowLeft } from 'lucide-react';
import FindingDetailsModal from '../components/modals/FindingDetailsModal';
import ApprovalRejectionModal from '../components/modals/ApprovalRejectionModal';
import { mockTissueAnalysis } from '../mocks/tissue-analysis-data';
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

// Inline components
const ClinicalInformation = ({ donor }: { donor: DonorRecord }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Donor Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Name</label>
          <p className="text-sm text-gray-900">{donor.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Age</label>
          <p className="text-sm text-gray-900">{donor.age || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Gender</label>
          <p className="text-sm text-gray-900">{donor.gender}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Cause of Death</label>
          <p className="text-sm text-gray-900">{donor.causeOfDeath || 'N/A'}</p>
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
        // Load test.json data directly instead of fetching from backend
        console.log('Loading test.json data...');
        const response = await fetch('/test.json');
        
        if (!response.ok) {
          throw new Error('Failed to load test.json');
        }
        
        const testData = await response.json();
        console.log('Test data loaded:', testData);
        
        // Set extraction data from test.json
        setExtractionData(testData as ExtractionDataResponse);
        
        // Use donor data from navigation state if available, otherwise create from test.json
        let donorData: DonorRecord;
        
        if (donorFromState) {
          // Use donor data passed from Documents page
          donorData = {
            id: Number(id),
            donorName: donorFromState.name || `Donor ${id}`,
            name: donorFromState.name || `Donor ${id}`,
            age: donorFromState.age || null,
            gender: donorFromState.gender || testData.extracted_data?.donor_information?.gender?.value || 'Unknown',
            causeOfDeath: null,
            uploadTimestamp: donorFromState.created_at || testData.processing_timestamp || new Date().toISOString(),
            requiredDocuments: [],
          };
          console.log('Using donor data from navigation state:', donorData);
        } else {
          // Create mock donor data from test.json
          donorData = {
            id: Number(id),
            donorName: testData.extracted_data?.donor_information?.gender?.value 
              ? `Donor ${testData.donor_id}` 
              : 'Test Donor',
            name: testData.extracted_data?.donor_information?.gender?.value 
              ? `Donor ${testData.donor_id}` 
              : 'Test Donor',
            age: null,
            gender: testData.extracted_data?.donor_information?.gender?.value || 'Unknown',
            causeOfDeath: null,
            uploadTimestamp: testData.processing_timestamp || new Date().toISOString(),
            requiredDocuments: [],
          };
          console.log('Using donor data from test.json:', donorData);
        }
        
        setDonor(donorData);
        setLoadingExtraction(false);
        
        // Optionally try to fetch from backend if you want to fallback
        // But for now, we'll just use the test.json data
        console.log('Using test.json data - no backend fetch needed');
        
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
        
        // Fetch donor details with critical findings and missing documents
        try {
          const donorDetails = await apiService.getQueueDetails();
          const currentDonorDetails = donorDetails.find((d: any) => d.id === Number(id));
          if (currentDonorDetails) {
            setCriticalFindings(currentDonorDetails.criticalFindings || []);
            setMissingDocuments(currentDonorDetails.requiredDocuments?.filter((doc: any) => doc.status === 'missing') || []);
          }
        } catch (err) {
          console.error('Error fetching donor details:', err);
          // Use dummy data if API fails
          setCriticalFindings([]);
          setMissingDocuments([]);
        }
        
      } catch (err) {
        console.error('Error loading test data:', err);
        // Fallback to mock data if test.json fails to load
        const fallbackDonor: DonorRecord = {
          id: Number(id),
          donorName: donorFromState?.name || 'Test Donor',
          name: donorFromState?.name || 'Test Donor',
          age: donorFromState?.age || 45,
          gender: donorFromState?.gender || 'Female',
          causeOfDeath: null,
          uploadTimestamp: donorFromState?.created_at || new Date().toISOString(),
          requiredDocuments: [],
        };
        setDonor(fallbackDonor);
        setLoadingExtraction(false);
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
        drai: extractionData.extracted_data.drai?.status || 'PENDING',
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
                        {donor.age} years • {donor.gender}
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
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-md font-semibold mb-3 flex items-center text-red-700">
                    <Clock className="h-4 w-4 mr-2" />
                    Recovery Information
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-500">Recovery Window</div>
                        <div className="text-sm font-medium">24 hours</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded border border-green-200">
                        <div className="text-xs text-green-800">Location</div>
                        <div className="text-sm font-medium text-green-900">Memorial Hospital</div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-2 rounded border border-green-200">
                      <div className="text-xs text-green-800">Consent Status</div>
                      <div className="text-sm font-medium text-green-900">Authorized by Next of Kin (Spouse)</div>
                    </div>
                  </div>
                </div>

                {/* Terminal Information */}
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-md font-semibold mb-3 flex items-center text-purple-700">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Terminal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-purple-50 p-2 rounded border border-purple-200">
                      <div className="text-xs text-purple-800">Cause of Death</div>
                      <div className="text-sm font-medium text-purple-900">{donor.causeOfDeath || 'Anoxic Brain Injury'}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 p-2 rounded border border-green-200">
                        <div className="text-xs text-green-800">Hypotension</div>
                        <div className="text-sm font-medium text-green-900">None</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded border border-green-200">
                        <div className="text-xs text-green-800">Sepsis</div>
                        <div className="text-sm font-medium text-green-900">None</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Required Documentation */}
            {donor && (() => {
              // Initial Paperwork items - same as DocumentChecklist
              const initialPaperwork = [
                {
                  name: 'Donor Log-In Information Packet (Templates 195 & 196)',
                  keywords: ['donor log-in', 'template 195', 'template 196', 'login packet', 'information packet'],
                  shouldBeChecked: true,
                  displayName: 'Donor Log-In Information Packet'
                },
                {
                  name: 'Donor Information',
                  keywords: ['donor information', 'donor data', 'donor details'],
                  shouldBeChecked: true,
                  displayName: 'Donor Information'
                },
                {
                  name: 'Donor Risk Assessment Interview (DRAI)',
                  keywords: ['drai', 'risk assessment', 'donor risk assessment interview'],
                  shouldBeChecked: true,
                  displayName: 'Donor Risk Assessment Interview (DRAI)'
                },
                {
                  name: 'Physical Assessment',
                  keywords: ['physical assessment', 'physical exam', 'physical evaluation'],
                  shouldBeChecked: false,
                  displayName: 'Physical Assessment'
                },
                {
                  name: 'Medical Records Review Summary',
                  keywords: ['medical records review', 'records review summary', 'medical review'],
                  shouldBeChecked: true,
                  displayName: 'Medical Records Review Summary'
                },
                {
                  name: 'Tissue Recovery Information',
                  keywords: ['tissue recovery', 'recovery information', 'tissue recovery info'],
                  shouldBeChecked: true,
                  displayName: 'Tissue Recovery Information'
                },
                {
                  name: 'Plasma Dilution',
                  keywords: ['plasma dilution', 'plasma', 'dilution'],
                  shouldBeChecked: true,
                  displayName: 'Plasma Dilution'
                },
                {
                  name: 'Authorization for Tissue Donation',
                  keywords: ['authorization', 'tissue donation', 'authorization form', 'consent'],
                  shouldBeChecked: true,
                  displayName: 'Authorization for Tissue Donation'
                },
                {
                  name: 'Infectious Disease Testing',
                  keywords: ['infectious disease', 'disease testing', 'serology', 'infectious'],
                  shouldBeChecked: true,
                  displayName: 'Infectious Disease Testing'
                },
                {
                  name: 'Medical Records',
                  keywords: ['medical records', 'medical history', 'clinical records', 'patient records'],
                  shouldBeChecked: false,
                  displayName: 'Medical Records'
                }
              ];

              // Conditional documents - same as DocumentChecklist
              const conditionalDocuments = [
                {
                  name: 'Autopsy report',
                  condition: 'Autopsy Performed',
                  extractionKey: 'autopsy_report',
                  displayName: 'Autopsy report'
                },
                {
                  name: 'Toxicology report',
                  condition: 'Toxicology Performed',
                  extractionKey: 'toxicology_report',
                  displayName: 'Toxicology report'
                },
                {
                  name: 'Skin Dermal Cultures',
                  condition: 'Skin Recovery Performed',
                  extractionKey: 'skin_dermal_cultures',
                  displayName: 'Skin Dermal Cultures'
                },
                {
                  name: 'Bioburden results',
                  condition: 'Fresh Tissue Processed Performed',
                  extractionKey: 'bioburden_results',
                  displayName: 'Bioburden results'
                }
              ];

              // Helper function to check if a document type exists (same as DocumentChecklist)
              const hasDocument = (keywords: string[]): boolean => {
                return documents.some(doc => 
                  keywords.some(keyword => 
                    doc.document_type?.toLowerCase().includes(keyword.toLowerCase())
                  )
                );
              };

              // Check conditional document status (same as DocumentChecklist)
              const getConditionalStatus = (extractionKey: string) => {
                if (!extractionData?.conditional_documents) return null;
                
                const conditionalDocs = extractionData.conditional_documents as any;
                let doc: any = null;
                
                if (extractionKey === 'autopsy_report') {
                  doc = conditionalDocs.autopsy_report;
                } else if (extractionKey === 'toxicology_report') {
                  doc = conditionalDocs.toxicology_report;
                } else if (extractionKey === 'skin_dermal_cultures') {
                  // Handle both possible field names
                  doc = conditionalDocs.skin_dermal_cultures || conditionalDocs.skinDermalCultures;
                } else if (extractionKey === 'bioburden_results') {
                  doc = conditionalDocs.bioburden_results;
                }
                
                if (!doc) return null;
                
                // Check for conditional_status field
                const status = doc.conditional_status;
                if (status && typeof status === 'string') {
                  return status.includes('CONDITION MET') ? 'met' : 'not_met';
                }
                
                return null;
              };

              // Get reviewer and date for a document (dummy data for now)
              const getReviewerInfo = (docName: string) => {
                const reviewers: Record<string, { reviewer: string; date: string }> = {
                  'Donor Log-In Information Packet': { reviewer: 'Dr. Campbell', date: '14/03/2024' },
                  'Donor Information': { reviewer: 'Dr. Garcia', date: '14/03/2024' },
                  'Donor Risk Assessment Interview (DRAI)': { reviewer: 'Dr. Rodriguez', date: '14/03/2024' },
                  'Physical Assessment': { reviewer: 'Dr. Singh', date: '14/03/2024' },
                  'Medical Records Review Summary': { reviewer: 'Dr. Patel', date: '14/03/2024' },
                  'Tissue Recovery Information': { reviewer: 'Dr. Wilson', date: '14/03/2024' },
                  'Plasma Dilution': { reviewer: 'Dr. Taylor', date: '14/03/2024' },
                  'Authorization for Tissue Donation': { reviewer: 'Dr. Brown', date: '14/03/2024' },
                  'Infectious Disease Testing': { reviewer: 'Dr. Martinez', date: '14/03/2024' },
                  'Medical Records': { reviewer: 'Dr. Lee', date: '14/03/2024' },
                  'Autopsy report': { reviewer: 'Dr. Anderson', date: '14/03/2024' },
                  'Toxicology report': { reviewer: 'Dr. Thompson', date: '14/03/2024' },
                  'Skin Dermal Cultures': { reviewer: 'Dr. White', date: '14/03/2024' },
                  'Bioburden results': { reviewer: 'Dr. Harris', date: '14/03/2024' }
                };
                return reviewers[docName] || { reviewer: 'Dr. Unknown', date: new Date().toLocaleDateString('en-GB') };
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
                      // Check if document exists OR if it should be marked as checked by default
                      const isPresent = hasDocument(item.keywords) || (item.shouldBeChecked ?? false);
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
                            {isPresent && (
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
                      const conditionalStatus = getConditionalStatus(item.extractionKey);
                      const isPresent = conditionalStatus === 'met';
                      const reviewerInfo = getReviewerInfo(item.displayName);
                      
                      return (
                        <div
                          key={`conditional-${index}`}
                          className={`flex items-center justify-between p-2 rounded ${
                            isPresent ? 'bg-gray-50' : 'bg-gray-50 opacity-60'
                          }`}
                        >
                          <span className="text-sm text-gray-900">{item.displayName} | {item.condition}</span>
                          <div className="flex items-center gap-3">
                            {isPresent && (
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
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-md font-semibold mb-3 flex items-center">
                <Stethoscope className="h-4 w-4 mr-2 text-gray-700" />
                Key Medical Findings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Tissue Quality</h4>
                  <p className="text-xs text-gray-700">
                    Excellent overall tissue quality with no signs of degeneration or disease.
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Bone Density</h4>
                  <p className="text-xs text-gray-700">
                    DEXA scan from 3 months ago shows excellent bone density. T-score: +0.2
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Cardiovascular Health</h4>
                  <p className="text-xs text-gray-700">
                    No history of cardiovascular disease. Recent echocardiogram normal.
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Medical History</h4>
                  <p className="text-xs text-gray-700">
                    Well-controlled asthma with infrequent inhaler use. No impact on tissue quality.
                  </p>
                </div>
              </div>
            </div>

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
                  {/* Serology Results - Enhanced with extraction data */}
                  {extractionData?.extracted_data?.infectious_disease_testing ? (
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 mb-2">Serology Results</h4>
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
                              value.result && 
                              (key.includes('sample') || key.includes('report') || key.includes('laboratory'))
                            )
                            .slice(0, 6)
                            .map(([key, value]) => (
                              <div key={key} className="bg-gray-50 p-2 rounded">
                                <div className="text-xs text-gray-500">{value.test_name}</div>
                                <div className="text-sm font-medium text-gray-900">
                                  {value.result}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
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
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 mb-2">Serology Results</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { test: 'HIV', result: 'Negative', status: 'success' },
                          { test: 'HBV', result: 'Negative', status: 'success' },
                          { test: 'HCV', result: 'Negative', status: 'success' },
                          { test: 'CMV', result: 'Positive', status: 'warning' }
                        ].map((item) => (
                          <div key={item.test} className="bg-gray-50 p-2 rounded">
                            <div className="text-xs text-gray-500">{item.test}</div>
                            <div className={`text-sm font-medium ${
                              item.status === 'success' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {item.result}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Culture Results */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Culture Results</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-500">Blood Culture</div>
                        <div className="text-sm font-medium text-green-600">No Growth</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-500">Urine Culture</div>
                        <div className="text-sm font-medium text-green-600">No Growth</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical History Assessment */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-md font-semibold mb-3 flex items-center text-blue-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Medical History
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Chronic Conditions</h4>
                    <ul className="space-y-1.5">
                      <li className="flex items-start text-sm">
                        <span className="text-gray-500 mr-2">•</span>
                        <span>Hypertension (Controlled with medication)</span>
                      </li>
                      <li className="flex items-start text-sm">
                        <span className="text-gray-500 mr-2">•</span>
                        <span>Type 2 Diabetes (HbA1c: 7.2%)</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Past Surgeries</h4>
                    <ul className="space-y-1.5">
                      <li className="flex items-start text-sm">
                        <span className="text-gray-500 mr-2">•</span>
                        <span>Appendectomy (2015)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Risk Assessment */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-md font-semibold mb-3 flex items-center text-yellow-700">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Risk Assessment
                </h3>
                <div className="space-y-3">
                  <div className="bg-yellow-50 p-3 rounded">
                    <h4 className="text-xs font-medium text-yellow-800 mb-2">High Risk Behaviors</h4>
                    <ul className="space-y-1 text-sm text-yellow-700">
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-1.5 text-green-500 mt-0.5" />
                        <span>No recent travel to endemic areas</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-1.5 text-green-500 mt-0.5" />
                        <span>No high-risk sexual behavior</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-1.5 text-green-500 mt-0.5" />
                        <span>No IV drug use</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <h4 className="text-xs font-medium text-blue-800 mb-2">Environmental Exposures</h4>
                    <ul className="space-y-1 text-sm text-blue-700">
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-1.5 text-green-500 mt-0.5" />
                        <span>No significant chemical exposure</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-1.5 text-green-500 mt-0.5" />
                        <span>No radiation exposure</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Terminal Events & Medications */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-md font-semibold mb-3 flex items-center text-purple-700">
                  <Clock className="h-4 w-4 mr-2" />
                  Terminal Events & Medications
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Cause of Death Details</h4>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-sm font-medium">{donor.causeOfDeath}</p>
                      <p className="text-xs text-gray-500 mt-1">Time of Death: March 15, 2024 08:30 AM EST</p>
                      <p className="text-xs text-gray-500">Location: Memorial Hospital ICU</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Terminal Course</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-500">Hypotension</div>
                        <div className="text-sm font-medium text-green-600">None</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-500">Sepsis</div>
                        <div className="text-sm font-medium text-green-600">None</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Terminal Medications</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-500">Vasopressors</div>
                        <div className="text-sm font-medium">None</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-500">Antibiotics</div>
                        <div className="text-sm font-medium">Ceftriaxone</div>
                        <div className="text-xs text-gray-500">Last: March 14</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );


      case 'physical-assessment':
        if (!extractionData?.extracted_data?.physical_assessment) {
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">Physical assessment data not available.</p>
            </div>
          );
        }
        return <PhysicalAssessmentSection data={extractionData.extracted_data.physical_assessment} onCitationClick={handleCitationClick} />;

      case 'authorization':
        if (!extractionData?.extracted_data?.authorization) {
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">Authorization data not available.</p>
            </div>
          );
        }
        return <AuthorizationSection data={extractionData.extracted_data.authorization} onCitationClick={handleCitationClick} />;

      case 'drai':
        if (!extractionData?.extracted_data?.drai) {
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">DRAI data not available.</p>
            </div>
          );
        }
        return <DRAISection data={extractionData.extracted_data.drai} onCitationClick={handleCitationClick} />;

      case 'infectious-disease':
        if (!extractionData?.extracted_data?.infectious_disease_testing) {
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">Infectious disease testing data not available.</p>
            </div>
          );
        }
        return (
          <InfectiousDiseaseSection
            data={extractionData.extracted_data.infectious_disease_testing}
            onCitationClick={handleCitationClick}
          />
        );

      case 'tissue-recovery':
        if (!extractionData?.extracted_data?.tissue_recovery) {
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">Tissue recovery data not available.</p>
            </div>
          );
        }
        return <TissueRecoverySection data={extractionData.extracted_data.tissue_recovery} onCitationClick={handleCitationClick} />;


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
        if (!extractionData?.extracted_data?.plasma_dilution) {
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">Plasma dilution data not available.</p>
            </div>
          );
        }
        return <PlasmaDilutionSection data={extractionData.extracted_data.plasma_dilution} onCitationClick={handleCitationClick} />;

      default:
        return null;
    }
  };

  // Handle citation click
  const handleCitationClick = (sourceDocument: string, pageNumber?: number) => {
    // Always use the local chart review PDF document
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
                {selectedPdfUrl ? (
                  <iframe
                    key={`${selectedPdfUrl}-${selectedPageNumber || 1}`}
                    src={`${selectedPdfUrl}${selectedPageNumber ? `#page=${selectedPageNumber}` : ''}`}
                    className="w-full h-full border-0"
                    title="PDF Viewer"
                    style={{ minHeight: '500px' }}
                    allow="fullscreen"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No document selected</p>
                    </div>
                  </div>
                )}
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