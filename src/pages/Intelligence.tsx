import React, { useState } from 'react';
import { Brain, ChevronRight, TrendingUp, Scale, MessageSquare, ChevronDown, ChevronUp, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { mockTissueAnalysis } from '../mocks/tissue-analysis-data';
import { mockCVAnalysis } from '../mocks/cv-analysis-data';
import { mockSkinAnalysis } from '../mocks/skin-analysis-data';
import { mockEyeAnalysis } from '../mocks/eye-analysis-data';
import { mockComparativeAnalysis, mockDecisionSupport, mockReviewNotes } from '../mocks/intelligence-data';
import { TissueAnalysis, CVTissueAnalysis, SkinTissueAnalysis, EyeTissueAnalysis } from '../types';

type TissueType = 'MS' | 'CV' | 'Skin' | 'Eyes';

export default function Intelligence() {
  const [selectedTissueType, setSelectedTissueType] = useState<TissueType>('MS');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    quickView: true,
    analysis: true,
    decision: true,
    notes: true
  });

  const getCurrentTissueData = () => {
    switch (selectedTissueType) {
      case 'MS':
        return mockTissueAnalysis;
      case 'CV':
        return mockCVAnalysis;
      case 'Skin':
        return mockSkinAnalysis;
      case 'Eyes':
        return mockEyeAnalysis;
      default:
        return [];
    }
  };

  // Quick View Data
  const quickViewStats = {
    totalTissues: getCurrentTissueData().length,
    eligible: getCurrentTissueData().filter(t => t.status === 'Eligible').length,
    review: getCurrentTissueData().filter(t => t.status === 'Review Required').length,
    ineligible: getCurrentTissueData().filter(t => t.status === 'Ineligible').length,
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Eligible':
        return 'bg-green-100 text-green-800';
      case 'Ineligible':
        return 'bg-red-100 text-red-800';
      case 'Review Required':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderTissueSpecificDetails = (tissue: TissueAnalysis) => {
    switch (selectedTissueType) {
      case 'CV':
        const cvTissue = tissue as CVTissueAnalysis;
        return cvTissue.measurements && (
          <div className="mt-2 grid grid-cols-2 gap-4 bg-blue-50 p-3 rounded-lg">
            <div>
              <span className="text-sm text-gray-500">Size:</span>
              <span className="ml-2 font-medium">{cvTissue.measurements.size}</span>
            </div>
            {cvTissue.measurements.length && (
              <div>
                <span className="text-sm text-gray-500">Length:</span>
                <span className="ml-2 font-medium">{cvTissue.measurements.length}</span>
              </div>
            )}
          </div>
        );

      case 'Skin':
        const skinTissue = tissue as SkinTissueAnalysis;
        return skinTissue.dimensions && (
          <div className="mt-2 grid grid-cols-2 gap-4 bg-green-50 p-3 rounded-lg">
            <div>
              <span className="text-sm text-gray-500">Dimensions:</span>
              <span className="ml-2 font-medium">
                {skinTissue.dimensions.length} x {skinTissue.dimensions.width}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Location:</span>
              <span className="ml-2 font-medium">{skinTissue.location}</span>
            </div>
          </div>
        );

      case 'Eyes':
        const eyeTissue = tissue as EyeTissueAnalysis;
        return eyeTissue.cornealProperties && (
          <div className="mt-2 grid grid-cols-2 gap-4 bg-purple-50 p-3 rounded-lg">
            <div>
              <span className="text-sm text-gray-500">Cell Count:</span>
              <span className="ml-2 font-medium">
                {eyeTissue.cornealProperties.endothelialCellCount} cells/mm²
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Clarity:</span>
              <span className="ml-2 font-medium">{eyeTissue.cornealProperties.clarity}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderDecisionSupport = (tissueId: string) => {
    const decision = mockDecisionSupport[tissueId];
    if (!decision) return null;

    return (
      <div className="mt-4 bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium flex items-center">
            <Scale className="w-4 h-4 mr-2 text-blue-600" />
            Decision Support
          </h4>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            decision.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
            decision.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {decision.riskLevel} Risk
          </span>
        </div>
        <div className="text-sm space-y-2">
          {decision.keyFactors.map((factor, index) => (
            <div key={index} className="flex justify-between">
              <span className={
                factor.impact === 'positive' ? 'text-green-700' :
                factor.impact === 'negative' ? 'text-red-700' :
                'text-gray-700'
              }>
                {factor.factor}
              </span>
              <span className="font-medium">{(factor.weight * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderComparativeAnalysis = (tissueId: string) => {
    const analysis = mockComparativeAnalysis[tissueId];
    if (!analysis) return null;

    return (
      <div className="mt-4 border-t pt-4">
        <h4 className="font-medium flex items-center mb-3">
          <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
          Comparative Analysis
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-500">Historical Average</div>
            <div className="font-medium">{(analysis.historicalAverage * 100).toFixed(0)}%</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-500">Last Month Success</div>
            <div className="font-medium">{(analysis.lastMonth.successRate * 100).toFixed(0)}%</div>
            <div className="text-xs text-gray-400">{analysis.lastMonth.totalCases} cases</div>
          </div>
        </div>
      </div>
    );
  };

  const renderReviewNotes = () => (
    <div className="mt-4 border-t pt-4">
      <h4 className="font-medium flex items-center mb-3">
        <MessageSquare className="w-4 h-4 mr-2 text-purple-600" />
        Review Notes
      </h4>
      <div className="space-y-3">
        {mockReviewNotes.map(note => (
          <div key={note.id} className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between items-start">
              <span className="font-medium text-sm">{note.userName}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                note.priority === 'High' ? 'bg-red-100 text-red-800' :
                note.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {note.priority}
              </span>
            </div>
            <p className="text-sm mt-1">{note.content}</p>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>{new Date(note.timestamp).toLocaleString()}</span>
              <span className={`${
                note.status === 'Open' ? 'text-blue-600' : 'text-green-600'
              }`}>
                {note.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Add this type guard function
  const isCVTissue = (tissue: TissueAnalysis): tissue is CVTissueAnalysis => {
    return 'tissueType' in tissue && tissue.tissueType === 'CV';
  };

  // Update the getReadyForTransplantTissues function
  const getReadyForTransplantTissues = () => {
    const allTissues = [
      ...mockTissueAnalysis,
      ...mockCVAnalysis,
      ...mockSkinAnalysis,
      ...mockEyeAnalysis
    ];
    
    return allTissues
      .filter(tissue => 
        tissue.status === 'Eligible' && 
        tissue.probabilityScore >= 0.9
      )
      .sort((a, b) => b.probabilityScore - a.probabilityScore);
  };

  const getReviewRequiredTissues = () => {
    const allTissues = [
      ...mockTissueAnalysis,
      ...mockCVAnalysis,
      ...mockSkinAnalysis,
      ...mockEyeAnalysis
    ];
    
    return allTissues
      .filter(tissue => tissue.status === 'Review Required')
      .sort((a, b) => b.probabilityScore - a.probabilityScore);
  };

  const getIneligibleTissues = () => {
    const allTissues = [
      ...mockTissueAnalysis,
      ...mockCVAnalysis,
      ...mockSkinAnalysis,
      ...mockEyeAnalysis
    ];
    
    return allTissues
      .filter(tissue => tissue.status === 'Ineligible')
      .sort((a, b) => b.probabilityScore - a.probabilityScore);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Ready for Transplant Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold flex items-center">
            <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
            Ready for Transplant
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getReadyForTransplantTissues().map((tissue) => (
            <div key={tissue.id} className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {tissue.name} {tissue.side && `(${tissue.side})`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {isCVTissue(tissue) ? tissue.tissueType : 'MS'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {(tissue.probabilityScore * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">Probability</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Required Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2 text-yellow-500" />
            Review Required
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getReviewRequiredTissues().map((tissue) => (
            <div key={tissue.id} className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {tissue.name} {tissue.side && `(${tissue.side})`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {isCVTissue(tissue) ? tissue.tissueType : 'MS'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-yellow-600">
                    {(tissue.probabilityScore * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">Probability</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ineligible Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold flex items-center">
            <XCircle className="w-6 h-6 mr-2 text-red-500" />
            Ineligible
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getIneligibleTissues().map((tissue) => (
            <div key={tissue.id} className="bg-red-50 p-4 rounded-lg border border-red-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {tissue.name} {tissue.side && `(${tissue.side})`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {isCVTissue(tissue) ? tissue.tissueType : 'MS'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">
                    {(tissue.probabilityScore * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">Probability</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick View Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold flex items-center">
            <Brain className="w-6 h-6 mr-2 text-blue-500" />
            Quick View
          </h2>
          <button 
            onClick={() => toggleSection('quickView')}
            className="text-gray-400 hover:text-gray-600"
          >
            {expandedSections.quickView ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        {expandedSections.quickView && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Tissues</p>
                  <p className="text-lg font-semibold">{quickViewStats.totalTissues}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Eligible</p>
                  <p className="text-lg font-semibold">{quickViewStats.eligible}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Review Required</p>
                  <p className="text-lg font-semibold">{quickViewStats.review}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <MessageSquare className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ineligible</p>
                  <p className="text-lg font-semibold">{quickViewStats.ineligible}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Analysis Section */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Tissue type selector */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-semibold flex items-center">
            <Brain className="w-6 h-6 mr-2 text-blue-500" />
            Tissue Analysis
          </h2>
          
          <div className="flex space-x-2">
            {(['MS', 'CV', 'Skin', 'Eyes'] as TissueType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedTissueType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${selectedTissueType === type 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Tissue Cards with Collapsible Sections */}
        <div className="space-y-6">
          {getCurrentTissueData().map((tissue) => (
            <div key={tissue.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-medium">
                    {tissue.name} {tissue.side && `(${tissue.side})`}
                  </h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(tissue.status)}`}>
                    {tissue.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {(tissue.probabilityScore * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-500">Probability Score</div>
                </div>
              </div>

              {renderTissueSpecificDetails(tissue)}

              <div className="space-y-4 mt-4">
                {expandedSections.analysis && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-medium text-gray-500">Contributing Factors</h4>
                      <button onClick={() => toggleSection('analysis')}>
                        {expandedSections.analysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {tissue.factors.map((factor, index) => (
                        <div key={index} className="flex justify-between items-start bg-gray-50 p-2 rounded">
                          <div>
                            <div className={`font-medium ${getImpactColor(factor.impact)}`}>
                              {factor.name}
                            </div>
                            <div className="text-xs text-gray-600">{factor.description}</div>
                          </div>
                          <div className="text-sm font-medium">
                            {(factor.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Similar Cases */}
                {tissue.similarCases && (
                  <div className="border-t pt-4">
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Similar Cases</h4>
                    <div className="flex justify-between text-sm">
                      <span>Based on {tissue.similarCases.count} similar cases</span>
                      <span className="font-medium">
                        Success Rate: {(tissue.similarCases.successRate * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {renderDecisionSupport(tissue.id)}
              {renderComparativeAnalysis(tissue.id)}
              {renderReviewNotes()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 