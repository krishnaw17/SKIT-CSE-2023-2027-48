import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut, BookOpen, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardHeader() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    queryClient.clear();
    clearAuth();
    navigate('/auth/login');
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand & Menu */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">R</div>
            <span className="font-heading font-bold text-xl tracking-tight hidden sm:block">RDIS</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            {user?.role === 'STUDENT' && (
              <>
                <Link to="/student" className="hover:text-primary transition-colors">Dashboard</Link>
                <Link to="/student/courses" className="hover:text-primary transition-colors">Courses</Link>
                <Link to="/student/assignments" className="hover:text-primary transition-colors">Assignments</Link>
                <Link to="/student/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link>
              </>
            )}
            {user?.role === 'TEACHER' && (
              <>
                <Link to="/teacher" className="hover:text-primary transition-colors">Dashboard</Link>
                <Link to="/teacher/courses" className="hover:text-primary transition-colors">Courses</Link>
                <Link to="/teacher/grading" className="hover:text-primary transition-colors">Grading</Link>
              </>
            )}
            {user?.role === 'ADMIN' && (
              <>
                <Link to="/admin" className="hover:text-primary transition-colors">Dashboard</Link>
                <Link to="/admin/users" className="hover:text-primary transition-colors">Users</Link>
                <Link to="/admin/classes" className="hover:text-primary transition-colors">Classes</Link>
              </>
            )}
          </nav>
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold">
                {user?.firstName || user?.lastName 
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
                  : (user?.role === 'ADMIN' ? 'Admin User' : 'User')}
              </span>
              <span className="text-xs text-slate-500 capitalize">{user?.role.toLowerCase()}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-700">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-5 h-5 text-slate-500" />
              )}
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-danger hover:bg-danger/10">
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Log out</span>
          </Button>
        </div>

      </div>
    </header>
  );
}
