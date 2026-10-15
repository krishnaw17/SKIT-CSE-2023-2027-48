import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCourse, useMarkLessonComplete } from '../../hooks/useCourses';
import { ChevronLeft, PlayCircle, FileText, CheckCircle2, ChevronRight, Menu, X, Award } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PageLoader } from '../../components/common/PageLoader';
import { Button } from '../../components/common/Button';

export default function LessonViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: course, isLoading } = useCourse(id!);
  const completeMutation = useMarkLessonComplete();
  
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const lessons = (course as any)?.lessons || [];
  
  useEffect(() => {
    if (lessons.length > 0 && !activeLessonId) {
      setActiveLessonId(lessons[0].id);
    }
  }, [lessons, activeLessonId]);

  if (isLoading) return <PageLoader />;
  if (!course || !course.isEnrolled) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">You are not enrolled in this course</h2>
        <Link to={`/courses/${id}`}>
          <Button variant="primary">View Course Details</Button>
        </Link>
      </div>
    );
  }

  const activeLesson = lessons.find((l: any) => l.id === activeLessonId) || lessons[0];
  const activeIndex = lessons.findIndex((l: any) => l.id === activeLessonId);
  const nextLesson = lessons[activeIndex + 1];
  const prevLesson = lessons[activeIndex - 1];

  const handleComplete = () => {
    if (!activeLesson) return;
    completeMutation.mutate({ courseId: course.id, lessonId: activeLesson.id });
    if (nextLesson) {
      setActiveLessonId(nextLesson.id);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -mt-8 -mx-8 sm:-mx-8 lg:-mx-12 overflow-hidden bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border/50 bg-card z-20 shadow-sm">
        <Link to={`/courses/${course.id}`} className="flex items-center text-sm font-medium">
          <ChevronLeft className="w-5 h-5 mr-1" /> Back
        </Link>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-secondary rounded-md">
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <div className={cn(
          "absolute inset-y-0 left-0 z-10 w-80 bg-card border-r border-border/50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col shadow-xl lg:shadow-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-6 border-b border-border/50 hidden lg:block">
            <Link to={`/courses/${course.id}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" /> Course Overview
            </Link>
            <h2 className="font-heading font-bold text-lg line-clamp-2">{course.title}</h2>
            
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1 font-medium text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(course.progressPercent || 0)}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000" 
                  style={{ width: `${course.progressPercent || 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {lessons.map((lesson: any, index: number) => {
              const isActive = activeLessonId === lesson.id;
              // Assuming we have progress data in lesson object or we fetch it. For UI demo:
              const isCompleted = false; // Replace with actual progress check

              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setActiveLessonId(lesson.id);
                    setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-xl flex gap-3 transition-all group border",
                    isActive 
                      ? "bg-primary/10 border-primary/20 shadow-sm" 
                      : "hover:bg-muted/50 border-transparent hover:border-border/50"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : lesson.type === 'VIDEO' ? (
                      <PlayCircle className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                    ) : (
                      <FileText className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Lesson {index + 1}</p>
                    <p className={cn("text-sm font-bold line-clamp-2 leading-snug", isActive ? "text-primary" : "")}>
                      {lesson.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/50 z-0 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-background/50 relative custom-scrollbar">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto p-4 md:p-8 pb-32 animate-fade-up">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Lesson {activeIndex + 1} of {lessons.length}</span>
                <span className="text-sm font-bold text-amber-500 flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full shadow-sm">
                  <Award className="w-4 h-4" /> +{activeLesson.xpReward} XP
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-heading font-bold mb-8">{activeLesson.title}</h1>

              {/* Content Area */}
              <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden mb-8">
                {activeLesson.type === 'VIDEO' && activeLesson.contentUrl ? (
                  <div className="aspect-video bg-black relative">
                    <video 
                      controls 
                      className="w-full h-full object-contain"
                      src={activeLesson.contentUrl}
                      controlsList="nodownload"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : activeLesson.type === 'DOCUMENT' && activeLesson.contentUrl ? (
                   <div className="aspect-[16/10] bg-muted relative">
                     <iframe src={`${activeLesson.contentUrl}#toolbar=0`} className="w-full h-full border-0" title={activeLesson.title} />
                   </div>
                ) : (
                  <div className="p-8 md:p-12 prose prose-zinc dark:prose-invert max-w-none">
                    {/* Render rich text content here. For now, simple text */}
                    <div dangerouslySetInnerHTML={{ __html: activeLesson.contentText || '<p>No text content available.</p>' }} />
                  </div>
                )}
              </div>

              {activeLesson.description && (
                <div className="mb-12">
                  <h3 className="font-bold text-lg mb-2">Lesson Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{activeLesson.description}</p>
                </div>
              )}

              {/* Navigation & Completion */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border/50">
                <Button 
                  variant="outline" 
                  onClick={() => prevLesson && setActiveLessonId(prevLesson.id)}
                  disabled={!prevLesson}
                  className="w-full sm:w-auto"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </Button>

                <Button 
                  variant="primary" 
                  onClick={handleComplete}
                  disabled={completeMutation.isPending}
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  {completeMutation.isPending ? 'Saving...' : 'Mark as Complete & Continue'}
                  {!completeMutation.isPending && <ChevronRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Select a lesson to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
