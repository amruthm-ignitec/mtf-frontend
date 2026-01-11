// API service for authentication and donor management
import { LoginRequest, LoginResponse, User, UserCreate, UserUpdate, ApiError } from '../types/auth';
import { DonorCreate, DonorUpdate, DonorResponse } from '../types/donor';
import { ExtractionDataResponse } from '../types/extraction';
import { DonorApprovalCreate, DonorApprovalResponse, PastDataResponse } from '../types/donorApproval';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        
        // If token is invalid, clear it from localStorage
        if (response.status === 401 && errorData.message === "Could not validate credentials") {
          this.removeToken();
          // Redirect to login page
          window.location.href = '/login';
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  removeToken(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
  }

  // Token validation
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  // Get user role from token
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch {
      return null;
    }
  }

  // Donor management methods
  async getDonors(skip: number = 0, limit: number = 100): Promise<DonorResponse[]> {
    return this.request<DonorResponse[]>(`/donors/?skip=${skip}&limit=${limit}`);
  }

  async getDonor(donorId: number): Promise<DonorResponse> {
    return this.request<DonorResponse>(`/donors/${donorId}`);
  }

  async createDonor(donor: DonorCreate): Promise<DonorResponse> {
    return this.request<DonorResponse>('/donors/', {
      method: 'POST',
      body: JSON.stringify(donor),
    });
  }

  async updateDonor(donorId: number, donor: DonorUpdate): Promise<DonorResponse> {
    return this.request<DonorResponse>(`/donors/${donorId}`, {
      method: 'PUT',
      body: JSON.stringify(donor),
    });
  }

  async deleteDonor(donorId: number): Promise<void> {
    return this.request<void>(`/donors/${donorId}`, {
      method: 'DELETE',
    });
  }

  async updateDonorPriority(donorId: number, isPriority: boolean): Promise<DonorResponse> {
    return this.request<DonorResponse>(`/donors/${donorId}/priority`, {
      method: 'PUT',
      body: JSON.stringify({ is_priority: isPriority }),
    });
  }

  // Document management methods
  async getDonorDocuments(donorId: number): Promise<unknown[]> {
    return this.request<unknown[]>(`/documents/donor/${donorId}`);
  }

  async getDocumentStatus(documentId: number): Promise<unknown> {
    return this.request<unknown>(`/documents/${documentId}/status`);
  }

  async getDocumentSasUrl(documentId: number, expiryMinutes: number = 30): Promise<{ sas_url: string; expiry_minutes: number; original_filename: string }> {
    return this.request<{ sas_url: string; expiry_minutes: number; original_filename: string }>(`/documents/${documentId}/sas-url?expiry_minutes=${expiryMinutes}`);
  }

  /**
   * Get the proxied PDF URL for a document.
   * This endpoint streams the PDF from Azure Blob Storage with proper CORS headers,
   * avoiding CORS issues when loading in PDF.js.
   */
  getDocumentPdfUrl(documentId: number): string {
    const token = localStorage.getItem('authToken');
    return `${this.baseURL}/documents/${documentId}/pdf`;
  }

  async deleteDocument(documentId: number): Promise<void> {
    return this.request<void>(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  // Extraction data methods
  async getDonorExtractionData(donorId: number): Promise<ExtractionDataResponse> {
    return this.request<ExtractionDataResponse>(`/donors/${donorId}/extraction-data`);
  }

  async getDonorEligibility(donorId: number): Promise<{
    donor_id: string;
    eligibility: {
      musculoskeletal?: {
        status: string;
        blocking_criteria: any[];
        md_discretion_criteria: any[];
        evaluated_at?: string;
      };
      skin?: {
        status: string;
        blocking_criteria: any[];
        md_discretion_criteria: any[];
        evaluated_at?: string;
      };
    };
    criteria_evaluations: Record<string, any>;
  }> {
    return this.request(`/donors/${donorId}/eligibility`);
  }

  async getQueueDetails(): Promise<any[]> {
    return this.request<any[]>('/donors/queue/details');
  }

  // User management methods (Admin only)
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async getUser(userId: number): Promise<User> {
    return this.request<User>(`/users/${userId}`);
  }

  async createUser(userData: UserCreate): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: number, userData: UserUpdate): Promise<User> {
    return this.request<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: number): Promise<void> {
    return this.request<void>(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Settings management methods (Admin only)
  async getSettings(): Promise<Record<string, string | null>> {
    return this.request<Record<string, string | null>>('/settings');
  }

  async updateSettings(settings: Record<string, string | null>): Promise<Record<string, string | null>> {
    return this.request<Record<string, string | null>>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Donor Approval/Rejection methods (Medical Director only)
  async createDonorApproval(approval: DonorApprovalCreate): Promise<DonorApprovalResponse> {
    return this.request<DonorApprovalResponse>('/donor-approvals/', {
      method: 'POST',
      body: JSON.stringify(approval),
    });
  }

  async getDonorApprovals(donorId: number): Promise<DonorApprovalResponse[]> {
    return this.request<DonorApprovalResponse[]>(`/donor-approvals/donor/${donorId}`);
  }

  async getDonorPastData(donorId: number): Promise<PastDataResponse> {
    return this.request<PastDataResponse>(`/donor-approvals/donor/${donorId}/past-data`);
  }

  async getApproval(approvalId: number): Promise<DonorApprovalResponse> {
    return this.request<DonorApprovalResponse>(`/donor-approvals/${approvalId}`);
  }

  // Platform Feedback methods
  async getFeedbacks(): Promise<Array<{ id: number; username: string; feedback: string; created_at: string }>> {
    return this.request<Array<{ id: number; username: string; feedback: string; created_at: string }>>('/feedback');
  }

  async createFeedback(text: string): Promise<{ id: number; username: string; feedback: string; created_at: string }> {
    return this.request<{ id: number; username: string; feedback: string; created_at: string }>('/feedback', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  // Donor Feedback methods
  async getDonorFeedbacks(donorId: number): Promise<Array<{ id: number; donor_id: number; username: string; feedback: string; created_at: string }>> {
    return this.request<Array<{ id: number; donor_id: number; username: string; feedback: string; created_at: string }>>(`/donors/${donorId}/feedback`);
  }

  async createDonorFeedback(donorId: number, text: string): Promise<{ id: number; donor_id: number; username: string; feedback: string; created_at: string }> {
    return this.request<{ id: number; donor_id: number; username: string; feedback: string; created_at: string }>(`/donors/${donorId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }
}

export const apiService = new ApiService();
