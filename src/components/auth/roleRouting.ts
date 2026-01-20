import { UserRole } from '../../types/auth';

export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/dashboard';
    case 'doc_uploader':
      return '/upload';
    case 'medical_director':
      return '/intelligence';
    default:
      return '/profile';
  }
}


