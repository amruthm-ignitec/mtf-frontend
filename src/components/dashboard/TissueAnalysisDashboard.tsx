import React from 'react';
import type { DonorRecord } from '../../types';
import { TissueType } from '../../types/donor';

interface TissueAnalysisDashboardProps {
  donor: DonorRecord;
}

const calculateTissueAnalysis = (donor: DonorRecord) => {
  const tissueTypes = [
    TissueType.Cornea,
    TissueType.Heart,
    TissueType.Skin,
    TissueType.Bone,
    TissueType.Tendons,
    TissueType.Ligaments,
    TissueType.Veins,
    TissueType.Fascia
  ];
  
  return tissueTypes.map(tissueType => ({
    tissueType,
    probabilityPercentage: Math.random() * 100,
    isViable: Math.random() > 0.5,
    factors: [
      {
        name: 'Age',
        status: 'positive' as const,
        impact: 0.8,
        description: 'Age within acceptable range'
      }
    ]
  }));
};

const TissueAnalysisDashboard: React.FC<TissueAnalysisDashboardProps> = ({ donor }) => {
  const tissueAnalysis = calculateTissueAnalysis(donor);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Tissue Donation Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tissueAnalysis.map((analysis) => (
          <div key={analysis.tissueType} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{analysis.tissueType}</h3>
              <span
                className={`px-2 py-1 text-sm rounded-full ${
                  analysis.isViable
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {analysis.isViable ? 'Viable' : 'Not Viable'}
              </span>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Donation Probability</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    analysis.probabilityPercentage > 70 ? 'bg-green-600' : 'bg-yellow-400'
                  }`}
                  style={{ width: `${analysis.probabilityPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-right mt-1">
                {Math.round(analysis.probabilityPercentage)}%
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Key Factors:</p>
              <div className="flex flex-wrap gap-2">
                {analysis.factors.map((factor, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 text-sm rounded-full ${
                      factor.status === 'positive'
                        ? 'bg-green-100 text-green-800'
                        : factor.status === 'negative'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                    title={factor.description}
                  >
                    {factor.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TissueAnalysisDashboard; 