// Application constants
export const APP_CONFIG = {
  NAME: 'DonorIQ',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-Powered Tissue & Organ Quality Assessment Platform'
} as const;

// API configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  DOC_UPLOADER: 'doc_uploader',
  MEDICAL_DIRECTOR: 'medical_director'
} as const;

// Gender options
export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' }
] as const;

// Document types
export const DOCUMENT_TYPES = [
  'Medical History',
  'Serology Report',
  'Laboratory Results',
  'Recovery Cultures',
  'Consent Form',
  'Death Certificate'
] as const;

// File upload configuration
export const FILE_CONFIG = {
  MAX_SIZE_MB: 100,
  ALLOWED_TYPES: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'],
  MAX_SIZE_BYTES: 100 * 1024 * 1024 // 100MB
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
} as const;

// Routes
export const ROUTES = {
  LOGIN: '/login',
  ADMIN: '/admin',
  DONORS: '/donors',
  QUEUE: '/queue',
  UPLOAD: '/upload',
  INTELLIGENCE: '/intelligence',
  PROFILE: '/profile',
  SETTINGS: '/settings'
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_ROLE: 'userRole',
  USER_PREFERENCES: 'userPreferences'
} as const;
