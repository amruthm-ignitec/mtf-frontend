import React from 'react';
import { Finding } from '../../types/donor';
import { X } from 'lucide-react';

interface FindingDetailsModalProps {
  finding: Finding;
  isOpen: boolean;
  onClose: () => void;
}

export default function FindingDetailsModal({ finding, isOpen, onClose }: FindingDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">{finding.description}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 rounded-full text-sm font-medium ${
                  finding.category === 'critical'
                    ? 'bg-red-100 text-red-800'
                    : finding.category === 'moderate'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {finding.category}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-sm font-medium ${
                  finding.type === 'positive'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {finding.type}
              </span>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Citations</h3>
              <div className="space-y-2">
                {finding.citations.map((citation) => (
                  <div
                    key={citation.id}
                    className="bg-gray-50 p-3 rounded-md text-sm"
                  >
                    <div className="flex justify-between">
                      <span>Page {citation.pageNumber}</span>
                      <span className="text-blue-600 cursor-pointer hover:underline">
                        View in Document
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 