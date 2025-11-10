import React from 'react';
import { ComplianceStatus, ValidationStatus } from '../../types/extraction';
import { CheckCircle, XCircle, AlertTriangle, FileCheck, ClipboardCheck } from 'lucide-react';
import Card from '../ui/Card';

interface ComplianceSectionProps {
  complianceStatus?: ComplianceStatus;
  validationStatus?: ValidationStatus;
}

export default function ComplianceSection({
  complianceStatus,
  validationStatus,
}: ComplianceSectionProps) {
  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  const getStatusColor = (status: boolean) => {
    return status
      ? 'bg-green-50 border-green-200 text-green-900'
      : 'bg-red-50 border-red-200 text-red-900';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Compliance & Validation</h2>

      {/* Compliance Status */}
      {complianceStatus && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Compliance Status</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-lg border ${getStatusColor(complianceStatus.aatb_compliant)}`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(complianceStatus.aatb_compliant)}
                <label className="text-sm font-medium">AATB Compliant</label>
              </div>
              <p className="text-sm">
                {complianceStatus.aatb_compliant ? 'Compliant' : 'Not Compliant'}
              </p>
            </div>
            <div
              className={`p-4 rounded-lg border ${getStatusColor(
                complianceStatus.all_required_documentation
              )}`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(complianceStatus.all_required_documentation)}
                <label className="text-sm font-medium">All Required Documentation</label>
              </div>
              <p className="text-sm">
                {complianceStatus.all_required_documentation ? 'Complete' : 'Incomplete'}
              </p>
            </div>
            <div
              className={`p-4 rounded-lg border ${getStatusColor(complianceStatus.tissue_viability)}`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(complianceStatus.tissue_viability)}
                <label className="text-sm font-medium">Tissue Viability</label>
              </div>
              <p className="text-sm">
                {complianceStatus.tissue_viability ? 'Viable' : 'Not Viable'}
              </p>
            </div>
            <div
              className={`p-4 rounded-lg border ${getStatusColor(
                complianceStatus.microbiological_clearance
              )}`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(complianceStatus.microbiological_clearance)}
                <label className="text-sm font-medium">Microbiological Clearance</label>
              </div>
              <p className="text-sm">
                {complianceStatus.microbiological_clearance ? 'Cleared' : 'Not Cleared'}
              </p>
            </div>
            <div
              className={`p-4 rounded-lg border ${getStatusColor(
                complianceStatus.authorization_valid
              )}`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(complianceStatus.authorization_valid)}
                <label className="text-sm font-medium">Authorization Valid</label>
              </div>
              <p className="text-sm">
                {complianceStatus.authorization_valid ? 'Valid' : 'Invalid'}
              </p>
            </div>
            <div
              className={`p-4 rounded-lg border ${getStatusColor(
                complianceStatus.ready_for_distribution
              )}`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(complianceStatus.ready_for_distribution)}
                <label className="text-sm font-medium">Ready for Distribution</label>
              </div>
              <p className="text-sm">
                {complianceStatus.ready_for_distribution ? 'Ready' : 'Not Ready'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Validation Checklist */}
      {validationStatus && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ClipboardCheck className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Validation Checklist</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    validationStatus.checklist_status.overall_status === 'COMPLETE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {validationStatus.checklist_status.overall_status}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Total Required</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {validationStatus.checklist_status.total_required_items}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Items Found</label>
                  <p className="text-lg font-semibold text-blue-600">
                    {validationStatus.checklist_status.total_items_found}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Items Complete</label>
                  <p className="text-lg font-semibold text-green-600">
                    {validationStatus.checklist_status.total_items_complete}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Completion</label>
                  <p className="text-lg font-semibold text-purple-600">
                    {validationStatus.checklist_status.completion_percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${validationStatus.checklist_status.completion_percentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

