import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FindingSummary, DonorRecord, MDSummarySection, ExtractionDataResponse } from '../types';
// import { getMockMDSections } from '../services/mockData';
// ClinicalInformation and FindingsSection components moved inline
import { Clock, Heart, AlertCircle, FileText, Stethoscope, Brain, CheckCircle, Layout, FileCheck, User, AlertTriangle, ChevronRight, UserCheck, FlaskConical, Package, Shield, FileSearch, Droplets } from 'lucide-react';
import FindingDetailsModal from '../components/modals/FindingDetailsModal';
import { mockTissueAnalysis } from '../mocks/tissue-analysis-data';
import SummaryChat from '../components/chat/SummaryChat';
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
  const [selectedMDCitation, setSelectedMDCitation] = useState<number | null>(null);
  const [extractionData, setExtractionData] = useState<ExtractionDataResponse | null>(null);
  const [loadingExtraction, setLoadingExtraction] = useState(false);

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
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-500">Location</div>
                        <div className="text-sm font-medium">Memorial Hospital</div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
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
                    <div className="bg-purple-50 p-2 rounded">
                      <div className="text-xs text-purple-800">Cause of Death</div>
                      <div className="text-sm font-medium">{donor.causeOfDeath}</div>
                    </div>
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
                </div>
              </div>
            )}

            {/* Document Status */}
            {donor && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-md font-semibold mb-3 flex items-center">
                  <FileCheck className="h-4 h-4 mr-2 text-gray-700" />
                  Required Documentation
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {donor.requiredDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{doc.label}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doc.status === 'uploaded' ? 'bg-green-100 text-green-800' :
                        doc.status === 'missing' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compliance Status Summary */}
            {extractionData && (extractionData.compliance_status || extractionData.validation) && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-md font-semibold mb-3 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-gray-700" />
                  Compliance & Validation Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {extractionData.compliance_status && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">AATB Compliant</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          extractionData.compliance_status.aatb_compliant
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {extractionData.compliance_status.aatb_compliant ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Ready for Distribution</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          extractionData.compliance_status.ready_for_distribution
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {extractionData.compliance_status.ready_for_distribution ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  )}
                  {extractionData.validation && (
                    <div className="space-y-2">
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Validation Progress</span>
                          <span className="text-sm font-semibold text-blue-600">
                            {extractionData.validation.checklist_status.completion_percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${extractionData.validation.checklist_status.completion_percentage}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {extractionData.validation.checklist_status.total_items_complete} /{' '}
                          {extractionData.validation.checklist_status.total_required_items} items complete
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Intelligence Insights */}
            {donor && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-md font-semibold mb-3 flex items-center text-indigo-700">
                  <Brain className="h-4 w-4 mr-2" />
                  AI Intelligence Insights
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Tissue Analysis Overview */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-medium text-gray-500">Tissue Analysis</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-green-50 p-2 rounded">
                        <div className="text-xs text-green-800">Eligible</div>
                        <div className="text-lg font-semibold text-green-600">
                          {mockTissueAnalysis.filter(t => t.status === 'Eligible').length}
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded">
                        <div className="text-xs text-yellow-800">Review Required</div>
                        <div className="text-lg font-semibold text-yellow-600">
                          {mockTissueAnalysis.filter(t => t.status === 'Review Required').length}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Confidence */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-medium text-gray-500">AI Confidence</h4>
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-blue-800">Overall Confidence</span>
                        <span className="text-sm font-semibold text-blue-600">94%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '94%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Key Recommendations */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-medium text-gray-500">Key Recommendations</h4>
                    <div className="bg-indigo-50 p-2 rounded">
                      <ul className="space-y-1 text-sm text-indigo-900">
                        <li className="flex items-center">
                          <CheckCircle className="w-3 h-3 text-indigo-600 mr-1" />
                          MS Tissue: High probability match
                        </li>
                        <li className="flex items-center">
                          <AlertTriangle className="w-3 h-3 text-yellow-600 mr-1" />
                          Additional serology recommended
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Historical Comparison */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-medium text-gray-500">Historical Comparison</h4>
                    <div className="bg-purple-50 p-2 rounded">
                      <div className="text-xs text-purple-800">Similar Cases Success Rate</div>
                      <div className="text-lg font-semibold text-purple-600">87%</div>
                      <div className="text-xs text-purple-700">Based on 145 similar cases</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                            setActiveTab('infectious-disease');
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
        return <PhysicalAssessmentSection data={extractionData.extracted_data.physical_assessment} />;

      case 'authorization':
        if (!extractionData?.extracted_data?.authorization) {
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">Authorization data not available.</p>
            </div>
          );
        }
        return <AuthorizationSection data={extractionData.extracted_data.authorization} />;

      case 'drai':
        if (!extractionData?.extracted_data?.drai) {
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">DRAI data not available.</p>
            </div>
          );
        }
        return <DRAISection data={extractionData.extracted_data.drai} />;

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
        return <TissueRecoverySection data={extractionData.extracted_data.tissue_recovery} />;


      case 'conditional-docs':
        if (!extractionData?.conditional_documents) {
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">Conditional documents data not available.</p>
            </div>
          );
        }
        return <ConditionalDocumentsSection data={extractionData.conditional_documents} />;

      case 'plasma-dilution':
        if (!extractionData?.extracted_data?.plasma_dilution) {
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">Plasma dilution data not available.</p>
            </div>
          );
        }
        return <PlasmaDilutionSection data={extractionData.extracted_data.plasma_dilution} />;

      default:
        return null;
    }
  };

  if (!donor) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8 overflow-x-auto">
        <nav className="-mb-px flex space-x-8 min-w-max" aria-label="Tabs">
          {SUMMARY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

      {/* Tab Content */}
      {renderTabContent()}

      {/* Add the chat component */}
      <SummaryChat 
        donorId={id || ''} 
        donorName={donor?.donorName} 
      />

      {/* Finding Details Modal */}
      {selectedFinding && (
        <FindingDetailsModal
          finding={selectedFinding}
          isOpen={!!selectedFinding}
          onClose={() => setSelectedFinding(null)}
        />
      )}
    </div>
  );
} 