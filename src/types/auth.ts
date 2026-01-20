// Authentication types
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export type UserRole = 'admin' | 'doc_uploader' | 'medical_director';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

// User management types
export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

export interface UserUpdate {
  email?: string;
  full_name?: string;
  role?: UserRole;
  is_active?: boolean;
  password?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// API Response types
export interface ApiError {
  error: string;
  message: string;
  status_code: number;
}

export interface ValidationError {
  error: string;
  message: string;
  details: Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
}
