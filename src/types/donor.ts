// Donor types matching the backend API (POC: id is UUID string)
export interface Donor extends Record<string, unknown> {
  id: string;
  unique_donor_id: string;
  name: string;
  age?: number;
  date_of_birth?: string; // ISO date string
  gender: string;
  is_priority: boolean;
  created_at: string;
  updated_at?: string;
}

export interface DonorCreate {
  unique_donor_id: string;
  name: string;
  age?: number;
  date_of_birth?: string;
  gender: string;
  is_priority: boolean;
}

export interface DonorUpdate {
  name?: string;
  age?: number;
  date_of_birth?: string;
  gender?: string;
  is_priority?: boolean;
}

export type DonorResponse = Donor;

// Gender options
export type Gender = 'Male' | 'Female' | 'Other';

// Priority levels
export type PriorityLevel = 'Normal' | 'High';

// Form validation
export interface DonorFormData {
  unique_donor_id: string;
  name: string;
  age?: number;
  date_of_birth?: string;
  gender: Gender;
  is_priority: boolean;
}

export interface DonorFormErrors {
  unique_donor_id?: string;
  name?: string;
  age?: string;
  date_of_birth?: string;
  gender?: string;
  is_priority?: string;
}