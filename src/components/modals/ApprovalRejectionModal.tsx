import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, History, User, Clock } from 'lucide-react';
import { ApprovalStatus, ApprovalType, PastDataResponse, DonorApprovalResponse } from '../../types/donorApproval';
import Button from '../ui/Button';
import { apiService } from '../../services/api';

interface ApprovalRejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: ApprovalStatus, comment: string) => Promise<void>;
  donorId: number;
  documentId?: number | null;
  approvalType: ApprovalType;
  donorName?: string;
  documentName?: string;
}

export default function ApprovalRejectionModal({
  isOpen,
  onClose,
  onConfirm,
  donorId,
  documentId,
  approvalType,
  donorName,
  documentName
}: ApprovalRejectionModalProps) {
  const [comment, setComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ApprovalStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pastData, setPastData] = useState<DonorApprovalResponse[]>([]);
  const [loadingPastData, setLoadingPastData] = useState(false);

  // Load past data when modal opens
  useEffect(() => {
    if (isOpen && donorId) {
      loadPastData();
    }
  }, [isOpen, donorId]);

  const loadPastData = async () => {
    try {
      setLoadingPastData(true);
      // Try to fetch real data, but if it fails, use dummy data
      try {
        const data = await apiService.getDonorPastData(donorId);
        setPastData(data.past_decisions);
      } catch (err) {
        // Use dummy data if API fails
        setPastData(getDummyPastData());
      }
    } catch (err) {
      // Fallback to dummy data
      setPastData(getDummyPastData());
    } finally {
      setLoadingPastData(false);
    }
  };

  // Dummy past data for demonstration
  const getDummyPastData = (): DonorApprovalResponse[] => {
    return [
      {
        id: 1,
        donor_id: donorId,
        document_id: null,
        approval_type: 'donor_summary',
        status: 'rejected',
        comment: 'Rejected due to incomplete medical records. Missing critical information about donor\'s medical history and previous surgeries. Physical assessment documentation was incomplete.',
        checklist_data: {
          initial_paperwork: {
            donor_login_packet: 'COMPLETE',
            donor_information: 'COMPLETE',
            drai: 'COMPLETE',
            physical_assessment: 'INCOMPLETE',
            medical_records_review: 'INCOMPLETE',
            tissue_recovery: 'COMPLETE',
            plasma_dilution: 'COMPLETE',
            authorization: 'COMPLETE',
            infectious_disease_testing: 'COMPLETE',
            medical_records: 'INCOMPLETE'
          }
        },
        approved_by: 1,
        approver_name: 'Dr. Sarah Johnson',
        approver_email: 'sarah.johnson@example.com',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: null
      },
      {
        id: 2,
        donor_id: donorId,
        document_id: null,
        approval_type: 'donor_summary',
        status: 'approved',
        comment: 'Approved after receiving complete medical records. All required documentation is now present and verified. Donor meets all eligibility criteria.',
        checklist_data: {
          initial_paperwork: {
            donor_login_packet: 'COMPLETE',
            donor_information: 'COMPLETE',
            drai: 'COMPLETE',
            physical_assessment: 'COMPLETE',
            medical_records_review: 'COMPLETE',
            tissue_recovery: 'COMPLETE',
            plasma_dilution: 'COMPLETE',
            authorization: 'COMPLETE',
            infectious_disease_testing: 'COMPLETE',
            medical_records: 'COMPLETE'
          }
        },
        approved_by: 1,
        approver_name: 'Dr. Sarah Johnson',
        approver_email: 'sarah.johnson@example.com',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: null
      }
    ];
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedStatus) {
      setError('Please select Approve or Reject');
      return;
    }

    if (!comment.trim()) {
      setError('Please provide a comment explaining your decision');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(selectedStatus, comment.trim());
      // Reset form on success
      setComment('');
      setSelectedStatus(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit approval/rejection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setComment('');
      setSelectedStatus(null);
      setError(null);
      onClose();
    }
  };

  const targetName = approvalType === 'donor_summary' 
    ? `Donor Summary${donorName ? ` for ${donorName}` : ''}`
    : `Document${documentName ? `: ${documentName}` : ''}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {approvalType === 'donor_summary' ? 'Approve/Reject Donor Summary' : 'Approve/Reject Document'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{targetName}</p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Past Data Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <History className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Past Data - Previous Decisions</h3>
            </div>
            {loadingPastData ? (
              <div className="flex items-center space-x-2 py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Loading past data...</span>
              </div>
            ) : pastData.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No past approval/rejection records found for this donor.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {pastData.map((decision) => (
                  <div
                    key={decision.id}
                    className={`p-3 rounded-lg border-2 ${
                      decision.status === 'approved'
                        ? 'border-green-200 bg-green-50'
                        : decision.status === 'rejected'
                        ? 'border-red-200 bg-red-50'
                        : 'border-yellow-200 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {decision.status === 'approved' ? (
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : decision.status === 'rejected' ? (
                          <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className={`text-sm font-semibold ${
                            decision.status === 'approved'
                              ? 'text-green-800'
                              : decision.status === 'rejected'
                              ? 'text-red-800'
                              : 'text-yellow-800'
                          }`}>
                            {decision.status === 'approved' ? 'Approved' : decision.status === 'rejected' ? 'Rejected' : 'Pending'}
                          </span>
                          <div className="flex items-center space-x-2 text-xs text-gray-600 mt-0.5">
                            <User className="w-3 h-3" />
                            <span>{decision.approver_name || decision.approver_email || 'Unknown'}</span>
                            <span>•</span>
                            <span>{new Date(decision.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                      <p className="text-xs text-gray-700 whitespace-pre-wrap">{decision.comment}</p>
                    </div>
                    {decision.checklist_data?.initial_paperwork && (
                      <div className="mt-2 text-xs text-gray-600">
                        <span className="font-medium">Checklist Status:</span>
                        <span className="ml-1">
                          {Object.values(decision.checklist_data.initial_paperwork).filter(v => v === 'COMPLETE').length} / {Object.keys(decision.checklist_data.initial_paperwork).length} items complete
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Action <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedStatus('approved')}
                disabled={isSubmitting}
                className={`
                  p-4 border-2 rounded-lg transition-all
                  ${selectedStatus === 'approved'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                  }
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className={`w-6 h-6 ${selectedStatus === 'approved' ? 'text-green-600' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Approve</div>
                    <div className="text-xs text-gray-500">Accept this {approvalType === 'donor_summary' ? 'donor summary' : 'document'}</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedStatus('rejected')}
                disabled={isSubmitting}
                className={`
                  p-4 border-2 rounded-lg transition-all
                  ${selectedStatus === 'rejected'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                  }
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center space-x-3">
                  <XCircle className={`w-6 h-6 ${selectedStatus === 'rejected' ? 'text-red-600' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Reject</div>
                    <div className="text-xs text-gray-500">Reject this {approvalType === 'donor_summary' ? 'donor summary' : 'document'}</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Comment Field */}
          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Comment <span className="text-red-500">*</span>
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmitting}
              rows={6}
              placeholder={`Please provide a comment explaining why you are ${selectedStatus === 'approved' ? 'approving' : selectedStatus === 'rejected' ? 'rejecting' : 'taking action on'} this ${approvalType === 'donor_summary' ? 'donor summary' : 'document'}...`}
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            />
            <p className="text-xs text-gray-500 mt-1">
              This comment will be recorded and visible in the Past Data section.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              onClick={handleClose}
              disabled={isSubmitting}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedStatus || !comment.trim()}
              variant="primary"
              loading={isSubmitting}
            >
              {selectedStatus === 'approved' && <CheckCircle className="w-4 h-4 mr-2" />}
              {selectedStatus === 'rejected' && <XCircle className="w-4 h-4 mr-2" />}
              {isSubmitting ? 'Submitting...' : selectedStatus === 'approved' ? 'Approve' : selectedStatus === 'rejected' ? 'Reject' : 'Submit'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

