import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { useTeacherDashboard } from '@/features/teacher/teacher.api';
import { PageLoader } from '@/components/common/PageLoader';
import { PerformanceChart } from '@/components/charts/PerformanceChart';
import { Users, BookOpen, Clock, TrendingUp, BarChart3, Medal } from 'lucide-react';
import clsx from 'clsx';

export default function AnalyticsPage() {
  const { data: dashboard, isLoading } = useTeacherDashboard();

  if (isLoading) return <PageLoader />;

  const stats = dashboard?.stats;
  
  const enrollmentData = dashboard?.chartData?.length ? dashboard.chartData : [];
  const classAvgData = dashboard?.classAverageData?.length ? dashboard.classAverageData : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardHeader />
      <div className="page-wrapper page-container py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
              <BarChart3 className="w-4 h-4" />
              Course Analytics
            </div>
            <h1 className="font-heading text-4xl font-bold tracking-tight">Performance Hub</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Track your students' progress and course engagement metrics.</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-24 h-24" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Students</p>
            <h3 className="text-3xl font-bold font-number">{stats?.studentsCount || 0}</h3>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <BookOpen className="w-24 h-24" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
              <BookOpen size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Active Courses</p>
            <h3 className="text-3xl font-bold font-number">{stats?.coursesCount || 0}</h3>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-24 h-24" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4">
              <TrendingUp size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Avg. Completion</p>
            <h3 className="text-3xl font-bold font-number">{stats?.avgCompletion || 0}%</h3>
          </div>

          <div className={clsx(
            "rounded-2xl p-6 border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group",
            stats?.pendingGrading && stats.pendingGrading > 0 
              ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50" 
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          )}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock className="w-24 h-24" />
            </div>
            <div className={clsx(
              "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
              stats?.pendingGrading && stats.pendingGrading > 0 
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-500" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            )}>
              <Clock size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pending Grading</p>
            <h3 className="text-3xl font-bold font-number">{stats?.pendingGrading || 0}</h3>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-lg">Enrollment Trends</h3>
            </div>
            <div className="p-4">
              <PerformanceChart 
                title=""
                data={enrollmentData}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Medal className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-lg">Class Average Score</h3>
            </div>
            <div className="p-4">
              <PerformanceChart 
                title=""
                data={classAvgData}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
