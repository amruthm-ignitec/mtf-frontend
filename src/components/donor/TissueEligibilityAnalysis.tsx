import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, TrendingUp, RefreshCw, Download } from 'lucide-react';
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
  similarCases: {
    count: number;
    successRate: number;
    trend: 'Improving' | 'Stable' | 'Declining';
  };
  description?: string;
}

interface TissueEligibilityAnalysisProps {
  eligibilityData?: TissueEligibility[];
}

// POC: Only Femur and Skin & Soft Tissue
const mockTissueEligibility: TissueEligibility[] = [
  {
    id: 'ms1',
    name: 'Femur',
    category: 'Musculoskeletal',
    status: 'Eligible',
    confidenceScore: 87,
    factors: [
      {
        name: 'Donor Age',
        currentValue: '42',
        requirement: '≤ 70 years',
        impact: 20,
        positiveImpact: true,
      },
      {
        name: 'No Bone Disease',
        currentValue: 'Yes',
        requirement: 'Required',
        impact: 25,
        positiveImpact: true,
      },
      {
        name: 'Bone Density',
        currentValue: 'Normal (T-score: +0.2)',
        requirement: 'T-score > -1.0',
        impact: 30,
        positiveImpact: true,
      },
      {
        name: 'Recovery Time',
        currentValue: '6 hours',
        requirement: '≤ 24 hours',
        impact: 15,
        positiveImpact: true,
      },
      {
        name: 'No Trauma',
        currentValue: 'No fractures',
        requirement: 'No recent trauma',
        impact: 10,
        positiveImpact: true,
      },
    ],
    similarCases: {
      count: 245,
      successRate: 92,
      trend: 'Improving',
    },
    description: 'The femur bone demonstrates exceptional structural integrity with normal bone density measurements. Comprehensive radiographic analysis reveals no evidence of disease, trauma, or pathological conditions that would compromise transplantation suitability. The bone exhibits optimal characteristics including proper cortical thickness, adequate medullary cavity dimensions, and absence of any fractures or deformities. All pre-transplantation screening criteria have been met, confirming this tissue as highly suitable for transplantation procedures.\n\nThe bone structure analysis reveals a T-score of +0.2, which indicates healthy bone density well above the minimum threshold requirement of -1.0. This positive T-score suggests excellent bone mineral density and structural strength. The donor age of 42 years falls well within the optimal range for bone tissue donation, significantly below the maximum age limit of 70 years. Comprehensive review of medical records confirms no history of bone-related diseases such as osteoporosis, osteomalacia, or metabolic bone disorders. Additionally, there is no documented evidence of recent trauma, fractures, or surgical interventions that could affect bone quality or integrity.\n\nRecovery procedures were completed within 6 hours post-mortem, which is significantly under the 24-hour maximum requirement for bone tissue recovery. This rapid recovery time is critical for maintaining tissue viability and minimizing cellular degradation. The recovery process followed all standard protocols, including proper aseptic techniques and immediate placement in appropriate storage conditions. The combination of timely recovery, optimal storage conditions, and excellent initial tissue quality ensures maximum viability for transplantation. Historical data analysis from 245 similar cases in our database shows a 92% success rate for femur bone transplants, with an improving trend observed over recent years. This high success rate, combined with the favorable characteristics of this particular tissue, provides strong confidence in positive transplantation outcomes.',
  },
  {
    id: 'skin1',
    name: 'Skin & Soft Tissue',
    category: 'Integumentary',
    status: 'Review Required',
    confidenceScore: 74,
    factors: [
      {
        name: 'Donor Age',
        currentValue: '42',
        requirement: '≤ 70 years',
        impact: 15,
        positiveImpact: true,
      },
      {
        name: 'Skin Condition',
        currentValue: 'Minor scarring present',
        requirement: 'No significant lesions',
        impact: 25,
        positiveImpact: false,
      },
      {
        name: 'Recovery Site',
        currentValue: 'Posterior trunk',
        requirement: 'Optimal harvest area',
        impact: 20,
        positiveImpact: true,
      },
      {
        name: 'Recovery Time',
        currentValue: '6 hours',
        requirement: '≤ 12 hours',
        impact: 20,
        positiveImpact: true,
      },
      {
        name: 'Tissue Viability',
        currentValue: 'Good vascularity',
        requirement: 'Adequate blood supply',
        impact: 20,
        positiveImpact: true,
      },
    ],
    similarCases: {
      count: 178,
      successRate: 85,
      trend: 'Stable',
    },
    description: 'Skin tissue shows good viability but minor scarring noted. Requires medical director review for final eligibility determination.\n\nThe harvested skin tissue from the posterior trunk demonstrates good vascularity and overall tissue health. However, minor scarring has been identified during the initial assessment, which requires further evaluation by the medical director to determine if it impacts transplantation suitability.\n\nRecovery was completed within 6 hours, meeting the optimal 12-hour window for skin tissue. The recovery site location (posterior trunk) is considered an optimal harvest area. Historical analysis of 178 similar cases shows an 85% success rate with a stable trend. The combination of good tissue viability and timely recovery are positive factors, but the scarring concern necessitates professional review before final approval.',
  },
];

export default function TissueEligibilityAnalysis({ eligibilityData }: TissueEligibilityAnalysisProps) {
  // Use eligibilityData if available, otherwise fall back to mock data
  const tissueEligibility: TissueEligibility[] = eligibilityData && eligibilityData.length > 0 
    ? eligibilityData.map((item: any) => ({
        id: item.id || '',
        name: item.name || '-',
        category: item.category || 'Musculoskeletal',
        status: item.status || 'Review Required',
        confidenceScore: item.confidenceScore || 0,
        factors: item.factors || [],
        similarCases: item.similarCases || { count: 0, successRate: 0, trend: 'Stable' },
        description: item.description || ''
      }))
    : mockTissueEligibility;
  
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

  const getTrendIcon = (trend: string) => {
    if (trend === 'Improving') {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    }
    return null;
  };

  const summary = {
    total: tissueEligibility.length,
    eligible: tissueEligibility.filter(t => t.status === 'Eligible').length,
    reviewRequired: tissueEligibility.filter(t => t.status === 'Review Required').length,
    ineligible: tissueEligibility.filter(t => t.status === 'Ineligible').length,
  };

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
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Similar Cases:</span>
                          <span className="font-semibold text-gray-900">{selectedTissue.similarCases.count || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Success Rate:</span>
                          <span className="font-semibold text-green-600">
                            {selectedTissue.similarCases.successRate ? `${selectedTissue.similarCases.successRate}%` : '-'}
                          </span>
                        </div>
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

