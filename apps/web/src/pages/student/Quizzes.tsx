import { useState } from 'react';
import { useCourses } from '../../hooks/useCourses';
import { useQuizzes } from '../../hooks/useQuizzes';
import { PageLoader } from '../../components/common/PageLoader';
import { ChevronDown, ChevronUp, HelpCircle, Clock, Award, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

export default function StudentQuizzes() {
  const { data: courses, isLoading } = useCourses();

  if (isLoading) return <PageLoader />;

  const enrolledCourses = courses?.filter(c => c.isEnrolled) || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardHeader />
      <div className="page-wrapper page-container py-8">
        <div className="space-y-8 animate-fade-up">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">My Quizzes</h1>
            <p className="text-muted-foreground mt-1">Test your knowledge and earn XP.</p>
          </div>

      {enrolledCourses.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border/50">
          <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium">No active courses</h3>
          <p className="text-muted-foreground mt-2">Enroll in a course to see quizzes.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {enrolledCourses.map(course => (
            <CourseQuizGroup key={course.id} course={course} />
          ))}
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

function CourseQuizGroup({ course }: { course: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: quizzes, isLoading } = useQuizzes(course.id);

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg">{course.title}</h3>
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading quizzes...' : `${quizzes?.length || 0} Quizzes`}
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      {isOpen && (
        <div className="border-t border-border/50 p-5 bg-background/50">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground flex justify-center"><PageLoader className="min-h-0 py-4" /></div>
          ) : quizzes?.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No quizzes for this course.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes?.map(quiz => {
                // Determine if quiz is completed
                // Backend returns myAttempts if any, but in the list API maybe not. Let's assume it doesn't.
                // We'll show basic details.
                return (
                  <div key={quiz.id} className="bg-card border border-border/50 p-5 rounded-xl hover:border-primary/30 transition-all flex flex-col">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <h4 className="font-bold line-clamp-1">{quiz.title}</h4>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md whitespace-nowrap">
                        <Award className="w-3 h-3" /> {quiz.xpReward} XP
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
                      {quiz.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                      <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                        {quiz.timeLimit && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {quiz.timeLimit}m
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {quiz._count?.questions || 0} Qs
                        </span>
                      </div>
                      
                      <Link to={`/student/quizzes/${course.id}/${quiz.id}/attempt`}>
                        <Button size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
