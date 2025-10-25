import { useQuery } from '@tanstack/react-query';
import { XCircle } from 'lucide-react';
import { DonorRecord, CriticalFinding } from '../../types';

// Mock function for demo purposes
const fetchDonor = async (id: string): Promise<DonorRecord> => {
  // This would be replaced with actual API call
  return Promise.resolve({
    id,
    donorName: 'Mock Donor',
    age: 45,
    gender: 'Male',
    causeOfDeath: 'Unknown',
    uploadTimestamp: new Date(),
    processingStatus: 'processing',
    status: 'processing',
    documents: [],
    findings: [],
    requiredDocuments: []
  } as DonorRecord);
};

// Mock function for demo purposes
const generateRejectionReport = async (donorId: string) => {
  console.log('Generating rejection report for donor:', donorId);
  // This would be replaced with actual report generation
};

// Helper function to check for critical findings
const hasCriticalFindings = (donor: DonorRecord | undefined): boolean => {
  return Boolean(donor?.criticalFindings && donor.criticalFindings.length > 0);
};

export const ScreeningWorkflow = ({ donorId }: { donorId: string }) => {
  const { data: donor } = useQuery({
    queryKey: ['donor', donorId],
    queryFn: () => fetchDonor(donorId),
  });

  if (!donor) {
    return <div>Loading...</div>;
  }

  if (hasCriticalFindings(donor)) {
    return (
      <div className="rounded-lg bg-red-50 p-4 border border-red-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Screening Automatically Halted
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Critical finding detected:</p>
              <ul className="list-disc list-inside mt-1">
                {donor.criticalFindings?.map((finding: CriticalFinding) => (
                  <li key={finding.type}>
                    {finding.type} detected in document {finding.source.documentId}
                    (Page {finding.source.pageNumber})
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-red-700 text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                onClick={() => generateRejectionReport(donorId)}
              >
                Generate Rejection Report
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Normal screening workflow content */}
      <p>Normal screening workflow would go here</p>
    </div>
  );
};

export default ScreeningWorkflow; 