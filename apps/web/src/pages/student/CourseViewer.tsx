import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourseById, markLessonComplete, getLessons } from '@/features/courses/courses.api';
import { getQuizzes } from '@/features/quizzes/quizzes.api';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { PageLoader } from '@/components/common/PageLoader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlayCircle, FileText, Trophy, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function StudentCourseViewer() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId!),
    enabled: !!courseId,
  });

  const { data: lessons, isLoading: isLoadingLessons } = useQuery({
    queryKey: ['course', courseId, 'lessons'],
    queryFn: () => getLessons(courseId!),
    enabled: !!courseId,
  });

  const { data: quizzes, isLoading: isLoadingQuizzes } = useQuery({
    queryKey: ['course', courseId, 'quizzes'],
    queryFn: () => getQuizzes(courseId!),
    enabled: !!courseId,
  });

  // Auto-select first lesson or quiz on load
  useEffect(() => {
    if (!activeLessonId && !activeQuizId) {
      if (lessons && lessons.length > 0) {
        setActiveLessonId(lessons[0]!.id);
      } else if (quizzes) {
        const published = quizzes.filter(q => q.status === 'PUBLISHED');
        if (published.length > 0) {
          setActiveQuizId(published[0]!.id);
        }
      }
    }
  }, [lessons, quizzes, activeLessonId, activeQuizId]);

  const completeMutation = useMutation({
    mutationFn: () => markLessonComplete(courseId!, activeLessonId!),
    onSuccess: () => {
      toast.success('Lesson completed! XP earned 🏆');
      if (lessons) {
        const currentIndex = lessons.findIndex(l => l.id === activeLessonId);
        if (currentIndex < lessons.length - 1) {
          setActiveLessonId(lessons[currentIndex + 1]!.id);
        }
      }
    }
  });

  if (isLoadingCourse || isLoadingLessons || isLoadingQuizzes) return <PageLoader />;
  if (!course) return <div>Course not found</div>;

  const activeLesson = lessons?.find(l => l.id === activeLessonId);
  const activeQuiz = quizzes?.find(q => q.id === activeQuizId);

  const publishedQuizzes = quizzes?.filter(q => q.status === 'PUBLISHED') || [];
  const hasContent = (lessons && lessons.length > 0) || publishedQuizzes.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <DashboardHeader />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>

        {/* Main Content Area (Video Player) */}
        <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 overflow-y-auto">
          <div className="p-4 flex items-center gap-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 text-slate-900 dark:text-white">
            <button
              onClick={() => navigate('/student/courses')}
              className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold truncate text-slate-500">{course.title}</h2>
              <h1 className="text-lg font-bold truncate">
                {activeLesson?.title || activeQuiz?.title || (hasContent ? 'Loading...' : 'Course Empty')}
              </h1>
            </div>
            {activeLesson && (
              <Button
                onClick={() => completeMutation.mutate()}
                disabled={completeMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
              >
                {completeMutation.isPending ? 'Marking...' : 'Complete & Earn XP'}
              </Button>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-4">
            {activeLesson && activeLesson.type === 'VIDEO' && (
              <div className="w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center relative shadow-xl">
                {activeLesson.contentUrl ? (
                  <video
                    src={activeLesson.contentUrl}
                    controls
                    className="w-full h-full"
                    autoPlay
                  />
                ) : (
                  <div className="text-center text-slate-500">
                    <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Video content is missing or being processed.</p>
                  </div>
                )}
              </div>
            )}
            {/* TODO: Document viewer, Quiz section, and Curriculum Sidebar - WIP */}
          </div>
        </div>

      </div>
    </div>
  );
}
