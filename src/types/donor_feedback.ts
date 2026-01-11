// Donor Feedback types matching the backend API
export interface DonorFeedback {
  id: number;
  donor_id: number;
  username: string;
  feedback: string;
  created_at: string;
}

export interface DonorFeedbackCreate {
  text: string;
}

