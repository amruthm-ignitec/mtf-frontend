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
import { useAuth } from '../contexts/AuthContext';

interface DonorWithDetails extends Donor {
  hasDocuments?: boolean; // Track if donor has any documents uploaded
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
  }> | null;
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
  const { donors, loading, error, deleteDonor, togglePriority, fetchDonors } = useDonors();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'priority' | 'normal'>('all');
  const [donorsWithDetails, setDonorsWithDetails] = useState<DonorWithDetails[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleDonorCreated = async () => {
    setShowCreateForm(false);
    // Refresh the donor list to show the newly created donor
    await fetchDonors();
  };

  const handleDeleteDonor = async (donorId: number) => {
    if (!isAdmin) {
      return;
    }
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
    if (!isAdmin) {
      return;
    }
    try {
      await togglePriority(donorId, currentPriority);
    } catch (err) {
      console.error('Failed to update priority:', err);
    }
  };

  // Fetch donor details with critical findings and missing documents
  // Also check which donors have documents uploaded
  useEffect(() => {
    const fetchDonorDetails = async () => {
      if (donors.length === 0) return;
      
      try {
        setLoadingDetails(true);
        const apiUrl = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem('authToken');
        
        // Check which donors have documents uploaded
        const donorsWithDocs = new Set<number>();
        await Promise.all(donors.map(async (donor) => {
          try {
            const docsResponse = await fetch(`${apiUrl}/documents/donor/${donor.id}`, {
              headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
              },
            });
            if (docsResponse.ok) {
              const docs = await docsResponse.json();
              if (docs && Array.isArray(docs) && docs.length > 0) {
                donorsWithDocs.add(donor.id);
              }
            }
          } catch (err) {
            // Silently fail - donor might not have documents yet
          }
        }));
        
        const response = await fetch(`${apiUrl}/donors/queue/details`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        
        if (response.ok) {
          const detailsData = await response.json();
          // Merge details with donors - only add details if donor has documents
          const merged = donors.map(donor => {
            const details = detailsData.find((d: any) => d.id === String(donor.id) || d.id === donor.id);
            const hasDocuments = donorsWithDocs.has(donor.id);
            
            if (details && hasDocuments) {
              // Donor has documents and details from API
              return {
                ...donor,
                ...details,
                id: donor.id, // Keep original id type
                hasDocuments: true,
              };
            } else if (hasDocuments) {
              // Donor has documents but no details from queue API - use basic structure
              return {
                ...donor,
                hasDocuments: true,
                criticalFindings: undefined,
                requiredDocuments: undefined,
                processingStatus: undefined,
              };
            } else {
              // Donor has no documents - don't show critical findings or missing documents
              return {
                ...donor,
                hasDocuments: false,
                criticalFindings: undefined,
                requiredDocuments: undefined,
                processingStatus: undefined,
              };
            }
          });
          setDonorsWithDetails(merged);
        } else {
          // If API fails, only add document status, no dummy data
          const merged = donors.map(donor => {
            const hasDocuments = donorsWithDocs.has(donor.id);
            return {
              ...donor,
              hasDocuments,
              criticalFindings: undefined,
              requiredDocuments: undefined,
              processingStatus: undefined,
            };
          });
          setDonorsWithDetails(merged);
        }
      } catch (err) {
        console.error('Failed to fetch donor details:', err);
        // On error, just mark donors without document info
        const merged = donors.map(donor => ({
          ...donor,
          hasDocuments: false,
          criticalFindings: undefined,
          requiredDocuments: undefined,
          processingStatus: undefined,
        }));
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

  const hasCriticalFindingsData = (donor: DonorWithDetails): boolean => {
    // Returns true if we have critical findings data (even if empty array)
    // Returns false if data is not available yet (undefined or null)
    return donor.criticalFindings !== undefined && donor.criticalFindings !== null;
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
    
    // Sort by created_at in descending order (newest first)
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
    
    // Find the latest donor (most recently created) - first item after sorting
    if (sorted.length > 0) {
      const latestDonor = sorted[0];
      
      // Mark latest donor for status override
      return sorted.map(donor => ({
        ...donor,
        isLatestDonor: donor.id === latestDonor.id
      }));
    }
    
    return sorted;
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
      className: 'w-64',
      render: (donor: DonorWithDetails & { isLatestDonor?: boolean }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-sm font-medium text-gray-900">{donor.name}</div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isAdmin) return;
                handleTogglePriority(donor.id, donor.is_priority);
              }}
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                donor.is_priority
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              } ${isAdmin ? 'hover:bg-yellow-200 hover:bg-gray-200' : ''}`}
              disabled={!isAdmin}
            >
              <Star className={`w-3 h-3 mr-1 ${donor.is_priority ? 'text-yellow-600' : 'text-gray-400'}`} />
              {donor.is_priority ? 'High Priority' : 'Normal'}
            </button>
          </div>
          <div className="text-xs text-gray-500">ID: {donor.unique_donor_id}</div>
          <div className="text-xs text-gray-600">
            {getAgeDisplay(donor)} • {donor.gender}
            {(() => {
              const date = new Date(donor.created_at);
              const month = date.toLocaleDateString('en-US', { month: 'short' });
              const day = date.getDate();
              const year = date.getFullYear();
              return ` • ${month} ${day}, ${year}`;
            })()}
          </div>
        </div>
      )
    },
    {
      key: 'critical_findings',
      title: 'Critical Findings',
      className: 'w-48',
      render: (donor: DonorWithDetails) => {
        // Only show if donor has documents uploaded
        if (!donor.hasDocuments) {
          return <span className="text-xs text-gray-400">—</span>;
        }
        
        // Check if we have critical findings data available
        if (!hasCriticalFindingsData(donor)) {
          // Data not available yet - might still be processing
          return (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">Processing...</span>
            </div>
          );
        }
        
        // Data is available - check if there are critical findings
        return (
          <div className="space-y-1">
            {hasCriticalFindings(donor) ? (
              <>
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Critical Finding
                </div>
                {donor.rejectionReason && (
                  <div className="text-xs text-red-600 mt-1 line-clamp-2">
                    {donor.rejectionReason}
                  </div>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-400">None</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'status',
      title: 'Status',
      className: 'w-[72px]',
      render: (donor: DonorWithDetails & { isLatestDonor?: boolean }) => {
        // Only show if donor has documents uploaded
        if (!donor.hasDocuments) {
          return <span className="text-xs text-gray-400">—</span>;
        }
        
        // Use processingStatus from backend
        const status = donor.processingStatus || 'pending';
        
        const statusLabels: Record<string, string> = {
          'completed': 'Done',
          'processing': 'Processing',
          'pending': 'Pending',
          'rejected': 'Rejected',
          'failed': 'Failed'
        };
        return (
          <span className={getStatusBadge(status)}>
            {getStatusIcon(status)}
            <span className="whitespace-nowrap">{statusLabels[status] || 'Processing'}</span>
          </span>
        );
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      className: 'w-32 text-right',
      render: (donor: Donor) => (
        <div className="flex justify-end space-x-1">
          <button
            onClick={() => navigate(`/documents/${donor.id}`)}
            className="text-blue-600 hover:bg-blue-100 p-1 rounded"
            title="View documents"
          >
            <FileText className="w-4 h-4" />
          </button>
          {isAdmin && (
            <>
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
            </>
          )}
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
          {isAdmin && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Donor
            </Button>
          )}
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
