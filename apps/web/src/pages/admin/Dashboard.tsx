import { useAdminDashboard } from '@/features/admin/admin.api';
import { PageLoader } from '@/components/common/PageLoader';
import { useAuthStore } from '@/stores/authStore';
import { Link } from 'react-router-dom';
import { Users, BookOpen, GraduationCap, Server, Shield, Activity, Award } from 'lucide-react';
import { PerformanceChart } from '@/components/charts/PerformanceChart';
import clsx from 'clsx';
import { format } from 'date-fns';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const { data: dashboard, isLoading } = useAdminDashboard();

  if (isLoading) return <PageLoader />;

  const stats = dashboard?.stats;
  const health = dashboard?.systemHealth;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardHeader />
      <div className="page-wrapper page-container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2">Platform Overview</h1>
          <p className="text-slate-500">Welcome back, {user?.firstName}. Here is the current state of RDIS.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800/50">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-sm font-semibold">Systems Operational</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Students</p>
            <h3 className="text-2xl font-bold font-number">{stats?.totalStudents.toLocaleString() || 0}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Teachers</p>
            <h3 className="text-2xl font-bold font-number">{stats?.totalTeachers.toLocaleString() || 0}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Active Courses</p>
            <h3 className="text-2xl font-bold font-number">{stats?.totalCourses.toLocaleString() || 0}</h3>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total XP Awarded</p>
            <h3 className="text-2xl font-bold font-number">{stats?.totalXPAwarded.toLocaleString() || 0}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link to="/admin/users" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors group">
              <Users className="text-slate-400 group-hover:text-primary mb-2 transition-colors" />
              <span className="font-semibold text-sm">Users</span>
            </Link>
            
            <Link to="/admin/classes" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors group">
              <BookOpen className="text-slate-400 group-hover:text-primary mb-2 transition-colors" />
              <span className="font-semibold text-sm">Classes</span>
            </Link>

            <Link to="/admin/badges" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors group">
              <Award className="text-slate-400 group-hover:text-primary mb-2 transition-colors" />
              <span className="font-semibold text-sm">Gamification</span>
            </Link>

            <Link to="/admin/settings" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors group">
              <Server className="text-slate-400 group-hover:text-primary mb-2 transition-colors" />
              <span className="font-semibold text-sm">Settings</span>
            </Link>
          </div>

          <PerformanceChart 
            title="Activity Over Time"
            data={[
              { name: 'Mon', score: 30 },
              { name: 'Tue', score: 45 },
              { name: 'Wed', score: 40 },
              { name: 'Thu', score: 70 },
              { name: 'Fri', score: 65 },
              { name: 'Sat', score: 95 },
              { name: 'Sun', score: 85 },
            ]}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-400" />
              Recent Audit Logs
            </h3>
            <div className="space-y-4">
              {dashboard?.recentLogs?.length === 0 ? (
                <p className="text-sm text-slate-500">No recent activity.</p>
              ) : (
                dashboard?.recentLogs?.map((log: any) => (
                  <div key={log.id} className="flex gap-3">
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-semibold">{log.actor.email}</span>{' '}
                        <span className="text-slate-500">{log.action}</span>{' '}
                        <span className="font-semibold">{log.resource}</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link to="/admin/audit-logs" className="block text-center w-full mt-6 py-2 text-sm text-primary font-semibold hover:bg-primary/5 rounded-lg transition-colors">
              View All Logs
            </Link>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-400" />
              System Health
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Database</span>
                <span className="font-medium text-emerald-600">{health?.database}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">API Uptime</span>
                <span className="font-medium font-number">{Math.floor((health?.uptime || 0) / 3600)}h {Math.floor(((health?.uptime || 0) % 3600) / 60)}m</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Version</span>
                <span className="font-medium font-number">v{health?.version}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
