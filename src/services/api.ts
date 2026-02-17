// API service for authentication and donor management
import { LoginRequest, LoginResponse, User, UserCreate, UserUpdate, ApiError } from '../types/auth';
import { DonorCreate, DonorUpdate, DonorResponse } from '../types/donor';
import { ExtractionDataResponse } from '../types/extraction';
import { DonorApprovalCreate, DonorApprovalResponse, PastDataResponse } from '../types/donorApproval';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/** Backend list donor item (GET /donors/) */
export interface DonorListItem {
  id: string;
  external_id: string;
  name?: string;
  age?: number | null;
  eligibility_status: string;
  flags: string[];
}

/** Backend donor detail (GET /donors/{id}) */
export interface DonorDetailResponse {
  id: string;
  external_id: string;
  merged_data: Record<string, unknown> | null;
  eligibility_status: string;
  flags: string[];
}

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
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };
    if (config.body instanceof FormData) {
      delete (config.headers as Record<string, string>)['Content-Type'];
    } else if (typeof config.body === 'string' && !(config.headers as Record<string, string>)['Content-Type']) {
      (config.headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
          const errorData: ApiError = await response.json();
          message = errorData.message || message;
          if (response.status === 401 && message === 'Could not validate credentials') {
            this.removeToken();
            window.location.href = '/login';
          }
        } catch {
          const text = await response.text();
          if (text) message = text;
        }
        throw new Error(message);
      }

      if (response.status === 204) return undefined as T;
      return await response.json();
    } catch (error) {
      if (error instanceof Error) throw error;
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

  // Donor management methods (POC: id is string UUID)
  async getDonors(skip: number = 0, limit: number = 100): Promise<DonorResponse[]> {
    const list = await this.request<DonorListItem[]>(`/donors/?skip=${skip}&limit=${limit}`);
    return list.map((d) => ({
      id: d.id,
      unique_donor_id: d.external_id,
      name: d.name ?? `Donor ${d.external_id}`,
      age: d.age ?? undefined,
      gender: '',
      is_priority: false,
      created_at: '',
    }));
  }

  async getDonor(donorId: string): Promise<DonorDetailResponse> {
    return this.request<DonorDetailResponse>(`/donors/${donorId}`);
  }

  async createDonor(_donor: DonorCreate): Promise<DonorResponse> {
    throw new Error('Not available in POC');
  }

  async updateDonor(_donorId: string, _donor: DonorUpdate): Promise<DonorResponse> {
    throw new Error('Not available in POC');
  }

  async deleteDonor(_donorId: string): Promise<void> {
    throw new Error('Not available in POC');
  }

  async updateDonorPriority(_donorId: string, _isPriority: boolean): Promise<DonorResponse> {
    throw new Error('Not available in POC');
  }

  // Document management methods (POC: ids are string UUIDs)
  async getDonorDocuments(donorId: string): Promise<unknown[]> {
    return this.request<unknown[]>(`/documents/donor/${donorId}`);
  }

  async getDocumentStatus(documentId: string): Promise<unknown> {
    return this.request<unknown>(`/documents/${documentId}/status`);
  }

  getDocumentPdfUrl(documentId: string): string {
    return `${this.baseURL}/documents/${documentId}/pdf`;
  }

  async deleteDocument(documentId: string): Promise<void> {
    await this.request<void>(`/documents/${documentId}`, { method: 'DELETE' });
  }

  /** POC: Upload PDF; backend creates donor from filename. Returns document_id and donor_id (UUIDs). */
  async uploadDocument(file: File): Promise<{ document_id: string; donor_id: string; status: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.request<{ document_id: string; donor_id: string; status: string }>('/upload', {
      method: 'POST',
      body: form,
    });
  }

  // Extraction: map GET /donors/{id} (merged_data + eligibility_status + flags) to ExtractionDataResponse
  async getDonorExtractionData(donorId: string): Promise<ExtractionDataResponse> {
    const d = await this.getDonor(donorId);
    const merged = (d.merged_data || {}) as Record<string, unknown>;
    const identity = (merged.Identity || {}) as Record<string, unknown>;
    return {
      donor_id: d.external_id || d.id,
      case_id: d.id,
      processing_timestamp: new Date().toISOString(),
      processing_duration_seconds: 0,
      extracted_data: merged as any,
      eligibility: {
        musculoskeletal: {
          status: d.eligibility_status,
          blocking_criteria: (d.flags || []).map((f) => ({ criterion_name: f, reasoning: f })),
          md_discretion_criteria: [],
        },
      },
      criteria_evaluations: {},
    };
  }

  async getDonorEligibility(donorId: string): Promise<{
    donor_id: string;
    eligibility: { musculoskeletal?: { status: string; blocking_criteria: any[]; md_discretion_criteria: any[] }; skin?: { status: string; blocking_criteria: any[]; md_discretion_criteria: any[] } };
    criteria_evaluations: Record<string, any>;
  }> {
    const d = await this.getDonor(donorId);
    return {
      donor_id: d.id,
      eligibility: {
        musculoskeletal: { status: d.eligibility_status, blocking_criteria: (d.flags || []).map((f) => ({ criterion_name: f })), md_discretion_criteria: [] },
      },
      criteria_evaluations: {},
    };
  }

  async getQueueDetails(): Promise<any[]> {
    return this.request<any[]>('/donors/queue/details');
  }

  // POC stubs: User management
  async getUsers(): Promise<User[]> {
    return [];
  }

  async getUser(_userId: number): Promise<User> {
    throw new Error('Not available in POC');
  }

  async createUser(_userData: UserCreate): Promise<User> {
    throw new Error('Not available in POC');
  }

  async updateUser(_userId: number, _userData: UserUpdate): Promise<User> {
    throw new Error('Not available in POC');
  }

  async deleteUser(_userId: number): Promise<void> {
    throw new Error('Not available in POC');
  }

  async getSettings(): Promise<Record<string, string | null>> {
    return {};
  }

  async updateSettings(_settings: Record<string, string | null>): Promise<Record<string, string | null>> {
    return {};
  }

  async createDonorApproval(_approval: DonorApprovalCreate): Promise<DonorApprovalResponse> {
    throw new Error('Not available in POC');
  }

  async getDonorApprovals(_donorId: string): Promise<DonorApprovalResponse[]> {
    return [];
  }

  async getDonorPastData(_donorId: string): Promise<PastDataResponse> {
    return {} as PastDataResponse;
  }

  async getApproval(_approvalId: number): Promise<DonorApprovalResponse> {
    throw new Error('Not available in POC');
  }

  async getFeedbacks(): Promise<Array<{ id: number; username: string; feedback: string; created_at: string }>> {
    return [];
  }

  async createFeedback(_text: string): Promise<{ id: number; username: string; feedback: string; created_at: string }> {
    throw new Error('Not available in POC');
  }

  async getDonorFeedbacks(_donorId: string): Promise<Array<{ id: number; donor_id: number; username: string; feedback: string; created_at: string }>> {
    return [];
  }

  async createDonorFeedback(_donorId: string, _text: string): Promise<{ id: number; donor_id: number; username: string; feedback: string; created_at: string }> {
    throw new Error('Not available in POC');
  }
}

export const apiService = new ApiService();
