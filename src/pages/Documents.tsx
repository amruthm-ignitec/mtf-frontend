import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  RefreshCw,
  Search,
  Filter,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  FileSearch
} from 'lucide-react';
import { apiService } from '../services/api';
import { Donor } from '../types/donor';
import { ExtractionDataResponse } from '../types/extraction';
import DocumentStatusSlider, { DocumentStatus } from '../components/ui/DocumentStatusSlider';
import DocumentChecklist from '../components/donor/DocumentChecklist';
import DonorFeedback from '../components/donor/DonorFeedback';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import { useAuth } from '../contexts/AuthContext';

interface Document {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  document_type: string;
  status: DocumentStatus;
  progress: number;
  donor_id: string;
  created_at?: string;
  [key: string]: unknown;
}

export default function Documents() {
  const { donorId } = useParams<{ donorId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canViewSummary = user?.role === 'admin' || user?.role === 'medical_director';
  const [donor, setDonor] = useState<Donor | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [extractionData, setExtractionData] = useState<ExtractionDataResponse | null>(null);

  // Debug logging
  console.log('Documents page loaded with donorId:', donorId);

  useEffect(() => {
    if (!donorId) {
      setError('No donor ID provided. Please navigate from the donor management page.');
      return;
    }
    fetchDonorAndDocuments();
  }, [donorId]);

  const fetchDonorAndDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch donor details
      const donors = await apiService.getDonors();
      const selectedDonor = donors.find(d => d.id === donorId);
      if (!selectedDonor) {
        setError(`Donor with ID ${donorId} not found. Please check the donor ID and try again.`);
        return;
      }
      setDonor(selectedDonor);

      const documentsData = await apiService.getDonorDocuments(donorId);
      const mapped: Document[] = (documentsData as { id: string; donor_id: string; filename: string; status: string }[]).map((d) => ({
        id: d.id,
        donor_id: d.donor_id,
        filename: d.filename,
        original_filename: d.filename,
        file_size: 0,
        file_type: 'application/pdf',
        document_type: 'Medical',
        status: (d.status?.toLowerCase() || 'queued') as DocumentStatus,
        progress: d.status === 'COMPLETED' ? 100 : 0,
      }));
      setDocuments(mapped);

      try {
        const extraction = await apiService.getDonorExtractionData(donorId);
        setExtractionData(extraction);
      } catch (err) {
        // Extraction data is optional, so we don't show an error if it fails
        console.log('Extraction data not available:', err);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      let errorMessage = 'Failed to load data';
      
      if (err instanceof Error) {
        if (err.message.includes('401') || err.message.includes('Could not validate credentials')) {
          errorMessage = 'Authentication failed. Please log in again.';
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else if (err.message.includes('404')) {
          errorMessage = 'Donor or documents not found.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDonorAndDocuments();
    setRefreshing(false);
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) return;
    try {
      await apiService.deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      const pdfUrl = apiService.getDocumentPdfUrl(document.id);
      const isApiUrl = pdfUrl.includes('/documents/') && pdfUrl.includes('/pdf');
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {};
      if (isApiUrl && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(pdfUrl, { headers });
      if (!response.ok) {
        throw new Error(`Failed to open PDF: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      // Let the new tab load first, then revoke (best-effort)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      console.error('Error opening PDF in new tab:', err);
      // Fall back to opening the URL directly
      const pdfUrl = apiService.getDocumentPdfUrl(document.id);
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
      case 'analyzing':
      case 'reviewing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'uploaded':
        return <Upload className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tableColumns = [
    {
      key: 'document',
      title: 'Document',
      render: (doc: Document) => (
        <div className="flex items-center space-x-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <div className="text-sm font-medium text-gray-900">{doc.original_filename}</div>
            <div className="text-xs text-gray-500">{doc.document_type}</div>
          </div>
        </div>
      )
    },
    {
      key: 'size',
      title: 'Size',
      render: (doc: Document) => (
        <span className="text-sm text-gray-900">{formatFileSize(doc.file_size)}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (doc: Document) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(doc.status)}
          <span className="text-sm text-gray-900 capitalize">{doc.status}</span>
        </div>
      )
    },
    {
      key: 'uploaded',
      title: 'Uploaded',
      render: (doc: Document) => (
        <span className="text-sm text-gray-500">{doc.created_at ? formatDate(doc.created_at) : '—'}</span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      className: 'text-right',
      render: (doc: Document) => (
        <div className="flex justify-end space-x-2">
          {doc.status === 'completed' && canViewSummary && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!donorId) {
                  console.error('Donor ID is missing');
                  alert('Donor ID is missing. Cannot navigate to summary.');
                  return;
                }
                console.log('Navigating to summary with donorId:', donorId, 'and donor:', donor);
                navigate(`/summary/${donorId}`, {
                  state: { donor: donor }
                });
              }}
              className="text-green-600 hover:text-green-800 p-1 rounded"
              title="View Summary"
            >
              <FileSearch className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadDocument(doc);
            }}
            className="text-blue-600 hover:text-blue-800 p-1 rounded"
            title="View / Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteDocument(doc.id);
            }}
            className="text-red-600 hover:text-red-800 p-1 rounded"
            title="Delete document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading documents...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </Card>
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
              <FileText className="w-8 h-8 mr-3 text-blue-600" />
              Documents
            </h1>
            {donor && (
              <p className="text-gray-600 mt-2">
                Managing documents for <span className="font-medium">{donor.name}</span> (ID: {donor.unique_donor_id})
              </p>
            )}
            {/* Donor page tabs: Documents | Summary */}
            {donorId && (
              <div className="flex border-b border-gray-200 mt-4 -mb-px">
                <span className="px-4 py-2 border-b-2 border-blue-600 text-sm font-medium text-blue-600">
                  Documents
                </span>
                {canViewSummary && (
                  <button
                    type="button"
                    onClick={() => navigate(`/summary/${donorId}`, { state: { donor } })}
                    className="px-4 py-2 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  >
                    Summary
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="secondary"
              icon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Button
              onClick={() => navigate(`/upload/${donorId}`)}
              icon={<Upload className="w-4 h-4" />}
            >
              Upload Document
            </Button>
            {canViewSummary && donorId && (
              <Button
                onClick={() => navigate(`/summary/${donorId}`, { state: { donor } })}
                variant="primary"
                icon={<FileSearch className="w-4 h-4" />}
              >
                Summary
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DocumentStatus | 'all')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="uploaded">Uploaded</option>
              <option value="processing">Processing</option>
              <option value="analyzing">Analyzing</option>
              <option value="reviewing">Reviewing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Document Checklist */}
      <DocumentChecklist 
        documents={documents} 
        extractionData={extractionData || undefined}
      />

      {/* Documents Table */}
      <Table
        data={filteredDocuments}
        columns={tableColumns}
        loading={loading}
        emptyMessage="No documents found. Upload documents to get started."
      />

      {/* Document Status Details - Only show non-completed documents */}
      {filteredDocuments.filter(doc => doc.status !== 'completed').length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Processing Status</h2>
          {filteredDocuments
            .filter(doc => doc.status !== 'completed')
            .map((doc) => (
              <DocumentStatusSlider
                key={doc.id}
                status={doc.status}
                progress={doc.progress}
                errorMessage={doc.error_message}
              />
            ))}
        </div>
      )}

      {/* Donor Feedback Section */}
      {donorId && (
        <div className="mt-8">
          <DonorFeedback donorId={Number(donorId)} />
        </div>
      )}
    </div>
  );
}
