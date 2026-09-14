import { useState } from 'react';
import { useCourses } from '../../hooks/useCourses';
import { useAssignments } from '../../hooks/useAssignments';
import { PageLoader } from '../../components/common/PageLoader';
import { ChevronDown, ChevronUp, FileText, Calendar, Award, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Button } from '../../components/common/Button';
import { AssignmentModal } from './AssignmentModal';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

export default function StudentAssignments() {
  const { data: courses, isLoading } = useCourses();

  if (isLoading) return <PageLoader />;

  const enrolledCourses = courses?.filter(c => c.isEnrolled) || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardHeader />
      <div className="page-wrapper page-container py-8">
        <div className="space-y-8 animate-fade-up">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">My Assignments</h1>
            <p className="text-slate-500 mt-1">Manage and submit your coursework.</p>
          </div>

      {enrolledCourses.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border/50">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium">No active courses</h3>
          <p className="text-muted-foreground mt-2">Enroll in a course to see assignments.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {enrolledCourses.map(course => (
            <CourseAssignmentGroup key={course.id} course={course} />
          ))}
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

function CourseAssignmentGroup({ course }: { course: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: assignments, isLoading } = useAssignments(course.id);
  const [selectedAssignment, setSelectedAssignment] = useState<{courseId: string, id: string} | null>(null);

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg">{course.title}</h3>
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading assignments...' : `${assignments?.length || 0} Assignments`}
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      {isOpen && (
        <div className="border-t border-border/50 p-5 bg-background/50">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground flex justify-center"><PageLoader className="min-h-0 py-4" /></div>
          ) : assignments?.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No assignments for this course.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments?.map(assignment => {
                const dueDate = new Date(assignment.dueDate);
                const isOverdue = dueDate < new Date();
                
                return (
                  <div key={assignment.id} className="bg-card border border-border/50 p-5 rounded-xl hover:border-primary/30 transition-all flex flex-col">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <h4 className="font-bold line-clamp-1">{assignment.title}</h4>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md whitespace-nowrap">
                        <Award className="w-3 h-3" /> {assignment.xpReward} XP
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
                      {assignment.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                      <div className={cn("flex items-center gap-1.5 text-xs font-medium", isOverdue ? "text-red-500" : "text-muted-foreground")}>
                        {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                        {isOverdue ? 'Overdue' : 'Due'} {format(dueDate, 'MMM d, yyyy')}
                      </div>
                      
                      <Button size="sm" onClick={() => setSelectedAssignment({ courseId: course.id, id: assignment.id })}>
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selectedAssignment && (
        <AssignmentModal 
          courseId={selectedAssignment.courseId}
          assignmentId={selectedAssignment.id}
          onClose={() => setSelectedAssignment(null)}
        />
      )}
    </div>
  );
}
