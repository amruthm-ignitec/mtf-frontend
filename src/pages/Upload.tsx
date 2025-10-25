import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload as UploadIcon, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  Link as LinkIcon,
  Database,
  Loader2
} from 'lucide-react';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  documentType: string;
  error?: string;
  stored_document_id?: number;
}

const DOCUMENT_TYPES = [
  'Medical History',
  'Serology Report',
  'Laboratory Results',
  'Recovery Cultures',
  'Consent Form',
  'Death Certificate'
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

export default function Upload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Filter out files that are too large
    const validFiles = acceptedFiles.filter(file => file.size <= MAX_FILE_SIZE);
    const oversizedFiles = acceptedFiles.filter(file => file.size > MAX_FILE_SIZE);

    if (oversizedFiles.length > 0) {
      setError(`${oversizedFiles.length} file(s) exceeded the 10MB limit and were skipped.`);
    }

    if (validFiles.length === 0) return;

    const newFiles = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading' as const,
      documentType: 'Medical History' // default value
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsUploading(true);
    setError(null);

    // Upload each file
    await Promise.all(newFiles.map(async (fileObj) => {
      const formData = new FormData();
      formData.append('file', fileObj.file);
      formData.append('documentType', fileObj.documentType);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = await response.json();

        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileObj.id 
              ? { ...f, status: 'completed', progress: 100, stored_document_id: data.document_id } 
              : f
          )
        );
      } catch (error) {
        console.error('Upload error:', error);
        setError('Failed to upload one or more files. Please try again.');
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileObj.id 
              ? { ...f, status: 'error', error: error.message } 
              : f
          )
        );
      }
    }));

    setIsUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: MAX_FILE_SIZE,
    disabled: isUploading
  });

  const handleTypeChange = async (fileId: string, newType: string) => {
    const fileObj = uploadedFiles.find(f => f.id === fileId);
    if (!fileObj?.stored_document_id) return;

    try {
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/documents/${fileObj.stored_document_id}/type`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ documentType: newType }),
        }
      );

      if (!response.ok) throw new Error('Failed to update document type');

      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, documentType: newType }
            : f
        )
      );
    } catch (error) {
      console.error('Error updating document type:', error);
      setError('Failed to update document type. Please try again.');
    }
  };

  const handleRemoveFile = async (fileId: string) => {
    const fileObj = uploadedFiles.find(f => f.id === fileId);
    if (!fileObj?.stored_document_id) {
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      return;
    }

    try {
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/documents/${fileObj.stored_document_id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Failed to delete document');

      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Error deleting document:', error);
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
        <p className="mt-2 text-sm text-gray-500">
          Upload medical records and documents for AI-powered analysis
        </p>
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

      {/* Upload Source Selection */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-medium text-gray-900 mb-4">Select Upload Source</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50 flex flex-col items-center transition-colors duration-150 hover:bg-blue-100"
            disabled={isUploading}
          >
            <UploadIcon className="w-6 h-6 mb-2 text-blue-600" />
            <span className="font-medium text-sm text-gray-900">File Upload</span>
            <span className="text-xs text-gray-500 mt-1">Upload PDF files directly</span>
          </button>

          <button disabled className="p-4 rounded-lg border-2 border-gray-200 flex flex-col items-center transition-colors duration-150 opacity-50 cursor-not-allowed">
            <LinkIcon className="w-6 h-6 mb-2 text-gray-400" />
            <span className="font-medium text-sm text-gray-900">API Integration</span>
            <span className="text-xs text-gray-500 mt-1">Coming soon</span>
          </button>

          <button disabled className="p-4 rounded-lg border-2 border-gray-200 flex flex-col items-center transition-colors duration-150 opacity-50 cursor-not-allowed">
            <Database className="w-6 h-6 mb-2 text-gray-400" />
            <span className="font-medium text-sm text-gray-900">Custom Connection</span>
            <span className="text-xs text-gray-500 mt-1">Coming soon</span>
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div className="space-y-6">
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 transition-colors duration-150 cursor-pointer
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
            ${isUploading ? 'cursor-not-allowed opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} disabled={isUploading} />
          <div className="text-center">
            <UploadIcon className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-900">
              {isDragActive ? 'Drop the files here' : 'Drag and drop PDF files here'}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              or click to select files from your computer (max 10MB per file)
            </p>
          </div>
        </div>

        {/* Uploaded Documents */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-5">
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Uploaded Documents
              </h3>
              <div className="space-y-3">
                {uploadedFiles.map((fileObj) => (
                  <div key={fileObj.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <File className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{fileObj.file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(fileObj.file.size)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <select 
                        className="text-sm border-gray-300 rounded-md pr-8 py-1.5 focus:ring-blue-500 focus:border-blue-500"
                        value={fileObj.documentType}
                        onChange={(e) => handleTypeChange(fileObj.id, e.target.value)}
                        disabled={fileObj.status === 'uploading'}
                      >
                        {DOCUMENT_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>

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
                        <AlertCircle className="h-5 w-5 text-red-500" title={fileObj.error} />
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
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}