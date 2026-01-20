import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDefaultRouteForRole } from './roleRouting';

export default function RoleBasedRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
}


