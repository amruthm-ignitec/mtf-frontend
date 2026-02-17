import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useParams, useLocation } from 'react-router-dom';
import { 
  Upload as UploadIcon, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { apiService } from '../services/api';
import { Donor } from '../types/donor';
import DocumentStatusSlider, { DocumentStatus } from '../components/ui/DocumentStatusSlider';
import Toast from '../components/ui/Toast';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  documentType: string;
  error?: string;
  stored_document_id?: string;
  donor_id?: string;
  documentStatus?: DocumentStatus;
}

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB in bytes

export default function Upload() {
  const { donorId: donorIdParam } = useParams<{ donorId?: string }>();
  const location = useLocation();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [donor, setDonor] = useState<Donor | null>(null);
  const [loadingDonor, setLoadingDonor] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Get donorId from URL params or location state
  const donorId = donorIdParam || (location.state as any)?.donorId;

  // Fetch donor details if donorId is provided (optional in POC)
  useEffect(() => {
    const fetchDonor = async () => {
      if (!donorId) {
        setLoadingDonor(false);
        return;
      }
      try {
        setLoadingDonor(true);
        const donorsData = await apiService.getDonors();
        const selectedDonor = donorsData.find(d => d.id === donorId);
        setDonor(selectedDonor ?? null);
        if (!selectedDonor) setError(`Donor with ID ${donorId} not found.`);
      } catch (err) {
        console.error('Failed to fetch donor:', err);
        setError('Failed to load donor information. Please refresh the page.');
      } finally {
        setLoadingDonor(false);
      }
    };
    fetchDonor();
  }, [donorId]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(f => f.size <= MAX_FILE_SIZE && f.type === 'application/pdf');
    const oversized = acceptedFiles.filter(f => f.size > MAX_FILE_SIZE);
    const nonPdf = acceptedFiles.filter(f => f.type !== 'application/pdf');
    if (oversized.length > 0) setError(`${oversized.length} file(s) exceeded 500MB and were skipped.`);
    if (nonPdf.length > 0) setError('Only PDF files are accepted.');
    if (validFiles.length === 0) return;

    const newFiles = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading' as const,
      documentType: 'Medical History',
      documentStatus: 'uploaded' as DocumentStatus
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsUploading(true);
    setError(null);
    let successCount = 0;
    await Promise.all(newFiles.map(async (fileObj) => {
      try {
        const data = await apiService.uploadDocument(fileObj.file);
        setUploadedFiles(prev => prev.map(f =>
          f.id === fileObj.id
            ? { ...f, status: 'completed', progress: 100, stored_document_id: data.document_id, donor_id: data.donor_id, documentStatus: 'processing' as DocumentStatus }
            : f
        ));
        successCount++;
      } catch (err) {
        setError('Failed to upload one or more files. Please try again.');
        setUploadedFiles(prev => prev.map(f =>
          f.id === fileObj.id ? { ...f, status: 'error', error: (err as Error).message, documentStatus: 'failed' as DocumentStatus } : f
        ));
      }
    }));
    if (successCount > 0) {
      setToastMessage(`PDF(s) uploaded. Donor created/updated from filename. Processing in queue.`);
      setShowToast(true);
    }
    setIsUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: MAX_FILE_SIZE,
    disabled: isUploading
  });


  const handleRemoveFile = async (fileId: string) => {
    const fileObj = uploadedFiles.find(f => f.id === fileId);
    if (!fileObj?.stored_document_id) {
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      return;
    }
    try {
      setError(null);
      await apiService.deleteDocument(fileObj.stored_document_id);
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Upload Documents</h1>
        {loadingDonor ? (
          <div className="flex items-center mt-2">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm text-gray-500">Loading donor information...</span>
          </div>
        ) : donor ? (
          <p className="mt-2 text-sm text-gray-500">
            Uploading documents for <span className="font-medium">{donor.name}</span> (ID: {donor.unique_donor_id})
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-500">
            Upload medical records and documents for AI-powered analysis
          </p>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="space-y-6">
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-12 transition-colors duration-150 cursor-pointer bg-white
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${isUploading ? 'cursor-not-allowed opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} disabled={isUploading} />
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                <UploadIcon className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <p className="text-base font-semibold text-gray-900 mb-1">
              {isDragActive ? 'Drop PDFs here' : 'Drag and drop PDF files here'}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {donorId ? `Uploading for donor ${donor?.name ?? donorId}` : 'Donor will be created from filename (e.g. 0042510891 Section 1.pdf).'}
            </p>
            
            {/* File Type Buttons */}
            <div className="flex justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isUploading) open();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUploading}
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isUploading) open();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUploading}
              >
                <FileText className="w-4 h-4" />
                DOC
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isUploading) open();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUploading}
              >
                <FileText className="w-4 h-4" />
                DOCX
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isUploading) open();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUploading}
              >
                <ImageIcon className="w-4 h-4" />
                JPG
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isUploading) open();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUploading}
              >
                <ImageIcon className="w-4 h-4" />
                PNG
              </button>
            </div>
          </div>
        </div>

        {/* Uploaded Documents */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-5">
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Uploaded Documents
              </h3>
              <div className="space-y-4">
                {uploadedFiles.map((fileObj) => (
                  <div key={fileObj.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <File className="h-6 w-6 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{fileObj.file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(fileObj.file.size)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {fileObj.status === 'uploading' && (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                            <span className="text-sm text-gray-500">Uploading...</span>
                          </div>
                        )}
                        
                        {fileObj.status === 'completed' && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        
                        {fileObj.status === 'error' && (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        
                        <button 
                          onClick={() => handleRemoveFile(fileObj.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                          disabled={fileObj.status === 'uploading'}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Document Status Slider */}
                    {fileObj.documentStatus && (
                      <DocumentStatusSlider
                        status={fileObj.documentStatus}
                        progress={fileObj.progress}
                        errorMessage={fileObj.error}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="info"
          duration={6000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}