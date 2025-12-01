import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import Card from '../ui/Card';

interface EligibilityFactor {
  name: string;
  currentValue: string;
  requirement: string;
  impact: number;
  positiveImpact: boolean;
}

interface TissueEligibility {
  id: string;
  name: string;
  category: 'Musculoskeletal' | 'Integumentary';
  status: 'Eligible' | 'Ineligible' | 'Review Required';
  confidenceScore: number;
  factors: EligibilityFactor[];
  similarCases?: {
    count: number;
    successRate: number;
    trend: 'Improving' | 'Stable' | 'Declining';
  } | null;
  description?: string;
}

interface TissueEligibilityAnalysisProps {
  eligibilityData?: TissueEligibility[];
}

export default function TissueEligibilityAnalysis({ eligibilityData }: TissueEligibilityAnalysisProps) {
  // Only use backend data - no fallback to mock data
  const tissueEligibility: TissueEligibility[] = eligibilityData && eligibilityData.length > 0 
    ? eligibilityData.map((item: TissueEligibility) => ({
        id: item.id || '',
        name: item.name || '-',
        category: item.category || 'Musculoskeletal',
        status: item.status || 'Review Required',
        confidenceScore: item.confidenceScore || 0,
        factors: item.factors || [],
        similarCases: item.similarCases || null,
        description: item.description || ''
      }))
    : [];
  
  const [selectedTissue, setSelectedTissue] = useState<TissueEligibility | null>(tissueEligibility[0] || null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Eligible':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Ineligible':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'Review Required':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Eligible':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Ineligible':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Review Required':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const summary = {
    total: tissueEligibility.length,
    eligible: tissueEligibility.filter(t => t.status === 'Eligible').length,
    reviewRequired: tissueEligibility.filter(t => t.status === 'Review Required').length,
    ineligible: tissueEligibility.filter(t => t.status === 'Ineligible').length,
  };

  // Show message if no data available
  if (!tissueEligibility || tissueEligibility.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Tissue Eligibility Analysis</h2>
            <p className="text-sm text-gray-500 mt-1">AI-powered eligibility assessment based on historical data</p>
          </div>
        </div>
        <Card className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No tissue eligibility data available</p>
            <p className="text-sm text-gray-400">Tissue eligibility analysis will appear here once processing is complete.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Tissue Eligibility Analysis</h2>
          <p className="text-sm text-gray-500 mt-1">AI-powered eligibility assessment based on historical data</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" />
            Refresh Analysis
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Summary and Tissue List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Box */}
          <Card className="p-6">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500">Total Tissues</div>
                <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Eligible</div>
                <div className="text-2xl font-bold text-green-600">{summary.eligible}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Review Required</div>
                <div className="text-2xl font-bold text-yellow-600">{summary.reviewRequired}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Ineligible</div>
                <div className="text-2xl font-bold text-red-600">{summary.ineligible}</div>
              </div>
            </div>
          </Card>

          {/* Tissue List */}
          <div className="space-y-4">
            {tissueEligibility.map((tissue) => (
              <div
                key={tissue.id}
                onClick={() => setSelectedTissue(tissue)}
                className="cursor-pointer"
              >
                <Card
                  className={`p-4 transition-all ${
                    selectedTissue?.id === tissue.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(tissue.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{tissue.name}</h3>
                          <span className="text-xs text-gray-500">({tissue.category})</span>
                        </div>
                        <div className="mt-1 flex items-center gap-4">
                          <span className="text-xs text-gray-500">
                            Confidence Score: <span className="font-semibold">{tissue.confidenceScore}%</span>
                          </span>
                        </div>
                        {tissue.factors && tissue.factors.length > 0 && (
                          <div className="mt-2 text-xs text-gray-600">
                            Key factors: {tissue.factors.slice(0, 2).map(f => f.name || '-').join(', ')}
                            {tissue.factors.length > 2 && ` and +${tissue.factors.length - 2} more factors`}
                          </div>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(tissue.status)}`}
                    >
                      {tissue.status}
                    </span>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Tissue Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tissue Summary</h3>
            
            {selectedTissue ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedTissue.status)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{selectedTissue.name}</h4>
                        <p className="text-xs text-gray-500">{selectedTissue.category}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(selectedTissue.status)}`}
                    >
                      {selectedTissue.status}
                    </span>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Confidence Score:</span>
                      <span className="font-semibold text-gray-900">{selectedTissue.confidenceScore || '-'}</span>
                    </div>
                    {selectedTissue.similarCases && (
                      <>
                        {selectedTissue.similarCases.count !== undefined && selectedTissue.similarCases.count > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Similar Cases:</span>
                            <span className="font-semibold text-gray-900">{selectedTissue.similarCases.count}</span>
                          </div>
                        )}
                        {selectedTissue.similarCases.successRate !== undefined && selectedTissue.similarCases.successRate > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Success Rate:</span>
                            <span className="font-semibold text-green-600">
                              {selectedTissue.similarCases.successRate}%
                            </span>
                          </div>
                        )}
                        {selectedTissue.similarCases.trend && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Trend:</span>
                            <span className="font-semibold text-gray-900">{selectedTissue.similarCases.trend}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* Factors Section */}
                    {selectedTissue.factors && selectedTissue.factors.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-semibold text-gray-900 mb-3">Eligibility Factors</h5>
                        <div className="space-y-2">
                          {selectedTissue.factors.map((factor, idx) => (
                            <div key={idx} className={`p-2 rounded ${
                              factor.positiveImpact ? 'bg-green-50' : 'bg-red-50'
                            }`}>
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="text-xs font-medium text-gray-900">{factor.name || '-'}</div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    Current: {factor.currentValue || '-'} | Required: {factor.requirement || '-'}
                                  </div>
                                </div>
                                <div className={`text-xs font-semibold ml-2 ${
                                  factor.positiveImpact ? 'text-green-700' : 'text-red-700'
                                }`}>
                                  {factor.impact > 0 ? '+' : ''}{factor.impact}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedTissue.description && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">Summary</h5>
                        <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                          {selectedTissue.description}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Select a tissue from the list to view its summary</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

