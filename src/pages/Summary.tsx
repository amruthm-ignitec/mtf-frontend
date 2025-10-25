import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FindingSummary, DonorRecord, MDSummarySection, FindingType, FindingSeverity, FindingCitation } from '../types';
// import { getMockMDSections } from '../services/mockData';
import { ClinicalInformation, FindingsSection } from '../components/dashboard/ClinicalSections';
import { Clock, Heart, AlertCircle, FileText, Stethoscope, Brain, CheckCircle, Layout, FileCheck, User, AlertTriangle, ChevronRight } from 'lucide-react';
import FindingDetailsModal from '../components/modals/FindingDetailsModal';
import { mockFindings } from '../mocks/findings-data';
import { mockTissueAnalysis } from '../mocks/tissue-analysis-data';
import SummaryChat from '../components/chat/SummaryChat';

const SUMMARY_TABS = [
  { id: 'overview', label: 'Overview', icon: Layout },
  { id: 'clinical', label: 'Clinical Information', icon: Heart },
  { id: 'findings', label: 'Co-ordinator Summary', icon: FileText },
  { id: 'md-summary', label: 'Director Summary', icon: Stethoscope },
  { id: 'documents', label: 'Documents & Compliance', icon: FileCheck }
] as const;

type TabId = typeof SUMMARY_TABS[number]['id'];

const FindingsSection1 = () => {
  const [selectedCitation, setSelectedCitation] = useState<FindingCitation | null>(null);
  const [selectedType, setSelectedType] = useState<FindingType | 'all'>('all');

  const getSeverityColor = (severity: FindingSeverity) => {
    const colors = {
      critical: 'hover:bg-red-50 hover:border-red-200 hover:text-red-700',
      moderate: 'hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-700',
      low: 'hover:bg-green-50 hover:border-green-200 hover:text-green-700',
      good: 'hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700'
    };
    return colors[severity];
  };

  const getTypeIcon = (type: FindingType) => {
    const icons = {
      contraindication: <AlertCircle className="w-5 h-5 text-red-500" />,
      quality: <CheckCircle className="w-5 h-5 text-blue-500" />,
      risk: <AlertTriangle className="w-5 h-5 text-yellow-500" />
    };
    return icons[type];
  };

  return (
    <div className="flex">
      {/* Main Findings Area */}
      <div className="flex-1 pr-4">
        {/* Filter Tabs */}
        <div className="mb-6 flex space-x-2">
          {['all', 'contraindication', 'quality', 'risk'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type as FindingType | 'all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedType === type
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Findings Grid */}
        <div className="space-y-4">
          {mockFindings
            .filter((finding: FindingSummary) => selectedType === 'all' || finding.type === selectedType)
            .map((finding: FindingSummary) => (
              <div
                key={finding.id}
                className={`p-4 rounded-lg border border-gray-200 bg-white transition-colors ${getSeverityColor(finding.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getTypeIcon(finding.type)}
                    <div>
                      <h3 className="font-medium">{finding.category}</h3>
                      <p className="text-sm mt-1">{finding.description}</p>
                      
                      {/* Citations */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {finding.citations.map((citation: FindingCitation) => (
                          <button
                            key={citation.id}
                            onClick={() => setSelectedCitation(citation)}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-white bg-opacity-50 hover:bg-opacity-75"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            {citation.context} (p.{citation.pageNumber})
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Confidence */}
                  <div className="text-right">
                    <div className="text-xs font-medium mb-1">AI Confidence</div>
                    <div className="text-sm font-semibold">
                      {(finding.aiConfidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Citation Sidebar */}
      <div className={`w-96 border-l bg-gray-50 p-4 transition-all ${
        selectedCitation ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {selectedCitation && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Source Document</h3>
              <button
                onClick={() => setSelectedCitation(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="mb-2 text-sm text-gray-500">{selectedCitation.context}</div>
              <div className="text-sm">Page {selectedCitation.pageNumber}</div>
              {/* Mock PDF preview would go here */}
              <div className="mt-4 bg-gray-100 h-96 rounded flex items-center justify-center text-gray-400">
                PDF Preview Placeholder
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Summary() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [_searchQuery, _setSearchQuery] = useState('');
  const [_selectedFilter, _setSelectedFilter] = useState('all');
  const [donor, setDonor] = useState<DonorRecord | null>(null);
  const [mdSections, setMDSections] = useState<MDSummarySection[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<FindingSummary | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedMDCitation, setSelectedMDCitation] = useState<number | null>(null);

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
    const fetchDonorData = async () => {
      try {
        // setLoading(true);
        const apiUrl = import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${apiUrl}/donor/${id}/details`);
        
        if (!response.ok) {
          if (response.status === 404) {
            navigate('/not-found');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const donorData = await response.json();
        setDonor(donorData);
        
        // Fetch MD sections if needed
        // setMDSections(getMockMDSections());
        const mdResponse = await fetch(`${apiUrl}/donor/${id}/md-sections`);
        if (mdResponse.ok) {
          const mdData = await mdResponse.json();
          setMDSections(mdData);
        }
      } catch (err) {
        // setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching donor data:', err);
      } finally {
        // setLoading(false);
      }
    };

    if (id) {
      fetchDonorData();
    }
  }, [id, navigate]);

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
        return <ClinicalInformation donor={donor} />;

      // case 'clinical':
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
                  {/* Serology Results */}
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

      case 'findings':
        return <FindingsSection />;

      case 'md-summary':
        return (
          <div className="flex">
            {/* Main Content */}
            <div className="flex-1 pr-4 space-y-6">
              {/* MD Summary Header - Simplified */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-md font-semibold text-gray-900">Medical Director Summary</h2>
                    <p className="text-xs text-gray-500 mt-1">Last updated: March 15, 2024 10:30 AM EST</p>
                  </div>
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                    MD Reviewed
                  </span>
                </div>

                {/* Quick Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500">Total Findings</div>
                    <div className="text-lg font-semibold mt-1">12</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500">Critical Findings</div>
                    <div className="text-lg font-semibold text-red-600 mt-1">2</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500">Pages Reviewed</div>
                    <div className="text-lg font-semibold mt-1">45</div>
                  </div>
                </div>
              </div>

              {/* Detailed Sections */}
              <div className="bg-white rounded-lg shadow">
                {mdSections.map((section, index) => (
                  <div
                    key={index}
                    className={`p-4 ${
                      index !== mdSections.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <h3 className="text-sm font-medium text-gray-900">{section.title}</h3>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          section.status === 'Abnormal'
                            ? 'bg-yellow-50 text-yellow-700'
                            : section.status === 'No'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        {section.status}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p>{section.details}</p>
                    </div>

                    {/* Citations and References */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {section.pageReferences?.map((page) => (
                        <button
                          key={page}
                          onClick={() => setSelectedMDCitation(Number(page))}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-50 hover:bg-gray-100 text-gray-600"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Page {page}
                        </button>
                      ))}
                    </div>

                    {/* Additional Metadata */}
                    <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Reviewed 2 hours ago
                      </span>
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        Dr. Smith
                      </span>
                      {section.aiConfidence && (
                        <span className="flex items-center">
                          <Brain className="w-3 h-3 mr-1" />
                          AI Confidence: {section.aiConfidence}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Citation Sidebar - Keeping consistent with Findings section */}
            <div className={`w-96 border-l bg-gray-50 p-4 transition-all ${
              selectedMDCitation ? 'translate-x-0' : 'translate-x-full'
            }`}>
              {selectedMDCitation && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium">Source Document</h3>
                    <button
                      onClick={() => setSelectedMDCitation(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="mb-2 text-xs text-gray-500">Medical Record</div>
                    <div className="text-sm">Page {selectedMDCitation}</div>
                    {/* Mock PDF preview would go here */}
                    <div className="mt-4 bg-gray-50 h-96 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                      PDF Preview Placeholder
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Documents & Compliance</h2>
            <div className="space-y-4">
              {donor?.requiredDocuments?.map((doc, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{doc.label}</h3>
                      <p className="text-sm text-gray-500">Required Document</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doc.status === 'uploaded'
                          ? 'bg-green-100 text-green-800'
                          : doc.status === 'missing'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!donor) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {SUMMARY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
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