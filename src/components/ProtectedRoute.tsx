import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/auth-context';

interface ProtectedRouteProperties {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProperties) {
  const { accessToken, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="auth-shell">
        <p className="muted">Đang tải phiên đăng nhập…</p>
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
