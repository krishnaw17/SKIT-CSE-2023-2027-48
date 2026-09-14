import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourses, enrollInCourse, unenrollFromCourse } from '@/features/courses/courses.api';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { PageLoader } from '@/components/common/PageLoader';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, PlayCircle, CheckCircle2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentCoursesPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'my-courses' | 'catalog'>('my-courses');

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses', 'student', user?.id],
    queryFn: () => getCourses() // student backend filters automatically based on role/enrollments
  });

  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => enrollInCourse(courseId),
    onSuccess: (data, courseId) => {
      toast.success('Successfully enrolled!');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      navigate(`/student/courses/${courseId}`);
    },
    onError: () => toast.error('Failed to enroll')
  });

  const unenrollMutation = useMutation({
    mutationFn: (courseId: string) => unenrollFromCourse(courseId),
    onSuccess: () => {
      toast.success('Unenrolled successfully');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: () => toast.error('Failed to unenroll')
  });

  if (isLoading) return <PageLoader />;

  const myCourses = courses?.filter(c => c.isEnrolled) || [];
  const catalogCourses = courses?.filter(c => !c.isEnrolled) || [];

  const displayCourses = activeTab === 'my-courses' ? myCourses : catalogCourses;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardHeader />
      
      <div className="page-wrapper page-container py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">Learning Hub</h1>
          <p className="text-slate-500">Discover new courses or continue where you left off.</p>
        </div>

        <div className="flex gap-4 mb-8">
          <button 
            className={`px-4 py-2 font-semibold text-sm rounded-full transition-colors ${activeTab === 'my-courses' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
            onClick={() => setActiveTab('my-courses')}
          >
            My Enrolled Courses ({myCourses.length})
          </button>
          <button 
            className={`px-4 py-2 font-semibold text-sm rounded-full transition-colors ${activeTab === 'catalog' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
            onClick={() => setActiveTab('catalog')}
          >
            Course Catalog
          </button>
        </div>

        {displayCourses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">{activeTab === 'my-courses' ? 'Not enrolled in any courses' : 'No new courses available'}</h3>
            <p className="text-slate-500 mb-6">
              {activeTab === 'my-courses' 
                ? 'Check the course catalog to find something interesting to learn.'
                : 'You have enrolled in all available courses, or none have been published yet.'}
            </p>
            {activeTab === 'my-courses' && (
              <Button onClick={() => setActiveTab('catalog')}>Browse Catalog</Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCourses.map(course => (
              <div key={course.id} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <BookOpen className="w-12 h-12 opacity-50" />
                    </div>
                  )}
                  {course.isEnrolled && (
                    <div className="absolute top-3 right-3 bg-emerald-500/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Enrolled
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-1 text-xs font-bold tracking-wider text-primary uppercase flex justify-between">
                    <span>{course.subject?.name}</span>
                    <span className="text-amber-500">{course.xpReward} XP</span>
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-2 line-clamp-1">{course.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">{course.description || "No description provided."}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{course.estimatedHours ? `${course.estimatedHours}h` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>{course._count?.lessons || 0} Lessons</span>
                    </div>
                  </div>
                  
                  {course.isEnrolled ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>Progress</span>
                        <span className="text-primary">{Math.round(course.progressPercent || 0)}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500" 
                          style={{ width: `${course.progressPercent || 0}%` }}
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" className="px-3 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20" onClick={() => {
                          if(window.confirm('Are you sure you want to unenroll? All progress will be lost.')) unenrollMutation.mutate(course.id);
                        }} disabled={unenrollMutation.isPending} title="Unenroll">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                        <Button className="flex-1" onClick={() => navigate(`/student/courses/${course.id}`)}>
                          <PlayCircle className="w-4 h-4 mr-2" /> Continue
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => enrollMutation.mutate(course.id)}
                      disabled={enrollMutation.isPending}
                    >
                      {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
