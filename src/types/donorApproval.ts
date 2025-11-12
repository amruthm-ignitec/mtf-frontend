export type ApprovalStatus = 'approved' | 'rejected' | 'pending';
export type ApprovalType = 'document' | 'donor_summary';

export interface DonorApprovalCreate {
  donor_id: number;
  document_id?: number | null;
  approval_type: ApprovalType;
  status: ApprovalStatus;
  comment: string;
  checklist_data?: Record<string, any> | null;
}

export interface DonorApprovalResponse {
  id: number;
  donor_id: number;
  document_id: number | null;
  approval_type: ApprovalType;
  status: ApprovalStatus;
  comment: string;
  checklist_data: Record<string, any> | null;
  approved_by: number;
  approver_name: string | null;
  approver_email: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface PastDataResponse {
  donor_id: number;
  past_decisions: DonorApprovalResponse[];
  total_approved: number;
  total_rejected: number;
  total_pending: number;
}


