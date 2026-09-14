import { useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { PageLoader } from '@/components/common/PageLoader';
import { usePendingSubmissions, useGradedSubmissions } from '@/features/teacher/teacher.api';
import { gradeSubmission } from '@/features/assignments/assignments.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, CheckCircle2, User, Download, AlertCircle, History } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export default function GradingPage() {
  const { data: pendingSubmissions, isLoading: pendingLoading } = usePendingSubmissions();
  const { data: gradedSubmissions, isLoading: gradedLoading } = useGradedSubmissions();
  
  const [activeTab, setActiveTab] = useState<'pending' | 'graded'>('pending');
  const [selectedSub, setSelectedSub] = useState<any>(null);

  const isLoading = pendingLoading || gradedLoading;
  const submissions = activeTab === 'pending' ? pendingSubmissions : gradedSubmissions;

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardHeader />
      <div className="page-wrapper page-container py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">Grading Center</h1>
          <p className="text-slate-500">Review and grade pending assignment submissions from your students.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side: Queue */}
          <div className="lg:col-span-1 space-y-4 flex flex-col h-full">
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                  onClick={() => { setActiveTab('pending'); setSelectedSub(null); }}
                  className={cn(
                    "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors",
                    activeTab === 'pending' ? "bg-white dark:bg-slate-900 shadow-sm text-primary" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  Pending ({pendingSubmissions?.length || 0})
                </button>
                <button
                  onClick={() => { setActiveTab('graded'); setSelectedSub(null); }}
                  className={cn(
                    "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors",
                    activeTab === 'graded' ? "bg-white dark:bg-slate-900 shadow-sm text-primary" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  Graded ({gradedSubmissions?.length || 0})
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto flex-1 max-h-[600px] pr-2">
                {!submissions || submissions.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-3 opacity-50" />
                    <h3 className="font-medium">All caught up!</h3>
                    <p className="text-slate-500 text-sm mt-1">No {activeTab} submissions.</p>
                  </div>
                ) : (
                  submissions.map((sub: any) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      className={cn(
                        "w-full p-4 rounded-xl text-left border transition-all text-sm",
                        selectedSub?.id === sub.id 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/50"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold truncate pr-2">{sub.student.firstName} {sub.student.lastName}</span>
                        <span className={cn("text-xs whitespace-nowrap", selectedSub?.id === sub.id ? "text-primary-foreground/80" : "text-slate-500")}>
                          {format(new Date(activeTab === 'pending' ? sub.submittedAt : (sub.gradedAt || sub.submittedAt)), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <div className="font-medium truncate">{sub.assignment.title}</div>
                      <div className={cn("text-xs mt-1 truncate flex items-center justify-between", selectedSub?.id === sub.id ? "text-primary-foreground/80" : "text-slate-500")}>
                        <span>{sub.assignment.course.title}</span>
                        {activeTab === 'graded' && sub.score !== null && (
                          <span className="font-semibold text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-sm">
                            {sub.score}/{sub.assignment.maxScore}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Right side: Grading Panel */}
            <div className="lg:col-span-2">
              {selectedSub ? (
                <GradingPanel sub={selectedSub} onGraded={() => setSelectedSub(null)} />
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-100/50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                  <FileText className="w-12 h-12 mb-4 opacity-50" />
                  <p>Select a submission from the queue to start grading.</p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GradingPanel({ sub, onGraded }: { sub: any, onGraded: () => void }) {
  const [score, setScore] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    // Populate form if it's already graded
    setScore(sub.score !== null ? sub.score : '');
    setFeedback(sub.feedback || '');
  }, [sub]);

  const gradeMutation = useMutation({
    mutationFn: () => gradeSubmission(
      sub.assignment.courseId, 
      sub.assignmentId, 
      sub.id, 
      Number(score), 
      feedback
    ),
    onSuccess: () => {
      toast.success('Successfully graded!');
      queryClient.invalidateQueries({ queryKey: ['teacher', 'submissions', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'submissions', 'graded'] });
      onGraded();
    },
    onError: () => toast.error('Failed to submit grade')
  });

  const handleGrade = () => {
    if (score === '') return toast.error('Please enter a score');
    if (Number(score) > sub.assignment.maxScore) return toast.error(`Score cannot exceed max score (${sub.assignment.maxScore})`);
    
    gradeMutation.mutate();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
        <div>
          <h2 className="text-xl font-bold font-heading">{sub.assignment.title}</h2>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <User className="w-4 h-4" /> {sub.student.firstName} {sub.student.lastName}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold">Max Score</div>
          <div className="text-2xl font-bold text-primary">{sub.assignment.maxScore}</div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div>
          <h3 className="font-bold mb-4">Student's Submission</h3>
          
          {sub.textContent && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 mb-4 whitespace-pre-wrap text-sm">
              {sub.textContent}
            </div>
          )}

          {sub.fileUrls && sub.fileUrls.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {sub.fileUrls.map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
                  <Download className="w-4 h-4" />
                  Attachment {i + 1}
                </a>
              ))}
            </div>
          )}
          
          {!sub.textContent && (!sub.fileUrls || sub.fileUrls.length === 0) && (
            <div className="text-slate-400 italic text-sm">Empty submission.</div>
          )}
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
          <h3 className="font-bold mb-4">Grading & Feedback</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold mb-2">Score</label>
              <input 
                type="number" 
                min="0"
                max={sub.assignment.maxScore}
                value={score}
                onChange={e => setScore(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-2xl font-bold py-3 text-center rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="0"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold mb-2">Feedback (Optional)</label>
              <textarea 
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                className="w-full min-h-[100px] p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-sm"
                placeholder="Great job on the..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
        <Button variant="outline" onClick={onGraded}>Cancel</Button>
        <Button 
          onClick={handleGrade} 
          disabled={score === '' || gradeMutation.isPending}
        >
          {gradeMutation.isPending ? 'Saving...' : sub.score !== null ? 'Update Grade' : 'Submit Grade'}
        </Button>
      </div>
    </div>
  );
}
