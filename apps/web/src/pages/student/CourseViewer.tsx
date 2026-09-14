import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourseById, markLessonComplete, getLessons } from '@/features/courses/courses.api';
import { getQuizzes } from '@/features/quizzes/quizzes.api';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { PageLoader } from '@/components/common/PageLoader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlayCircle, FileText, CheckCircle2, ChevronRight, Trophy, BookOpen } from 'lucide-react';
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

  // Auto-select first uncompleted lesson or quiz
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
      // In a real app we'd invalidate progress, for now just show success
      // Automatically go to next lesson
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
        
        {/* Main Content Area (Video Player or Quiz Info) */}
        <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 overflow-y-auto">
          <div className="p-4 flex items-center gap-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 text-slate-900 dark:text-white">
            <button onClick={() => navigate('/student/courses')} className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold truncate text-slate-500">{course.title}</h2>
              <h1 className="text-lg font-bold truncate">{activeLesson?.title || activeQuiz?.title || (hasContent ? 'Loading...' : 'Course Empty')}</h1>
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
            {activeLesson ? (
              activeLesson.type === 'VIDEO' ? (
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
              ) : (
                <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-xl p-8 min-h-[70vh] shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="font-heading text-2xl font-bold">{activeLesson.title}</h1>
                    {activeLesson.contentUrl && (
                      <a 
                        href={activeLesson.contentUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-primary hover:underline text-sm font-medium"
                      >
                        Download Document
                      </a>
                    )}
                  </div>
                  
                  {activeLesson.contentUrl ? (
                    <div className="flex-1 w-full bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden min-h-[60vh]">
                      <iframe 
                        src={activeLesson.contentUrl.endsWith('.pdf') ? activeLesson.contentUrl : `https://docs.google.com/viewer?url=${encodeURIComponent(activeLesson.contentUrl)}&embedded=true`} 
                        className="w-full h-full border-0 min-h-[60vh]"
                        title={activeLesson.title}
                      />
                    </div>
                  ) : (
                    <div className="prose dark:prose-invert max-w-none flex-1" dangerouslySetInnerHTML={{ __html: activeLesson.contentText || 'No document content available.' }} />
                  )}
                </div>
              )
            ) : activeQuiz ? (
              <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-heading mb-2">{activeQuiz.title}</h2>
                <p className="text-slate-500 mb-8">{activeQuiz.description || 'Test your knowledge on this topic.'}</p>
                <div className="flex justify-center gap-8 mb-8 text-sm text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="block font-bold text-slate-900 dark:text-white text-lg">{activeQuiz._count?.questions || 0}</span>
                    Questions
                  </div>
                  <div>
                    <span className="block font-bold text-slate-900 dark:text-white text-lg">{activeQuiz.xpReward} XP</span>
                    Reward
                  </div>
                </div>
                <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate(`/student/quizzes/${courseId}/${activeQuiz.id}/attempt`)}>
                  Start Quiz Now
                </Button>
              </div>
            ) : (
              <div className="text-center text-slate-500">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-xl font-bold mb-2 text-slate-700 dark:text-slate-300">No content available</h3>
                <p>The instructor has not added any lessons or quizzes to this course yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (Curriculum) */}
        <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shrink-0 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-heading font-bold text-lg">Course Content</h3>
            <p className="text-sm text-slate-500">{lessons?.length || 0} Lessons</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {lessons?.map((lesson, index) => {
              const isActive = lesson.id === activeLessonId;
              return (
                <button
                  key={lesson.id}
                  onClick={() => { setActiveLessonId(lesson.id); setActiveQuizId(null); }}
                  className={clsx(
                    "w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                  )}
                >
                  <div className="mt-0.5">
                    {lesson.type === 'VIDEO' ? (
                      <PlayCircle className={clsx("w-5 h-5", isActive ? "text-primary" : "text-slate-400")} />
                    ) : (
                      <FileText className={clsx("w-5 h-5", isActive ? "text-primary" : "text-slate-400")} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={clsx("font-semibold text-sm line-clamp-2", isActive && "text-primary")}>
                      {index + 1}. {lesson.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="flex items-center text-amber-500 font-medium">
                        <Trophy className="w-3 h-3 mr-1" /> {lesson.xpReward} XP
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}

            {publishedQuizzes.length > 0 && (
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quizzes</h4>
                {publishedQuizzes.map((quiz, index) => {
                  const isActive = quiz.id === activeQuizId;
                  return (
                    <button
                      key={quiz.id}
                      onClick={() => { setActiveQuizId(quiz.id); setActiveLessonId(null); }}
                      className={clsx(
                        "w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors mb-1",
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                      )}
                    >
                      <div className="mt-0.5">
                        <FileText className={clsx("w-5 h-5", isActive ? "text-primary" : "text-slate-400")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={clsx("font-semibold text-sm line-clamp-2", isActive && "text-primary")}>
                          Quiz: {quiz.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <span className="flex items-center text-amber-500 font-medium">
                            <Trophy className="w-3 h-3 mr-1" /> {quiz.xpReward} XP
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
