import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { ReactNode } from 'react';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export const RoleProtectedRoute = ({
  children,
  allowedRoles,
  redirectTo = '/dashboard',
}: RoleProtectedRouteProps) => {
  const { isAuthenticated, isLoading, roles } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasRole = roles.some((r) => allowedRoles.includes(r));
  if (!hasRole) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};


