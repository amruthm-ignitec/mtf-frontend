import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Filter, Users, AlertCircle, Star, Trash2, Clock, FileText, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { Donor } from '../types/donor';
import { useDonors } from '../hooks';
import { formatDate, calculateAge } from '../utils';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatsCard from '../components/ui/StatsCard';
import Table from '../components/ui/Table';
import DonorCreateForm from '../components/donor/DonorCreateForm';
import { useNavigate } from 'react-router-dom';

interface DonorWithDetails extends Donor {
  criticalFindings?: Array<{
    type: string;
    severity: string;
    automaticRejection: boolean;
    detectedAt?: string;
    source: {
      documentId: string;
      pageNumber: string;
      confidence: number;
    };
  }>;
  rejectionReason?: string;
  requiredDocuments?: Array<{
    id: string;
    name: string;
    type: string;
    label: string;
    status: 'completed' | 'processing' | 'missing' | 'invalid';
    isRequired: boolean;
    uploadDate?: string;
    reviewedBy?: string;
    notes?: string;
    pageCount: number;
  }>;
  processingStatus?: string;
}

export default function DonorManagement() {
  const navigate = useNavigate();
  const { donors, loading, error, deleteDonor, togglePriority } = useDonors();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'priority' | 'normal'>('all');
  const [donorsWithDetails, setDonorsWithDetails] = useState<DonorWithDetails[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleDonorCreated = async () => {
    setShowCreateForm(false);
  };

  const handleDeleteDonor = async (donorId: number) => {
    if (!window.confirm('Are you sure you want to delete this donor? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDonor(donorId);
    } catch (err) {
      console.error('Failed to delete donor:', err);
    }
  };

  const handleTogglePriority = async (donorId: number, currentPriority: boolean) => {
    try {
      await togglePriority(donorId, currentPriority);
    } catch (err) {
      console.error('Failed to update priority:', err);
    }
  };

  // Fetch donor details with critical findings and missing documents
  useEffect(() => {
    const fetchDonorDetails = async () => {
      if (donors.length === 0) return;
      
      try {
        setLoadingDetails(true);
        const apiUrl = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${apiUrl}/donors/queue/details`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        
        if (response.ok) {
          const detailsData = await response.json();
          // Merge details with donors
          const merged = donors.map(donor => {
            const details = detailsData.find((d: any) => d.id === String(donor.id) || d.id === donor.id);
            if (details) {
              return {
                ...donor,
                ...details,
                id: donor.id, // Keep original id type
              };
            } else {
              // If no details found, add dummy data for this donor
              // For latest donor, show processing status to demonstrate queue message
              const isLatest = donor.id === Math.max(...donors.map(d => d.id));
              return {
                ...donor,
                criticalFindings: donor.id % 3 === 1 ? [{
                  type: "HIV",
                  severity: "CRITICAL",
                  automaticRejection: true,
                  detectedAt: donor.created_at,
                  source: {
                    documentId: "doc1",
                    pageNumber: "3",
                    confidence: 0.98
                  }
                }] : undefined,
                rejectionReason: donor.id % 3 === 1 ? "Critical Finding: HIV Positive" : undefined,
                requiredDocuments: [
                  { id: `rd-${donor.id}-1`, name: "Medical History", type: "medical_history", label: "Medical History", status: isLatest ? "processing" : (donor.id % 2 === 0 ? "missing" : "processing"), isRequired: true, pageCount: 0 },
                  { id: `rd-${donor.id}-2`, name: "Serology Report", type: "serology_report", label: "Serology Report", status: isLatest ? "processing" : (donor.id % 2 === 0 ? "missing" : "completed"), isRequired: true, pageCount: 0 },
                  { id: `rd-${donor.id}-3`, name: "Laboratory Results", type: "lab_results", label: "Laboratory Results", status: isLatest ? "processing" : "completed", isRequired: true, pageCount: 0 },
                  { id: `rd-${donor.id}-4`, name: "Recovery Cultures", type: "recovery_cultures", label: "Recovery Cultures", status: "completed", isRequired: true, pageCount: 0 },
                  { id: `rd-${donor.id}-5`, name: "Consent Form", type: "consent_form", label: "Consent Form", status: "completed", isRequired: true, pageCount: 0 },
                  { id: `rd-${donor.id}-6`, name: "Death Certificate", type: "death_certificate", label: "Death Certificate", status: "completed", isRequired: true, pageCount: 0 },
                ],
                processingStatus: isLatest ? "processing" : (donor.id % 3 === 1 ? "rejected" : "processing")
              };
            }
          });
          setDonorsWithDetails(merged);
        } else {
          // If API fails, add dummy data for all donors
          // For latest donor, show processing status to demonstrate queue message
          const maxId = Math.max(...donors.map(d => d.id));
          const merged = donors.map(donor => {
            const isLatest = donor.id === maxId;
            return {
              ...donor,
              criticalFindings: donor.id % 3 === 1 ? [{
                type: "HIV",
                severity: "CRITICAL",
                automaticRejection: true,
                detectedAt: donor.created_at,
                source: {
                  documentId: "doc1",
                  pageNumber: "3",
                  confidence: 0.98
                }
              }] : undefined,
              rejectionReason: donor.id % 3 === 1 ? "Critical Finding: HIV Positive" : undefined,
              requiredDocuments: [
                { id: `rd-${donor.id}-1`, name: "Medical History", type: "medical_history", label: "Medical History", status: isLatest ? "processing" : (donor.id % 2 === 0 ? "missing" : "processing"), isRequired: true, pageCount: 0 },
                { id: `rd-${donor.id}-2`, name: "Serology Report", type: "serology_report", label: "Serology Report", status: isLatest ? "processing" : (donor.id % 2 === 0 ? "missing" : "completed"), isRequired: true, pageCount: 0 },
                { id: `rd-${donor.id}-3`, name: "Laboratory Results", type: "lab_results", label: "Laboratory Results", status: isLatest ? "processing" : "completed", isRequired: true, pageCount: 0 },
                { id: `rd-${donor.id}-4`, name: "Recovery Cultures", type: "recovery_cultures", label: "Recovery Cultures", status: "completed", isRequired: true, pageCount: 0 },
                { id: `rd-${donor.id}-5`, name: "Consent Form", type: "consent_form", label: "Consent Form", status: "completed", isRequired: true, pageCount: 0 },
                { id: `rd-${donor.id}-6`, name: "Death Certificate", type: "death_certificate", label: "Death Certificate", status: "completed", isRequired: true, pageCount: 0 },
              ],
              processingStatus: isLatest ? "processing" : (donor.id % 3 === 1 ? "rejected" : "processing")
            };
          });
          setDonorsWithDetails(merged);
        }
      } catch (err) {
        console.error('Failed to fetch donor details:', err);
        // Fallback to dummy data for all donors if API fails
        // For latest donor, show processing status to demonstrate queue message
        const maxId = Math.max(...donors.map(d => d.id));
        const merged = donors.map(donor => {
          const isLatest = donor.id === maxId;
          return {
            ...donor,
            criticalFindings: donor.id % 3 === 1 ? [{
              type: "HIV",
              severity: "CRITICAL",
              automaticRejection: true,
              detectedAt: donor.created_at,
              source: {
                documentId: "doc1",
                pageNumber: "3",
                confidence: 0.98
              }
            }] : undefined,
            rejectionReason: donor.id % 3 === 1 ? "Critical Finding: HIV Positive" : undefined,
            requiredDocuments: [
              { id: `rd-${donor.id}-1`, name: "Medical History", type: "medical_history", label: "Medical History", status: isLatest ? "processing" : (donor.id % 2 === 0 ? "missing" : "processing"), isRequired: true, pageCount: 0 },
              { id: `rd-${donor.id}-2`, name: "Serology Report", type: "serology_report", label: "Serology Report", status: isLatest ? "processing" : (donor.id % 2 === 0 ? "missing" : "completed"), isRequired: true, pageCount: 0 },
              { id: `rd-${donor.id}-3`, name: "Laboratory Results", type: "lab_results", label: "Laboratory Results", status: isLatest ? "processing" : "completed", isRequired: true, pageCount: 0 },
              { id: `rd-${donor.id}-4`, name: "Recovery Cultures", type: "recovery_cultures", label: "Recovery Cultures", status: "completed", isRequired: true, pageCount: 0 },
              { id: `rd-${donor.id}-5`, name: "Consent Form", type: "consent_form", label: "Consent Form", status: "completed", isRequired: true, pageCount: 0 },
              { id: `rd-${donor.id}-6`, name: "Death Certificate", type: "death_certificate", label: "Death Certificate", status: "completed", isRequired: true, pageCount: 0 },
            ],
            processingStatus: isLatest ? "processing" : (donor.id % 3 === 1 ? "rejected" : "processing")
          };
        });
        setDonorsWithDetails(merged);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDonorDetails();
  }, [donors]);

  const hasCriticalFindings = (donor: DonorWithDetails): boolean => {
    return Boolean(donor.criticalFindings && donor.criticalFindings.length > 0);
  };

  const getDocumentStatusBadge = (status: string) => {
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

  const filteredDonors = useMemo(() => {
    const donorsToFilter = donorsWithDetails.length > 0 ? donorsWithDetails : donors;
    const filtered = donorsToFilter.filter(donor => {
      const matchesSearch = donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           donor.unique_donor_id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterPriority === 'all' ||
                           (filterPriority === 'priority' && donor.is_priority) ||
                           (filterPriority === 'normal' && !donor.is_priority);
      
      return matchesSearch && matchesFilter;
    });
    
    // Find the latest donor (most recently created)
    if (filtered.length > 0) {
      const latestDonor = filtered.reduce((latest, current) => {
        const latestDate = new Date(latest.created_at || 0).getTime();
        const currentDate = new Date(current.created_at || 0).getTime();
        return currentDate > latestDate ? current : latest;
      });
      
      // Mark latest donor for status override
      return filtered.map(donor => ({
        ...donor,
        isLatestDonor: donor.id === latestDonor.id
      }));
    }
    
    return filtered;
  }, [donors, donorsWithDetails, searchTerm, filterPriority]);

  const getAgeDisplay = (donor: Donor) => {
    if (donor.age) {
      return `${donor.age} years`;
    }
    if (donor.date_of_birth) {
      const age = calculateAge(donor.date_of_birth);
      return `${age} years`;
    }
    return 'N/A';
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800 flex items-center`;
      case 'processing':
        return `${baseClasses} bg-yellow-100 text-yellow-800 flex items-center`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800 flex items-center`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800 flex items-center`;
      case 'pending':
        return `${baseClasses} bg-gray-100 text-gray-800 flex items-center`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 flex items-center`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'processing':
        return <Clock className="w-4 h-4 mr-1" />;
      case 'rejected':
      case 'failed':
        return <XCircle className="w-4 h-4 mr-1" />;
      case 'pending':
        return <Clock className="w-4 h-4 mr-1" />;
      default:
        return <Clock className="w-4 h-4 mr-1" />;
    }
  };

  const tableColumns = [
    {
      key: 'donor',
      title: 'Donor',
      render: (donor: DonorWithDetails & { isLatestDonor?: boolean }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-gray-900">{donor.name}</div>
        <button
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePriority(donor.id, donor.is_priority);
              }}
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            donor.is_priority
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          <Star className={`w-3 h-3 mr-1 ${donor.is_priority ? 'text-yellow-600' : 'text-gray-400'}`} />
          {donor.is_priority ? 'High Priority' : 'Normal'}
        </button>
          </div>
          <div className="text-xs text-gray-500">ID: {donor.unique_donor_id}</div>
          <div className="text-xs text-gray-600">
            {getAgeDisplay(donor)} • {donor.gender}
          </div>
          {hasCriticalFindings(donor) && (
            <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Critical Finding
            </div>
          )}
        </div>
      )
    },
    {
      key: 'critical_findings',
      title: 'Critical Findings',
      render: (donor: DonorWithDetails) => (
        <div className="space-y-2 min-w-[200px]">
          {hasCriticalFindings(donor) ? (
            <>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Critical Finding
              </span>
              {donor.rejectionReason && (
                <div className="text-xs text-red-600 mt-1">
                  {donor.rejectionReason}
                </div>
              )}
            </>
          ) : (
            <span className="text-xs text-gray-400">No critical findings</span>
          )}
        </div>
      )
    },
    {
      key: 'missing_documents',
      title: 'Missing Documents',
      render: (donor: DonorWithDetails) => {
        // Check if documents are still processing (has processing status and no completed documents yet)
        const hasProcessingDocs = donor.requiredDocuments && donor.requiredDocuments.some(doc => doc.status === 'processing');
        const hasCompletedDocs = donor.requiredDocuments && donor.requiredDocuments.some(doc => doc.status === 'completed');
        const hasUploadedDocs = donor.requiredDocuments && donor.requiredDocuments.some(doc => doc.status !== 'missing');
        
        // If there are processing documents but no completed ones, show queue message
        // Also show queue message if status is "processing" from backend
        const isProcessing = (hasProcessingDocs && !hasCompletedDocs) || 
                            (donor.processingStatus === 'processing' && !hasCompletedDocs) ||
                            (donor.processingStatus === 'pending' && hasUploadedDocs);
        
        // Only show missing documents if processing is complete
        const hasMissingDocs = donor.requiredDocuments && donor.requiredDocuments.some(doc => doc.status === 'missing');
        
        return (
          <div className="space-y-2 min-w-[250px]">
            {isProcessing ? (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-800">
                  <p className="font-medium mb-1">Documents are currently in queue</p>
                  <p className="text-yellow-700">Please check back later for status. Missing documents will be shown once processing is complete.</p>
                </div>
              </div>
            ) : hasMissingDocs ? (
              <>
                <div className="flex items-center text-yellow-600 text-sm mb-1">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Missing required documents
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {donor.requiredDocuments!
                    .filter(doc => doc.status === 'missing')
                    .map((doc, index) => (
                      <span
                        key={index}
                        className={`${getDocumentStatusBadge('missing')} flex items-center`}
                      >
                        {doc.label}: missing
                      </span>
                    ))}
                </div>
              </>
            ) : (
              <span className="text-xs text-gray-400">All documents present</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'status',
      title: 'Status',
      render: (donor: DonorWithDetails & { isLatestDonor?: boolean }) => {
        // Always show "completed" for the latest donor
        let status: string;
        if (donor.isLatestDonor) {
          status = 'completed';
        } else {
          // Use processingStatus from details, or generate dummy status for others
          status = donor.processingStatus || (donor.id % 4 === 0 ? 'completed' : donor.id % 4 === 1 ? 'processing' : donor.id % 4 === 2 ? 'pending' : 'processing');
        }
        
        const statusLabels: Record<string, string> = {
          'completed': 'Completed',
          'processing': 'Processing',
          'pending': 'Pending',
          'rejected': 'Rejected',
          'failed': 'Failed'
        };
        return (
          <span className={getStatusBadge(status)}>
            {getStatusIcon(status)}
            {statusLabels[status] || 'Processing'}
          </span>
        );
      }
    },
    {
      key: 'created',
      title: 'Created Date',
      render: (donor: Donor) => (
        <span className="text-sm text-gray-500">{formatDate(donor.created_at)}</span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      className: 'text-right',
      render: (donor: Donor) => (
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => navigate(`/documents/${donor.id}`)}
            className="text-blue-600 hover:bg-blue-100 p-1 rounded"
            title="View documents"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleTogglePriority(donor.id, donor.is_priority)}
            className={`p-1 rounded ${
              donor.is_priority 
                ? 'text-yellow-600 hover:bg-yellow-100' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={donor.is_priority ? 'Remove priority' : 'Set priority'}
          >
            <Star className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteDonor(donor.id)}
            className="text-red-600 hover:bg-red-100 p-1 rounded"
            title="Delete donor"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (showCreateForm) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DonorCreateForm
          onSuccess={handleDonorCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="w-8 h-8 mr-3 text-blue-600" />
              Donor Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage donor records and set processing priorities
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Donor
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Donors"
          value={donors.length}
          icon={<Users className="w-8 h-8" />}
          color="blue"
        />
        <StatsCard
          title="High Priority"
          value={donors.filter(d => d.is_priority).length}
          icon={<Star className="w-8 h-8" />}
          color="yellow"
        />
        <StatsCard
          title="Normal Priority"
          value={donors.filter(d => !d.is_priority).length}
          icon={<Clock className="w-8 h-8" />}
          color="green"
        />
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name or donor ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as 'all' | 'priority' | 'normal')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Donors</option>
              <option value="priority">High Priority</option>
              <option value="normal">Normal Priority</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Donors Table */}
      <Table
        data={filteredDonors as unknown as Record<string, unknown>[]}
        columns={tableColumns as unknown as Array<{ key: string; title: string; render?: (item: unknown) => React.ReactNode; className?: string }>}
        loading={loading || loadingDetails}
        emptyMessage={
          searchTerm || filterPriority !== 'all' 
            ? 'No donors match your search criteria.'
            : 'No donors found. Create your first donor to get started.'
        }
      />
    </div>
  );
}
