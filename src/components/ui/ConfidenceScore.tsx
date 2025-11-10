import React from 'react';

interface ConfidenceScoreProps {
  confidence: number;
  showLabel?: boolean;
  className?: string;
}

export default function ConfidenceScore({
  confidence,
  showLabel = true,
  className = '',
}: ConfidenceScoreProps) {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.9) return 'text-green-600';
    if (conf >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBgColor = (conf: number) => {
    if (conf >= 0.9) return 'bg-green-100';
    if (conf >= 0.7) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const percentage = Math.round(confidence * 100);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabel && <span className="text-xs text-gray-500">Confidence:</span>}
      <div className="flex items-center space-x-1">
        <span className={`text-sm font-medium ${getConfidenceColor(confidence)}`}>
          {percentage}%
        </span>
        <div className={`w-16 h-2 rounded-full ${getConfidenceBgColor(confidence)}`}>
          <div
            className={`h-2 rounded-full ${
              confidence >= 0.9
                ? 'bg-green-500'
                : confidence >= 0.7
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

