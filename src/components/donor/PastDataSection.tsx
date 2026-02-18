import React from 'react';
import { PastDataResponse } from '../../types/donorApproval';
import { CheckCircle, XCircle, Clock, History, User } from 'lucide-react';
import Card from '../ui/Card';

interface PastDataSectionProps {
  data: PastDataResponse | null;
  loading: boolean;
}

export default function PastDataSection({ data, loading }: PastDataSectionProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Loading past data...</span>
        </div>
      </Card>
    );
  }

  if (!data || !Array.isArray(data.past_decisions) || data.past_decisions.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <History className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Past Data</h3>
        </div>
        <p className="text-sm text-gray-500">No past approval/rejection records found for this donor.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Past Data</h3>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>{data.total_approved} Approved</span>
          </div>
          <div className="flex items-center space-x-1 text-red-600">
            <XCircle className="w-4 h-4" />
            <span>{data.total_rejected} Rejected</span>
          </div>
          {data.total_pending > 0 && (
            <div className="flex items-center space-x-1 text-yellow-600">
              <Clock className="w-4 h-4" />
              <span>{data.total_pending} Pending</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {data.past_decisions.map((decision) => (
          <div
            key={decision.id}
            className={`border-2 rounded-lg p-4 ${
              decision.status === 'approved'
                ? 'border-green-200 bg-green-50'
                : decision.status === 'rejected'
                ? 'border-red-200 bg-red-50'
                : 'border-yellow-200 bg-yellow-50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                {decision.status === 'approved' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : decision.status === 'rejected' ? (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold ${
                      decision.status === 'approved'
                        ? 'text-green-800'
                        : decision.status === 'rejected'
                        ? 'text-red-800'
                        : 'text-yellow-800'
                    }`}>
                      {decision.status === 'approved' ? 'Approved' : decision.status === 'rejected' ? 'Rejected' : 'Pending'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {decision.approval_type === 'donor_summary' ? 'Donor Summary' : 'Document'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                    <User className="w-3 h-3" />
                    <span>{decision.approver_name || decision.approver_email || '-'}</span>
                    <span>•</span>
                    <span>{new Date(decision.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comment */}
            <div className="mt-3 p-3 bg-white rounded border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{decision.comment}</p>
            </div>

            {/* Checklist Data */}
            {decision.checklist_data && (
              <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Checklist Status at Time of Decision:</h4>
                {decision.checklist_data.initial_paperwork && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-600 mb-1">Initial Paperwork:</div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {Object.entries(decision.checklist_data.initial_paperwork).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                          <span className={`font-medium ${
                            value === 'COMPLETE' ? 'text-green-600' : 
                            value === 'INCOMPLETE' ? 'text-red-600' : 
                            'text-yellow-600'
                          }`}>
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {decision.checklist_data.conditional_documents && Object.keys(decision.checklist_data.conditional_documents).length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs font-medium text-gray-600 mb-1">Conditional Documents:</div>
                    <div className="text-xs text-gray-600">
                      {Object.keys(decision.checklist_data.conditional_documents).length} conditional document(s) evaluated
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}


