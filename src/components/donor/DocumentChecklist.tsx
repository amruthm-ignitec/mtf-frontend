import React, { useState } from 'react';
import { CheckCircle, XCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../ui/Card';

import { ExtractionDataResponse } from '../../types/extraction';

interface DocumentChecklistProps {
  documents: Array<{
    id: number;
    document_type: string;
    status: string;
  }>;
  extractionData?: ExtractionDataResponse;
}

export default function DocumentChecklist({ documents, extractionData }: DocumentChecklistProps) {
  const [showAllItems, setShowAllItems] = useState(false);
  // Helper function to check if a document type exists
  const hasDocument = (keywords: string[]): boolean => {
    return documents.some(doc => 
      keywords.some(keyword => 
        doc.document_type?.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  };

  // Initial Paperwork items
  const initialPaperwork = [
    {
      name: 'Donor Log-In Information Packet (Templates 195 & 196)',
      keywords: ['donor log-in', 'template 195', 'template 196', 'login packet', 'information packet']
    },
    {
      name: 'Donor Information',
      keywords: ['donor information', 'donor data', 'donor details']
    },
    {
      name: 'Donor Risk Assessment Interview (DRAI)',
      keywords: ['drai', 'risk assessment', 'donor risk assessment interview']
    },
    {
      name: 'Physical Assessment',
      keywords: ['physical assessment', 'physical exam', 'physical evaluation']
    },
    {
      name: 'Medical Records Review Summary',
      keywords: ['medical records review', 'records review summary', 'medical review']
    },
    {
      name: 'Tissue Recovery Information',
      keywords: ['tissue recovery', 'recovery information', 'tissue recovery info']
    },
    {
      name: 'Plasma Dilution',
      keywords: ['plasma dilution', 'plasma', 'dilution']
    },
    {
      name: 'Authorization for Tissue Donation',
      keywords: ['authorization', 'tissue donation', 'authorization form', 'consent']
    },
    {
      name: 'Infectious Disease Testing',
      keywords: ['infectious disease', 'disease testing', 'serology', 'infectious']
    },
    {
      name: 'Medical Records',
      keywords: ['medical records', 'medical history', 'clinical records', 'patient records']
    }
  ];

  // Conditional documents
  const conditionalDocuments = [
    {
      name: 'Autopsy report',
      condition: 'Autopsy Performed',
      extractionKey: 'autopsy_report'
    },
    {
      name: 'Toxicology report',
      condition: 'Toxicology Performed',
      extractionKey: 'toxicology_report'
    },
    {
      name: 'Skin Dermal Cultures',
      condition: 'Skin Recovery Performed',
      extractionKey: 'skin_dermal_cultures'
    },
    {
      name: 'Bioburden results',
      condition: 'Fresh Tissue Processed Performed',
      extractionKey: 'bioburden_results'
    }
  ];

  // Check conditional document status
  const getConditionalStatus = (extractionKey: string) => {
    if (!extractionData?.conditional_documents) return null;
    
    const conditionalDocs = extractionData.conditional_documents as any;
    let doc: any = null;
    
    if (extractionKey === 'autopsy_report') {
      doc = conditionalDocs.autopsy_report;
    } else if (extractionKey === 'toxicology_report') {
      doc = conditionalDocs.toxicology_report;
    } else if (extractionKey === 'skin_dermal_cultures') {
      // Handle both possible field names
      doc = conditionalDocs.skin_dermal_cultures || conditionalDocs.skinDermalCultures;
    } else if (extractionKey === 'bioburden_results') {
      doc = conditionalDocs.bioburden_results;
    }
    
    if (!doc) return null;
    
    // Check for conditional_status field
    const status = doc.conditional_status;
    if (status && typeof status === 'string') {
      return status.includes('CONDITION MET') ? 'met' : 'not_met';
    }
    
    return null;
  };

  return (
    <Card className="mb-6 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
          <FileText className="w-6 h-6 mr-2 text-blue-600" />
          Initial Paperwork Case Checklist
        </h2>
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
          <span className="font-medium">Case Type:</span>
          <span>Deceased donors</span>
        </div>
      </div>

      {/* Initial Paperwork Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Initial Paperwork</h3>
        <div className="space-y-3">
          {(showAllItems ? initialPaperwork : initialPaperwork.slice(0, 3)).map((item, index) => {
            const isPresent = hasDocument(item.keywords);
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                  isPresent
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {isPresent ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${isPresent ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                    {item.name}
                  </span>
                </div>
                {isPresent && (
                  <span className="text-xs text-green-700 font-medium">Present</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Conditional Documents Section - Only shown when expanded */}
        {showAllItems && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Conditional documents</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Document</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Condition</th>
                    <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {conditionalDocuments.map((item, index) => {
                    const conditionStatus = getConditionalStatus(item.extractionKey);
                    const hasDoc = hasDocument([item.name.toLowerCase()]);
                    
                    return (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-3 text-sm text-gray-900">{item.name}</td>
                        <td className="py-3 px-3 text-sm text-gray-600">{item.condition}</td>
                        <td className="py-3 px-3 text-center">
                          {conditionStatus === 'met' ? (
                            <span className="inline-flex items-center space-x-1 text-green-700">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs font-medium">Condition Met</span>
                            </span>
                          ) : conditionStatus === 'not_met' ? (
                            <span className="inline-flex items-center space-x-1 text-gray-500">
                              <XCircle className="w-4 h-4" />
                              <span className="text-xs">Not Required</span>
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {initialPaperwork.length > 3 && (
          <button
            onClick={() => setShowAllItems(!showAllItems)}
            className="mt-4 flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            {showAllItems ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Show less</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Show more</span>
              </>
            )}
          </button>
        )}
      </div>
    </Card>
  );
}

