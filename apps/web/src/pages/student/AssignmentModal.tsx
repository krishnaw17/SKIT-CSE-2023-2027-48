import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAssignment, useSubmitAssignment, useUnsubmitAssignment } from '../../hooks/useAssignments';
import { X, FileText, Upload, CheckCircle2, Clock, Award, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { PageLoader } from '../../components/common/PageLoader';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

interface AssignmentModalProps {
  courseId: string;
  assignmentId: string;
  onClose: () => void;
}

export function AssignmentModal({ courseId, assignmentId, onClose }: AssignmentModalProps) {
  const { data: assignment, isLoading } = useAssignment(courseId, assignmentId);
  const submitMutation = useSubmitAssignment();
  const unsubmitMutation = useUnsubmitAssignment();

  const [textContent, setTextContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (isLoading) {
    if (!mounted) return null;
    return createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <PageLoader className="bg-transparent" />
      </div>,
      document.body
    );
  }

  if (!assignment || !mounted) return null;

  const isSubmitted = !!assignment.mySubmission && assignment.mySubmission.status !== 'RETURNED';
  const dueDate = new Date(assignment.dueDate);
  const isOverdue = dueDate < new Date();
  
  const canSubmit = !isSubmitted && (!isOverdue || assignment.allowLate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: { courseId: string; id: string; textContent?: string; files?: File[] } = {
      courseId,
      id: assignmentId,
    };
    if (textContent) {
      payload.textContent = textContent;
    }
    if (files.length > 0) {
      payload.files = files;
    }
    submitMutation.mutate(payload);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col border border-border/50 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-card">
          <div>
            <h2 className="text-2xl font-heading font-bold">{assignment.title}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className={cn("flex items-center gap-1.5 font-medium", isOverdue ? "text-red-500" : "text-muted-foreground")}>
                {isOverdue ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                {isOverdue ? 'Overdue' : 'Due'} {format(dueDate, 'MMM d, yyyy h:mm a')}
              </span>
              <span className="flex items-center gap-1.5 font-medium text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                <Award className="w-4 h-4" /> {assignment.xpReward} XP
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="prose prose-zinc dark:prose-invert max-w-none mb-8">
            <h3 className="text-lg font-bold">Instructions</h3>
            <p className="whitespace-pre-wrap">{assignment.description}</p>
            {assignment.instructions && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm" dangerouslySetInnerHTML={{ __html: assignment.instructions }} />
            )}
          </div>

          {assignment.attachmentUrls && assignment.attachmentUrls.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-3">Attachments</h3>
              <div className="flex flex-wrap gap-3">
                {assignment.attachmentUrls.map((url, i) => (
                  <a 
                    key={i} 
                    href={url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    Attachment {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border/50 pt-8">
            <h3 className="text-lg font-bold mb-6">Your Work</h3>
            
            {isSubmitted ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h4 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">Successfully Submitted</h4>
                <p className="text-sm text-green-600/80 dark:text-green-400/80 mb-4">
                  Submitted on {format(new Date(assignment.mySubmission!.submittedAt), 'MMM d, yyyy h:mm a')}
                </p>
                {assignment.mySubmission!.score !== null && (
                  <div className="inline-block bg-background px-4 py-2 rounded-lg font-bold text-foreground shadow-sm mb-4">
                    Score: {assignment.mySubmission!.score} / {assignment.maxScore}
                  </div>
                )}
                
                {assignment.mySubmission!.status !== 'RETURNED' && (
                  <div className="mt-4 pt-4 border-t border-green-500/20">
                    <Button 
                      variant="outline" 
                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900/50 dark:hover:bg-red-900/20"
                      onClick={() => {
                        if (confirm('Are you sure you want to unsubmit? This will delete your current submission and any grades associated with it.')) {
                          unsubmitMutation.mutate({ courseId, id: assignmentId });
                        }
                      }}
                      disabled={unsubmitMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {unsubmitMutation.isPending ? 'Unsubmitting...' : 'Unsubmit'}
                    </Button>
                  </div>
                )}
              </div>
            ) : canSubmit ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Text Response (Optional)</label>
                  <textarea
                    className="w-full min-h-[150px] p-4 bg-background border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-y"
                    placeholder="Type your answer here..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Upload Files (Optional)</label>
                  <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:bg-muted/30 transition-colors relative">
                    <input
                      type="file"
                      multiple
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    />
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium">Click or drag files to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">Up to 5 files, 100MB each</p>
                    
                    {files.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2 justify-center">
                        {files.map((file, i) => (
                          <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-md">
                            {file.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                  <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                  <Button 
                    type="submit" 
                    disabled={submitMutation.isPending || (!textContent && files.length === 0)}
                    isLoading={submitMutation.isPending}
                  >
                    Submit Assignment
                  </Button>
                </div>
              </form>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h4 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Submission Closed</h4>
                <p className="text-sm text-red-600/80 dark:text-red-400/80">
                  This assignment is past its due date and does not accept late submissions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
