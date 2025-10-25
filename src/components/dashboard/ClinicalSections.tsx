import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle, FileText, AlertTriangle } from 'lucide-react';

// Clinical Information Tab Component
const ClinicalInformation = ({ donor }) => {
    
    const [serologyData, setSerologyData] = useState([]);
    const [summaryData, setSummaryData] = useState(null);
    
    useEffect(() => {
      const fetchClinicalData = async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_BASE_URL;
          const response = await fetch(`${apiUrl}/donor/${donor.id}/summary`);
          if (response.ok) {
            const data = await response.json();
            setSerologyData(data.serology);
            setSummaryData(data.topic_summary);
          }
        } catch (error) {
          console.error('Error fetching clinical data:', error);
        }
      };
  
      if (donor?.id) {
        fetchClinicalData();
      }
    }, [donor?.id]);
  
    if (!summaryData) return null;
  
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
                  {serologyData.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">{item.serologies}</div>
                      <div className={`text-sm font-medium ${
                        item.result === 'Non Reactive' ? 'text-green-600' : 'text-yellow-600'
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
                  {summaryData['Blood Culture'] && (
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">Blood Culture</div>
                      <div className="text-sm font-medium text-green-600">
                        {summaryData['Blood Culture'].decision || 'No Growth'}
                      </div>
                    </div>
                  )}
                  {summaryData['Urine Culture'] && (
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">Urine Culture</div>
                      <div className="text-sm font-medium text-green-600">
                        {summaryData['Urine Culture'].decision || 'No Growth'}
                      </div>
                    </div>
                  )}
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
              {summaryData['Medical History'] && (
                <>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Medical History Details</h4>
                    <p className="text-sm text-gray-700">
                      {summaryData['Medical History'].details || 
                       summaryData['Medical History']['Medical History']}
                    </p>
                  </div>
                  {summaryData['Medical History'].citation && (
                    <div className="text-xs text-gray-500">
                      Page References: {summaryData['Medical History'].citation.join(', ')}
                    </div>
                  )}
                </>
              )}
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
              {/* Risk Behaviors from DRAI */}
              {summaryData['Donor Risk Assessment Interview'] && (
                <div className="bg-yellow-50 p-3 rounded">
                  <h4 className="text-xs font-medium text-yellow-800 mb-2">Risk Assessment Findings</h4>
                  <p className="text-sm text-yellow-700">
                    {summaryData['Donor Risk Assessment Interview']['Donor Risk Assessment Interview']}
                  </p>
                </div>
              )}
            </div>
          </div>
  
          {/* Terminal Events & Medications */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-md font-semibold mb-3 flex items-center text-purple-700">
              <Clock className="h-4 w-4 mr-2" />
              Terminal Events & Medications
            </h3>
            <div className="space-y-4">
              {/* Cause of Death Details */}
              {summaryData['Cause of Death'] && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-2">Cause of Death Details</h4>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-sm font-medium">
                      {summaryData['Cause of Death']['Cause of Death'] || 
                       summaryData['Cause of Death']['Clinical Course'] || 
                       'Cause of death information not available'}
                    </p>
                  </div>
                </div>
              )}
  
              {/* Terminal Course */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2">Terminal Course</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Sepsis</div>
                    <div className={`text-sm font-medium ${
                      summaryData['Sepsis']?.decision === 'Positive' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {summaryData['Sepsis']?.decision || 'Not Reported'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Infection</div>
                    <div className={`text-sm font-medium ${
                      summaryData['Infection']?.decision === 'Positive' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {summaryData['Infection']?.decision || 'Not Reported'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Findings Tab Component
  const FindingsSection = () => {
    
    const { id } = useParams();
    const [findings, setFindings] = useState([]);
    const [selectedCitation, setSelectedCitation] = useState(null);
    const [selectedType, setSelectedType] = useState('all');
  
    useEffect(() => {
      const fetchFindings = async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_BASE_URL;
          const response = await fetch(`${apiUrl}/donor/${id}/details`);
          if (response.ok) {
            const data = await response.json();
            setFindings(data.findings || []);
          }
        } catch (error) {
          console.error('Error fetching findings:', error);
        }
      };
  
      if (id) {
        fetchFindings();
      }
    }, [id]);
  
    const getSeverityColor = (severity) => {
      const colors = {
        critical: 'hover:bg-red-50 hover:border-red-200 hover:text-red-700',
        moderate: 'hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-700',
        low: 'hover:bg-green-50 hover:border-green-200 hover:text-green-700',
        good: 'hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700'
      };
      return colors[severity];
    };
  
    const getTypeIcon = (type) => {
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
                onClick={() => setSelectedType(type)}
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
            {findings
              .filter((finding) => selectedType === 'all' || finding.type === selectedType)
              .map((finding) => (
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
                          {finding.citations.map((citation) => (
                            <button
                              key={citation.id}
                              // onClick={() => setSelectedCitation(citation)}
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
                  // onClick={() => setSelectedCitation(null)}
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
  
  export { ClinicalInformation, FindingsSection };