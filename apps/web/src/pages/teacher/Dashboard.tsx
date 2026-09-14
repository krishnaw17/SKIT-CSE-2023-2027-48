import { useTeacherDashboard } from '@/features/teacher/teacher.api';
import { PageLoader } from '@/components/common/PageLoader';
import { useAuthStore } from '@/stores/authStore';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Clock, BarChart3, AlertCircle } from 'lucide-react';
import { PerformanceChart } from '@/components/charts/PerformanceChart';
import clsx from 'clsx';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

export default function TeacherDashboardPage() {
  const { user } = useAuthStore();
  const { data: dashboard, isLoading } = useTeacherDashboard();

  if (isLoading) return <PageLoader />;

  const stats = dashboard?.stats;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardHeader />
      <div className="page-wrapper page-container py-8">
        <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">Welcome back, {user?.firstName}!</h1>
        <p className="text-slate-500">Here's an overview of your classes and students.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Active Courses</p>
            <h3 className="text-2xl font-bold font-number">{stats?.coursesCount || 0}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Students</p>
            <h3 className="text-2xl font-bold font-number">{stats?.studentsCount || 0}</h3>
          </div>
        </div>

        <div className={clsx(
          "bg-white dark:bg-slate-900 rounded-xl p-6 border shadow-sm flex items-center gap-4",
          stats?.pendingGrading && stats.pendingGrading > 0 
            ? "border-amber-200 dark:border-amber-900/50" 
            : "border-slate-200 dark:border-slate-800"
        )}>
          <div className={clsx(
            "w-12 h-12 rounded-full flex items-center justify-center",
            stats?.pendingGrading && stats.pendingGrading > 0 
              ? "bg-amber-50 dark:bg-amber-900/20 text-amber-500" 
              : "bg-slate-50 dark:bg-slate-800 text-slate-400"
          )}>
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Needs Grading</p>
            <h3 className="text-2xl font-bold font-number">{stats?.pendingGrading || 0}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link to="/teacher/courses" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors group">
              <BookOpen className="text-slate-400 group-hover:text-primary mb-2 transition-colors" />
              <span className="font-semibold text-sm">My Courses</span>
            </Link>
            
            <Link to="/teacher/grading" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors group">
              <AlertCircle className="text-slate-400 group-hover:text-primary mb-2 transition-colors" />
              <span className="font-semibold text-sm">Grading</span>
            </Link>



            <Link to="/teacher/analytics" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors group">
              <BarChart3 className="text-slate-400 group-hover:text-primary mb-2 transition-colors" />
              <span className="font-semibold text-sm">Analytics</span>
            </Link>
          </div>

          <PerformanceChart 
            title="Class Average Performance"
            data={dashboard?.classAverageData || []}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-heading font-semibold text-lg mb-4">Recent Quizzes</h3>
            <div className="space-y-4">
              {dashboard?.recentQuizzes?.length === 0 ? (
                <p className="text-sm text-slate-500">No quizzes created yet.</p>
              ) : (
                dashboard?.recentQuizzes?.map((quiz: any) => (
                  <div key={quiz.id} className="p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-slate-100 dark:border-slate-800">
                    <h4 className="font-semibold text-sm mb-1">{quiz.title}</h4>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{quiz._count.attempts} attempts</span>
                      <span className="text-primary font-medium">{quiz.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
