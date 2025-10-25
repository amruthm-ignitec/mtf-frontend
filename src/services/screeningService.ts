import { CriticalFinding } from '../types';

// Define service function types
type RecordCriticalFinding = (donorId: string, finding: CriticalFinding) => Promise<void>;
type UpdateDonorStatus = (donorId: string, status: 'REJECTED') => Promise<void>;
type NotifyMedicalDirector = (params: {
  type: string;
  donorId: string;
  finding: CriticalFinding;
  timestamp: Date;
}) => Promise<void>;
type CreateAuditLog = (params: {
  action: string;
  reason: string;
  donorId: string;
  automated: boolean;
}) => Promise<void>;
type CancelPendingProcesses = (donorId: string) => Promise<void>;

// Mock implementations for demo purposes
const recordCriticalFinding: RecordCriticalFinding = async () => {
  // Mock implementation
};

const updateDonorStatus: UpdateDonorStatus = async () => {
  // Mock implementation
};

const notifyMedicalDirector: NotifyMedicalDirector = async () => {
  // Mock implementation
};

const createAuditLog: CreateAuditLog = async () => {
  // Mock implementation
};

const cancelPendingProcesses: CancelPendingProcesses = async () => {
  // Mock implementation
};

export const handleCriticalFinding = async (
  donorId: string, 
  finding: CriticalFinding
) => {
  try {
    // 1. Record the finding
    await recordCriticalFinding(donorId, finding);
    
    // 2. Automatically update donor status
    await updateDonorStatus(donorId, 'REJECTED');
    
    // 3. Generate notification for medical director
    await notifyMedicalDirector({
      type: 'CRITICAL_FINDING',
      donorId,
      finding,
      timestamp: new Date(),
    });
    
    // 4. Create audit log entry
    await createAuditLog({
      action: 'AUTOMATIC_REJECTION',
      reason: `Critical finding detected: ${finding.type}`,
      donorId,
      automated: true,
    });
    
    // 5. Cancel any pending processes
    await cancelPendingProcesses(donorId);
    
    return {
      status: 'REJECTED',
      reason: finding.type,
      timestamp: new Date(),
    };
  } catch (error) {
    // Handle errors and ensure proper logging
    console.error('Critical finding handling failed:', error);
    throw new Error('Failed to process critical finding');
  }
};

export {
  recordCriticalFinding,
  updateDonorStatus,
  notifyMedicalDirector,
  createAuditLog,
  cancelPendingProcesses
}; 