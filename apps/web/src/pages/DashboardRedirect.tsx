import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function DashboardRedirect() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user?.role === 'TEACHER') return <Navigate to="/teacher" replace />;
  return <Navigate to="/student" replace />;
}
