import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

type AllowedRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

interface RoleRouteProps {
  children: React.ReactNode;
  roles: AllowedRole[];
}

const ROLE_HOME: Record<AllowedRole, string> = {
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
};

export function RoleRoute({ children, roles }: RoleRouteProps) {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/auth/login" replace />;

  if (!roles.includes(user.role as AllowedRole)) {
    // Redirect to their own dashboard
    return <Navigate to={ROLE_HOME[user.role as AllowedRole] ?? '/'} replace />;
  }

  return <>{children}</>;
}
