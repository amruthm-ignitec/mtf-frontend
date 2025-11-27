import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { DonorRecord, ProcessingStatus, RequiredDocument } from '../types';
// import { mockFindings } from '../mocks/findings-data';

// Mock data for the queue
// const mockQueueData: DonorRecord[] = [
//   {
//     id: '1',
//     donorName: 'John A. Smith',
//     age: 45,
//     gender: 'Male',
//     causeOfDeath: 'Cerebrovascular Accident',
//     uploadTimestamp: new Date('2024-03-15T10:30:00'),
//     processingStatus: 'rejected',
//     status: 'rejected',
//     criticalFindings: [{
//       type: 'HIV',
//       severity: 'CRITICAL',
//       automaticRejection: true,
//       detectedAt: new Date('2024-03-15T10:35:00'),
//       source: {
//         documentId: 'doc1',
//         pageNumber: 3,
//         confidence: 0.98
//       }
//     }],
//     screeningStatus: 'HALTED',
//     rejectionReason: 'Critical Finding: HIV Positive',
//     documents: [
//       { id: 'doc1', fileName: 'Medical_History.pdf', fileType: 'application/pdf', uploadTimestamp: new Date(), status: 'completed' },
//       { id: 'doc2', fileName: 'Lab_Results.pdf', fileType: 'application/pdf', uploadTimestamp: new Date(), status: 'completed' }
//     ],
//     findings: mockFindings,
//     requiredDocuments: [
//       { 
//         id: 'rd1-1', 
//         name: 'Medical History', 
//         type: 'medical_history', 
//         label: 'Medical History', 
//         status: 'completed', 
//         isRequired: true,
//         uploadDate: new Date('2024-03-15'), 
//         reviewedBy: 'Dr. Smith',
//         notes: 'Complete medical history received',
//         pageCount: 5
//       },
//       { 
//         id: 'rd1-2', 
//         name: 'Serology Report', 
//         type: 'serology', 
//         label: 'Serology Report', 
//         status: 'uploaded', 
//         isRequired: true,
//         uploadDate: new Date('2024-03-15'),
//         reviewedBy: 'Dr. Johnson',
//         notes: 'Serology report uploaded',
//         pageCount: 3
//       },
//       { 
//         id: 'rd1-3', 
//         name: 'Laboratory Results', 
//         type: 'lab_results', 
//         label: 'Laboratory Results', 
//         status: 'uploaded', 
//         isRequired: true,
//         uploadDate: new Date('2024-03-15'),
//         reviewedBy: 'Dr. Wilson',
//         notes: 'Lab results complete',
//         pageCount: 8
//       },
//       { 
//         id: 'rd1-4', 
//         name: 'Recovery Cultures', 
//         type: 'recovery_cultures', 
//         label: 'Recovery Cultures', 
//         status: 'uploaded', 
//         isRequired: true,
//         uploadDate: new Date('2024-03-15'),
//         reviewedBy: 'Dr. Brown',
//         notes: 'Culture results uploaded',
//         pageCount: 2
//       },
//       { 
//         id: 'rd1-5', 
//         name: 'Consent Form', 
//         type: 'consent_form', 
//         label: 'Consent Form', 
//         status: 'uploaded', 
//         isRequired: true,
//         uploadDate: new Date('2024-03-15'),
//         reviewedBy: 'Dr. Davis',
//         notes: 'Consent form verified',
//         pageCount: 1
//       },
//       { 
//         id: 'rd1-6', 
//         name: 'Death Certificate', 
//         type: 'death_certificate', 
//         label: 'Death Certificate', 
//         status: 'uploaded', 
//         isRequired: true,
//         uploadDate: new Date('2024-03-15'),
//         reviewedBy: 'Dr. Miller',
//         notes: 'Death certificate verified',
//         pageCount: 1
//       }
//     ]
//   },
//   {
//     id: '2',
//     donorName: 'Sarah Johnson',
//     age: 52,
//     gender: 'Female',
//     causeOfDeath: 'Cardiac Arrest',
//     uploadTimestamp: new Date('2024-03-15T11:45:00'),
//     processingStatus: 'processing',
//     status: 'processing',
//     documents: [
//       { id: 'doc3', fileName: 'Medical_Records.pdf', fileType: 'application/pdf', uploadTimestamp: new Date(), status: 'processing' }
//     ],
//     findings: mockFindings.slice(0, 5),
//     requiredDocuments: [
//       { 
//         id: 'rd2-1', 
//         name: 'Medical History', 
//         type: 'medical_history', 
//         label: 'Medical History', 
//         status: 'processing', 
//         isRequired: true,
//         uploadDate: new Date('2024-03-15'),
//         reviewedBy: 'Dr. Anderson',
//         notes: 'Document under review',
//         pageCount: 7
//       },
//       { 
//         id: 'rd2-2', 
//         name: 'Serology Report', 
//         type: 'serology', 
//         label: 'Serology Report', 
//         status: 'missing', 
//         isRequired: true,
//         uploadDate: new Date(0),
//         reviewedBy: 'Pending',
//         notes: 'Document not received',
//         pageCount: 0
//       },
//       { 
//         id: 'rd2-3', 
//         name: 'Laboratory Results', 
//         type: 'lab_results', 
//         label: 'Laboratory Results', 
//         status: 'uploaded', 
//         isRequired: true,
//         uploadDate: new Date('2024-03-15'),
//         reviewedBy: 'Dr. Thompson',
//         notes: 'Pending review',
//         pageCount: 4
//       },
//       { 
//         id: 'rd2-4', 
//         name: 'Recovery Cultures', 
//         type: 'recovery_cultures', 
//         label: 'Recovery Cultures', 
//         status: 'missing', 
//         isRequired: true,
//         uploadDate: new Date(0),
//         reviewedBy: 'Pending',
//         notes: 'Document not received',
//         pageCount: 0
//       },
//       { 
//         id: 'rd2-5', 
//         name: 'Consent Form', 
//         type: 'consent_form', 
//         label: 'Consent Form', 
//         status: 'uploaded', 
//         isRequired: true,
//         uploadDate: new Date('2024-03-15'),
//         reviewedBy: 'Dr. Roberts',
//         notes: 'Consent verified',
//         pageCount: 2
//       },
//       { 
//         id: 'rd2-6', 
//         name: 'Death Certificate', 
//         type: 'death_certificate', 
//         label: 'Death Certificate', 
//         status: 'uploaded', 
//         isRequired: true,
//         uploadDate: new Date('2024-03-15'),
//         reviewedBy: 'Dr. Martinez',
//         notes: 'Certificate verified',
//         pageCount: 1
//       }
//     ]
//   },
//   {
//     id: '3',
//     donorName: 'Michael Brown',
//     age: 38,
//     gender: 'Male',
//     causeOfDeath: 'Traumatic Brain Injury',
//     uploadTimestamp: new Date('2024-03-15T09:15:00'),
//     processingStatus: 'pending',
//     status: 'pending',
//     documents: [],
//     findings: mockFindings.slice(5, 8),
//     requiredDocuments: [
//       { 
//         id: 'rd3-1', 
//         name: 'Medical History', 
//         type: 'medical_history', 
//         label: 'Medical History', 
//         status: 'missing', 
//         isRequired: true,
//         uploadDate: new Date(0),
//         reviewedBy: 'Pending',
//         notes: 'Document not received',
//         pageCount: 0
//       },
//       { 
//         id: 'rd3-2', 
//         name: 'Serology Report', 
//         type: 'serology', 
//         label: 'Serology Report', 
//         status: 'missing', 
//         isRequired: true,
//         uploadDate: new Date(0),
//         reviewedBy: 'Pending',
//         notes: 'Document not received',
//         pageCount: 0
//       },
//       { 
//         id: 'rd3-3', 
//         name: 'Laboratory Results', 
//         type: 'lab_results', 
//         label: 'Laboratory Results', 
//         status: 'missing', 
//         isRequired: true,
//         uploadDate: new Date(0),
//         reviewedBy: 'Pending',
//         notes: 'Document not received',
//         pageCount: 0
//       },
//       { 
//         id: 'rd3-4', 
//         name: 'Recovery Cultures', 
//         type: 'recovery_cultures', 
//         label: 'Recovery Cultures', 
//         status: 'missing', 
//         isRequired: true,
//         uploadDate: new Date(0),
//         reviewedBy: 'Pending',
//         notes: 'Document not received',
//         pageCount: 0
//       },
//       { 
//         id: 'rd3-5', 
//         name: 'Consent Form', 
//         type: 'consent_form', 
//         label: 'Consent Form', 
//         status: 'missing', 
//         isRequired: true,
//         uploadDate: new Date(0),
//         reviewedBy: 'Pending',
//         notes: 'Document not received',
//         pageCount: 0
//       },
//       { 
//         id: 'rd3-6', 
//         name: 'Death Certificate', 
//         type: 'death_certificate', 
//         label: 'Death Certificate', 
//         status: 'missing', 
//         isRequired: true,
//         uploadDate: new Date(0),
//         reviewedBy: 'Pending',
//         notes: 'Document not received',
//         pageCount: 0
//       }
//     ]
//   },
//   {
//     id: '4',
//     donorName: 'Emily Davis',
//     age: 42,
//     gender: 'Female',
//     causeOfDeath: 'Respiratory Failure',
//     uploadTimestamp: new Date('2024-03-15T14:20:00'),
//     processingStatus: 'failed',
//     status: 'failed',
//     documents: [
//       { id: 'doc4', fileName: 'Medical_History.pdf', fileType: 'application/pdf', uploadTimestamp: new Date(), status: 'failed' }
//     ],
//     findings: mockFindings.slice(0, 3),
//     requiredDocuments: [
//       { 
//         id: 'rd4-1', 
//         name: 'Medical History', 
//         type: 'medical_history', 
//         label: 'Medical History', 
//         status: 'invalid', 
//         isRequired: true,
//         uploadDate: new Date('2024-03-15'),
//         reviewedBy: 'Dr. Parker',
//         notes: 'Document validation failed',
//         pageCount: 3
//       },
//       { 
//         id: 'rd4-2', 
//         name: 'Serology Report', 
//         type: 'serology', 
//         label: 'Serology Report', 
//         status: 'uploaded', 
//         isRequired: true,
//         uploadDate: new Date('2024-03-15'),
//         reviewedBy: 'Dr. Wilson',
//         notes: 'Serology report received',
//         pageCount: 2
//       },
//       { 
//         id: 'rd4-3', 
//         name: 'Laboratory Results', 
//         type: 'lab_results', 
//         label: 'Laboratory Results', 
//         status: 'uploaded', 
//         isRequired: true,
//         uploadDate: new Date('2024-03-15'),
//         reviewedBy: 'Dr. Thompson',
//         notes: 'Pending review',
//         pageCount: 4
//       },
//       { 
//         id: 'rd4-4', 
//         name: 'Recovery Cultures', 
//         type: 'recovery_cultures', 
//         label: 'Recovery Cultures', 
//         status: 'missing', 
//         isRequired: true,
//         uploadDate: new Date(0),
//         reviewedBy: 'Pending',
//         notes: 'Document not received',
//         pageCount: 0
//       },
//       { 
//         id: 'rd4-5', 
//         name: 'Consent Form', 
//         type: 'consent_form', 
//         label: 'Consent Form', 
//         status: 'uploaded', 
//         isRequired: true,
//         uploadDate: new Date('2024-03-15'),
//         reviewedBy: 'Dr. Roberts',
//         notes: 'Consent verified',
//         pageCount: 2
//       },
//       { 
//         id: 'rd4-6', 
//         name: 'Death Certificate', 
//         type: 'death_certificate', 
//         label: 'Death Certificate', 
//         status: 'uploaded', 
//         isRequired: true,
//         uploadDate: new Date('2024-03-15'),
//         reviewedBy: 'Dr. Martinez',
//         notes: 'Certificate verified',
//         pageCount: 1
//       }
//     ]
//   },
//   {
//     id: '5',
//     donorName: 'Robert Wilson',
//     age: 55,
//     gender: 'Male',
//     causeOfDeath: 'Myocardial Infarction',
//     uploadTimestamp: new Date('2024-03-15T16:00:00'),
//     processingStatus: 'processing',
//     status: 'processing',
//     documents: [
//       { id: 'doc5', fileName: 'Complete_Records.pdf', fileType: 'application/pdf', uploadTimestamp: new Date(), status: 'processing' }
//     ],
//     findings: mockFindings,
//     requiredDocuments: [
//       { 
//         id: 'rd5-1', 
//         name: 'Medical History', 
//         type: 'medical_history', 
//         label: 'Medical History', 
//         status: 'processing', 
//         isRequired: true,
//         uploadDate: new Date('2024-03-15'),
//         reviewedBy: 'Dr. Adams',
//         notes: 'Under review',
//         pageCount: 6
//       },
//       { 
//         id: 'rd5-2', 
//         name: 'Serology Report', 
//         type: 'serology', 
//         label: 'Serology Report', 
//         status: 'processing', 
//         isRequired: true,
//         uploadDate: new Date('2024-03-15'),
//         reviewedBy: 'Dr. Parker',
//         notes: 'Under review',
//         pageCount: 5
//       },
//       { 
//         id: 'rd5-3', 
//         name: 'Laboratory Results', 
//         type: 'lab_results', 
//         label: 'Laboratory Results', 
//         status: 'processing', 
//         isRequired: true,
//         uploadDate: new Date('2024-03-15'),
//         reviewedBy: 'Dr. Thompson',
//         notes: 'Pending review',
//         pageCount: 4
//       },
//       { 
//         id: 'rd5-4', 
//         name: 'Recovery Cultures', 
//         type: 'recovery_cultures', 
//         label: 'Recovery Cultures', 
//         status: 'processing', 
//         isRequired: true,
//         uploadDate: new Date('2024-03-15'),
//         reviewedBy: 'Dr. Brown',
//         notes: 'Under review',
//         pageCount: 3
//       },
//       { 
//         id: 'rd5-5', 
//         name: 'Consent Form', 
//         type: 'consent_form', 
//         label: 'Consent Form', 
//         status: 'uploaded', 
//         isRequired: true,
//         uploadDate: new Date('2024-03-15'),
//         reviewedBy: 'Dr. Roberts',
//         notes: 'Consent verified',
//         pageCount: 2
//       },
//       { 
//         id: 'rd5-6', 
//         name: 'Death Certificate', 
//         type: 'death_certificate', 
//         label: 'Death Certificate', 
//         status: 'uploaded', 
//         isRequired: true,
//         uploadDate: new Date('2024-03-15'),
//         reviewedBy: 'Dr. Martinez',
//         notes: 'Certificate verified',
//         pageCount: 1
//       }
//     ]
//   }
// ];

const getStatusIcon = (status: ProcessingStatus) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'processing':
      return <Clock className="w-5 h-5 text-yellow-500" />;
    case 'rejected':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'failed':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'pending':
      return <Clock className="w-5 h-5 text-gray-500" />;
    default:
      return <Clock className="w-5 h-5 text-gray-500" />;
  }
};

const getStatusBadge = (status: ProcessingStatus) => {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
  switch (status) {
    case 'completed':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'processing':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'rejected':
    case 'failed':
      return `${baseClasses} bg-red-100 text-red-800`;
    case 'pending':
      return `${baseClasses} bg-gray-100 text-gray-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

const getDocumentStatusBadge = (status: RequiredDocument['status']) => {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
  switch (status) {
    case 'completed':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'processing':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'missing':
      return `${baseClasses} bg-red-100 text-red-800`;
    case 'invalid':
      return `${baseClasses} bg-gray-100 text-gray-800`;
    default:
      return baseClasses;
  }
};

const formatDate = (date: Date | string) => {
  if (date instanceof Date) {
    return date.toLocaleDateString();
  }
  return new Date(date).toLocaleDateString();
};

export default function Queue() {
  const navigate = useNavigate();
  const [donors, setDonors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProcessingStatus | 'all'>('all');
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${apiUrl}/donors/queue/details`);
        if (!response.ok) {
          throw new Error('Failed to fetch donor data');
        }
        const data = await response.json();
        setDonors(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchDonors();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as ProcessingStatus | 'all');
  };

  const handleCriticalToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowCriticalOnly(e.target.checked);
  };

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = donor.donorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || donor.processingStatus === statusFilter;
    const matchesCritical = !showCriticalOnly || (donor.criticalFindings && donor.criticalFindings.length > 0);
    return matchesSearch && matchesStatus && matchesCritical;
  });

  // Helper function to check for critical findings
  const hasCriticalFindings = (donor: DonorRecord): boolean => {
    return Boolean(donor.criticalFindings && donor.criticalFindings.length > 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Document Queue</h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage and monitor document processing status
        </p>
      </div>

      {/* Filter Section */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search donors..."
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={searchQuery}
              onChange={handleSearch}
            />
            <select 
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={statusFilter}
              onChange={handleStatusChange}
            >
              <option value="all">All Status</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={showCriticalOnly}
                onChange={handleCriticalToggle}
              />
              <span className="ml-2 text-sm text-gray-700">Show Critical Findings Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Donor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Required Documents
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Upload Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDonors.map((donor) => (
              <tr 
                key={donor.id}
                className={`
                  hover:bg-gray-50 cursor-pointer
                  ${hasCriticalFindings(donor) ? 'border-l-4 border-red-500 bg-red-50' : ''}
                `}
                onClick={() => navigate(`/summary/${donor.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    {hasCriticalFindings(donor) && (
                      <div className="mb-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Critical Finding
                      </div>
                    )}
                    <div className="text-sm font-medium text-gray-900">
                      {donor.donorName}
                    </div>
                    <div className="text-sm text-gray-500 truncate-custom">
                      {donor.causeOfDeath}
                    </div>
                    {hasCriticalFindings(donor) && (
                      <div className="text-xs text-red-600 mt-1">
                        {donor.rejectionReason}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    {donor.requiredDocuments.some(doc => doc.status === 'missing') && (
                      <div className="flex items-center text-yellow-600 text-sm">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Missing required documents
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {donor.requiredDocuments
                        .filter(doc => doc.status === 'missing' || doc.status === 'processing')
                        .map((doc, index) => (
                          <span
                            key={index}
                            className={getDocumentStatusBadge(doc.status)}
                          >
                            {doc.label}: {doc.status}
                          </span>
                        ))}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(donor.uploadTimestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {hasCriticalFindings(donor) ? (
                      <span className={`${getStatusBadge('rejected')} flex items-center`}>
                        <XCircle className="w-4 h-4 mr-1" />
                        Rejected - Critical Finding
                      </span>
                    ) : (
                      <>
                        {getStatusIcon(donor.processingStatus)}
                        <span className={`ml-2 ${getStatusBadge(donor.processingStatus)}`}>
                          {donor.processingStatus.charAt(0).toUpperCase() + donor.processingStatus.slice(1)}
                        </span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/summary/${donor.id}`);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </div>
                </td>
                <div className="hidden group-hover:block absolute -mt-1 left-full ml-2 w-64 p-4 bg-white shadow-lg rounded-lg border z-10">
                  <h4 className="font-medium text-sm">{donor.donorName}</h4>
                  <p className="text-xs text-gray-500 mt-1">Age: {donor.age} | Gender: {donor.gender}</p>
                  {donor.criticalFindings?.map((finding, idx) => (
                    <div key={idx} className="mt-2 text-xs text-red-600">
                      {finding.type} detected (Confidence: {(finding.source.confidence * 100).toFixed(1)}%)
                    </div>
                  ))}
                </div>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 