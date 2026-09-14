import { useStudentProgress } from '@/features/gamification/gamification.api';
import { XPProgressBar } from '@/features/gamification/XPProgressBar';
import { BadgeDisplay } from '@/features/gamification/BadgeDisplay';
import { PerformanceChart } from '@/components/charts/PerformanceChart';
import { PageLoader } from '@/components/common/PageLoader';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Trophy, Clock } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { useQuery } from '@tanstack/react-query';
import { getCourses } from '@/features/courses/courses.api';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: progress, isLoading: isProgressLoading } = useStudentProgress();
  const { data: courses, isLoading: isCoursesLoading } = useQuery({
    queryKey: ['courses', 'student'],
    queryFn: () => getCourses()
  });

  const enrolledCourses = courses?.filter(c => c.isEnrolled) || [];
  const recentCourses = enrolledCourses.slice(0, 3);

  if (isProgressLoading || isCoursesLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardHeader />
      <div className="page-wrapper page-container py-8">
        <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">Welcome back, {user?.firstName}! 👋</h1>
        <p className="text-slate-500">Here's what's happening with your learning journey today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
          <XPProgressBar progress={progress} />
          
          <BadgeDisplay badges={progress?.badges || []} />

          <PerformanceChart 
            title="XP Earned (Last 5 Days)"
            data={(progress as any)?.chartData || []} 
          />

          {/* Quick Actions / Shortcuts (Phase 4 placeholder) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <Link to="/student/courses" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
              </div>
              <span className="font-semibold text-sm">Courses</span>
            </Link>
            
            <Link to="/student/assignments" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Clock size={24} />
              </div>
              <span className="font-semibold text-sm">Assignments</span>
            </Link>

            <Link to="/student/quizzes" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Trophy size={24} />
              </div>
              <span className="font-semibold text-sm">Quizzes</span>
            </Link>

            <Link to="/student/leaderboard" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Trophy size={24} />
              </div>
              <span className="font-semibold text-sm">Rankings</span>
            </Link>
          </div>
        </div>

        {/* Right Column (Sidebar Widgets) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              My Enrolled Courses
            </h3>
            
            <div className="space-y-4">
              {recentCourses.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  You haven't enrolled in any courses yet.
                </div>
              ) : (
                recentCourses.map(course => (
                  <div key={course.id} className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer" onClick={() => navigate(`/student/courses/${course.id}`)}>
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                      {course.thumbnailUrl ? (
                        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <BookOpen className="w-6 h-6 opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">{course.title}</h4>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-primary h-1.5 rounded-full transition-all duration-1000"
                          style={{ width: `${course.progressPercent || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">{course.progressPercent || 0}% Completed</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <Link to="/student/courses" className="block text-center w-full mt-6 py-2 text-sm text-primary font-semibold hover:bg-primary/5 rounded-lg transition-colors">
              View All Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
