import React from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  XCircle,
  Loader2 
} from 'lucide-react';

export type DocumentStatus = 
  | 'uploaded' 
  | 'processing' 
  | 'analyzing' 
  | 'reviewing' 
  | 'completed' 
  | 'failed' 
  | 'rejected';

interface DocumentStatusSliderProps {
  status: DocumentStatus;
  progress?: number; // 0-100
  errorMessage?: string;
  className?: string;
}

const statusConfig = {
  uploaded: {
    icon: Upload,
    label: 'Uploaded',
    color: 'blue',
    description: 'Document uploaded successfully'
  },
  processing: {
    icon: FileText,
    label: 'Processing',
    color: 'yellow',
    description: 'Extracting text and metadata'
  },
  analyzing: {
    icon: Loader2,
    label: 'Analyzing',
    color: 'purple',
    description: 'AI analysis in progress'
  },
  reviewing: {
    icon: Clock,
    label: 'Reviewing',
    color: 'orange',
    description: 'Under medical review'
  },
  completed: {
    icon: CheckCircle,
    label: 'Completed',
    color: 'green',
    description: 'Processing completed successfully'
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    color: 'red',
    description: 'Processing failed'
  },
  rejected: {
    icon: AlertCircle,
    label: 'Rejected',
    color: 'red',
    description: 'Document rejected'
  }
};

const colorClasses = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: 'text-blue-600',
    progress: 'bg-blue-600'
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    icon: 'text-yellow-600',
    progress: 'bg-yellow-600'
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    icon: 'text-purple-600',
    progress: 'bg-purple-600'
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    icon: 'text-orange-600',
    progress: 'bg-orange-600'
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: 'text-green-600',
    progress: 'bg-green-600'
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: 'text-red-600',
    progress: 'bg-red-600'
  }
};

const DocumentStatusSlider: React.FC<DocumentStatusSliderProps> = ({
  status,
  progress = 0,
  errorMessage,
  className = ''
}) => {
  const config = statusConfig[status];
  const colors = colorClasses[config.color];
  const IconComponent = config.icon;

  const isAnimated = status === 'processing' || status === 'analyzing';
  const showProgress = progress > 0 && progress < 100;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${colors.bg}`}>
            <IconComponent 
              className={`w-5 h-5 ${colors.icon} ${isAnimated ? 'animate-spin' : ''}`} 
            />
          </div>
          <div>
            <h3 className={`text-sm font-medium ${colors.text}`}>
              {config.label}
            </h3>
            <p className="text-xs text-gray-500">
              {config.description}
            </p>
          </div>
        </div>
        
        {showProgress && (
          <div className="text-right">
            <span className={`text-sm font-medium ${colors.text}`}>
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {(showProgress || isAnimated) && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${colors.progress} ${
              isAnimated ? 'animate-pulse' : ''
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Status Steps */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <div className={`flex items-center ${status === 'uploaded' ? colors.text : ''}`}>
          <div className={`w-2 h-2 rounded-full mr-1 ${
            status === 'uploaded' ? colors.progress : 'bg-gray-300'
          }`} />
          Uploaded
        </div>
        <div className={`flex items-center ${status === 'processing' ? colors.text : ''}`}>
          <div className={`w-2 h-2 rounded-full mr-1 ${
            status === 'processing' ? colors.progress : 'bg-gray-300'
          }`} />
          Processing
        </div>
        <div className={`flex items-center ${status === 'analyzing' ? colors.text : ''}`}>
          <div className={`w-2 h-2 rounded-full mr-1 ${
            status === 'analyzing' ? colors.progress : 'bg-gray-300'
          }`} />
          Analyzing
        </div>
        <div className={`flex items-center ${status === 'reviewing' ? colors.text : ''}`}>
          <div className={`w-2 h-2 rounded-full mr-1 ${
            status === 'reviewing' ? colors.progress : 'bg-gray-300'
          }`} />
          Reviewing
        </div>
        <div className={`flex items-center ${status === 'completed' ? colors.text : ''}`}>
          <div className={`w-2 h-2 rounded-full mr-1 ${
            status === 'completed' ? colors.progress : 'bg-gray-300'
          }`} />
          Completed
        </div>
      </div>
    </div>
  );
};

export default DocumentStatusSlider;
export type { DocumentStatus };
