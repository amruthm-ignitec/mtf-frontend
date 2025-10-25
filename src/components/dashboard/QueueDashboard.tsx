import { useState } from 'react';
import { Clock, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { DonorRecord, ProcessingStatus } from '../../types';
import { mockDonors } from '../../mocks/data';
import { useNavigate } from 'react-router-dom';
import TissueAnalysisDashboard from './TissueAnalysisDashboard';

const statusIcons: Record<ProcessingStatus, typeof Clock> = {
  pending: Clock,
  processing: Loader2,
  completed: CheckCircle,
  failed: XCircle,
};

export default function QueueDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('queue');
  const [selectedDonor, setSelectedDonor] = useState<DonorRecord | null>(null);
  const donors = mockDonors;

  const filteredDonors = donors.filter((donor: DonorRecord) =>
    donor.donorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDonorSelect = (donor: DonorRecord) => {
    setSelectedDonor(donor);
    setActiveTab('analysis');
  };

  return (
    <div className="p-6">
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('queue')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'queue'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300'
            }`}
          >
            Document Queue
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            disabled={!selectedDonor}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analysis'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300'
            } ${!selectedDonor && 'opacity-50 cursor-not-allowed'}`}
          >
            Tissue Analysis
          </button>
        </div>
      </div>

      {activeTab === 'queue' ? (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Document Queue</h1>
            <p className="text-gray-600">Manage and monitor document processing status</p>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search donors..."
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Donor Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Upload Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Documents</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredDonors.map((donor: DonorRecord) => {
                  const StatusIcon = statusIcons[donor.processingStatus];
                  return (
                    <tr key={donor.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{donor.donorName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <StatusIcon className="w-4 h-4 mr-2" />
                          {donor.processingStatus}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(donor.uploadTimestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {donor.documents.length} files
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-4">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => navigate(`/summary/${donor.id}`)}
                          >
                            View Details
                          </button>
                          <button
                            className="text-green-600 hover:text-green-800 font-medium"
                            onClick={() => handleDonorSelect(donor)}
                          >
                            Analyze Tissues
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        selectedDonor && (
          <div>
            <button
              onClick={() => setActiveTab('queue')}
              className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center"
            >
              ← Back to Queue
            </button>
            <TissueAnalysisDashboard donor={selectedDonor} />
          </div>
        )
      )}
    </div>
  );
} 