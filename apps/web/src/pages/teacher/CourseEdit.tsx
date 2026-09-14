import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourseById, updateCourse, deleteCourse, createLesson, deleteLesson } from '@/features/courses/courses.api';
import { getSubjects, getClasses } from '@/features/shared/shared.api';
import { getQuizzes, createQuiz, deleteQuiz } from '@/features/quizzes/quizzes.api';
import { getAssignments, createAssignment, updateAssignment, deleteAssignment } from '@/features/assignments/assignments.api';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { PageLoader } from '@/components/common/PageLoader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Trash2, Plus, GripVertical, Video, FileText, CheckCircle2, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function TeacherCourseEdit() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'settings' | 'lessons' | 'quizzes' | 'assignments'>('lessons');
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [editAssignmentId, setEditAssignmentId] = useState<string | null>(null);
  
  // Lesson form state
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<'VIDEO' | 'DOCUMENT'>('VIDEO');
  const [lessonFile, setLessonFile] = useState<File | null>(null);
  const [lessonXp, setLessonXp] = useState(10);
  
  // Settings form state
  const [settings, setSettings] = useState<any>(null);

  // Assignment form state
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDesc, setAssignmentDesc] = useState('');
  const [assignmentDate, setAssignmentDate] = useState('');
  const [assignmentScore, setAssignmentScore] = useState(100);
  const [assignmentXp, setAssignmentXp] = useState(50);
  const [assignmentFiles, setAssignmentFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId!),
    enabled: !!courseId,
  });

  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: getSubjects });
  const { data: classes } = useQuery({ queryKey: ['classes'], queryFn: getClasses });

  const { data: quizzes } = useQuery({
    queryKey: ['quizzes', courseId],
    queryFn: () => getQuizzes(courseId!),
    enabled: !!courseId,
  });

  const { data: assignments } = useQuery({
    queryKey: ['assignments', courseId],
    queryFn: () => getAssignments(courseId!),
    enabled: !!courseId,
  });

  // Init settings form
  if (course && !settings) {
    setSettings({
      title: course.title,
      description: course.description || '',
      subjectId: course.subjectId,
      classId: (course as any).classId || '',
      xpReward: course.xpReward,
      isPublished: course.isPublished,
    });
  }

  const updateMutation = useMutation({
    mutationFn: () => updateCourse(courseId!, settings),
    onSuccess: () => {
      toast.success('Course updated successfully');
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: () => toast.error('Failed to update course')
  });

  const deleteCourseMutation = useMutation({
    mutationFn: () => deleteCourse(courseId!),
    onSuccess: () => {
      toast.success('Course deleted');
      navigate('/teacher/courses');
    }
  });

  const createLessonMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append('title', lessonTitle);
      formData.append('type', lessonType);
      formData.append('xpReward', lessonXp.toString());
      formData.append('isPublished', 'true');
      if (lessonFile) {
        formData.append('file', lessonFile);
      }
      // order is automatically handled by the backend appending it
      return createLesson(courseId!, formData);
    },
    onSuccess: () => {
      toast.success('Lesson added successfully');
      setShowAddLesson(false);
      setLessonTitle('');
      setLessonFile(null);
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
    onError: () => toast.error('Failed to add lesson')
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: string) => deleteLesson(courseId!, lessonId),
    onSuccess: () => {
      toast.success('Lesson deleted');
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    }
  });

  const createQuizMutation = useMutation({
    mutationFn: () => createQuiz(courseId!, { title: 'New Quiz', description: 'Quiz description', maxAttempts: 1, passingScore: 50, xpReward: 50, xpBonusPerfect: 10, status: 'DRAFT' }),
    onSuccess: (newQuiz) => {
      toast.success('Quiz created');
      navigate(`/teacher/courses/${courseId}/quizzes/${newQuiz.id}/builder`);
    }
  });

  const deleteQuizMutation = useMutation({
    mutationFn: (id: string) => deleteQuiz(courseId!, id),
    onSuccess: () => {
      toast.success('Quiz deleted');
      queryClient.invalidateQueries({ queryKey: ['quizzes', courseId] });
    }
  });

  const createAssignmentMutation = useMutation({
    mutationFn: () => createAssignment(courseId!, { 
      title: assignmentTitle, 
      description: assignmentDesc, 
      dueDate: new Date(assignmentDate).toISOString(), 
      maxScore: assignmentScore, 
      passingScore: Math.round(assignmentScore / 2), 
      allowLate: false, 
      latePenaltyPct: 0, 
      xpReward: assignmentXp, 
      status: 'PUBLISHED',
      files: assignmentFiles
    }),
    onSuccess: () => {
      toast.success('Assignment created');
      setShowAddAssignment(false);
      setAssignmentTitle('');
      setAssignmentDesc('');
      setAssignmentDate('');
      setAssignmentScore(100);
      setAssignmentXp(50);
      setAssignmentFiles([]);
      queryClient.invalidateQueries({ queryKey: ['assignments', courseId] });
    },
    onError: () => toast.error('Failed to add assignment')
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: () => updateAssignment(courseId!, editAssignmentId!, { 
      title: assignmentTitle, 
      description: assignmentDesc, 
      dueDate: new Date(assignmentDate).toISOString(), 
      maxScore: assignmentScore,
      xpReward: assignmentXp,
      files: assignmentFiles.length > 0 ? assignmentFiles : undefined,
      existingAttachments: existingAttachments
    }),
    onSuccess: () => {
      toast.success('Assignment updated');
      setShowAddAssignment(false);
      setEditAssignmentId(null);
      setAssignmentTitle('');
      setAssignmentDesc('');
      setAssignmentDate('');
      setAssignmentScore(100);
      setAssignmentXp(50);
      setAssignmentFiles([]);
      setExistingAttachments([]);
      queryClient.invalidateQueries({ queryKey: ['assignments', courseId] });
    },
    onError: () => toast.error('Failed to update assignment')
  });

  const handleEditAssignment = (assignment: any) => {
    setAssignmentTitle(assignment.title);
    setAssignmentDesc(assignment.description || '');
    setAssignmentDate(assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0]! : '');
    setAssignmentScore(assignment.maxScore);
    setAssignmentXp(assignment.xpReward || 50);
    setAssignmentFiles([]);
    setExistingAttachments(assignment.attachmentUrls || []);
    setEditAssignmentId(assignment.id);
    setShowAddAssignment(true);
  };

  const deleteAssignmentMutation = useMutation({
    mutationFn: (id: string) => deleteAssignment(courseId!, id),
    onSuccess: () => {
      toast.success('Assignment deleted');
      queryClient.invalidateQueries({ queryKey: ['assignments', courseId] });
    }
  });

  if (isLoading) return <PageLoader />;
  if (!course) return <div>Course not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <DashboardHeader />

      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/teacher/courses')} className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", course.isPublished ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400")}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
                <span className="text-sm font-semibold text-primary">{course.subject?.name}</span>
              </div>
              <h1 className="font-heading text-xl font-bold">{course.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-danger border-danger/20 hover:bg-danger/10" onClick={() => {
              if (window.confirm('Are you sure you want to delete this entire course?')) {
                deleteCourseMutation.mutate();
              }
            }}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
              <Save className="w-4 h-4 mr-2" /> {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 overflow-x-auto pb-1 no-scrollbar">
            <button 
              onClick={() => setActiveTab('lessons')}
              className={clsx("pb-3 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap", activeTab === 'lessons' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white")}
            >
              Curriculum (Lessons)
            </button>
            <button 
              onClick={() => setActiveTab('quizzes')}
              className={clsx("pb-3 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap", activeTab === 'quizzes' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white")}
            >
              Quizzes
            </button>
            <button 
              onClick={() => setActiveTab('assignments')}
              className={clsx("pb-3 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap", activeTab === 'assignments' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white")}
            >
              Assignments
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={clsx("pb-3 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap", activeTab === 'settings' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white")}
            >
              Course Settings
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full page-wrapper page-container py-8 max-w-4xl mx-auto">
        
        {activeTab === 'settings' && settings && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in">
            <h2 className="text-lg font-bold font-heading mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 md:col-span-2">
                <label className="block">
                  <span className="text-sm font-semibold mb-1 block">Course Title</span>
                  <input type="text" value={settings.title} onChange={e => setSettings({...settings, title: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent" />
                </label>
              </div>
              
              <label className="block">
                <span className="text-sm font-semibold mb-1 block">Subject</span>
                <select value={settings.subjectId} onChange={e => setSettings({...settings, subjectId: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent">
                  <option value="">Select subject</option>
                  {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold mb-1 block">Target Class</span>
                <select value={settings.classId} onChange={e => setSettings({...settings, classId: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent">
                  <option value="">General Course (No specific class)</option>
                  {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-semibold mb-1 block">Description</span>
                <textarea value={settings.description} onChange={e => setSettings({...settings, description: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent h-32 resize-none" />
              </label>

              <label className="block">
                <span className="text-sm font-semibold mb-1 block">Course XP Reward</span>
                <input type="number" value={settings.xpReward} onChange={e => setSettings({...settings, xpReward: parseInt(e.target.value)})} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent" />
                <span className="text-xs text-slate-500 mt-1 block">XP awarded when student completes 100% of the lessons.</span>
              </label>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={settings.isPublished} onChange={e => setSettings({...settings, isPublished: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                  <div>
                    <span className="text-sm font-semibold block">Publish Course</span>
                    <span className="text-xs text-slate-500 block">Make this course visible to students.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold font-heading">Course Curriculum</h2>
              <Button onClick={() => setShowAddLesson(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Lesson
              </Button>
            </div>

            {course.lessons?.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700">
                <Video className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">No lessons yet</h3>
                <p className="text-sm text-slate-500 mb-4">Start building your curriculum by adding video lectures or documents.</p>
                <Button onClick={() => setShowAddLesson(true)} variant="outline">Add First Lesson</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {course.lessons?.map((lesson: any, index: number) => (
                  <div key={lesson.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex items-center gap-4 group transition-all hover:shadow-md hover:border-primary/50">
                    <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      {lesson.type === 'VIDEO' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{index + 1}. {lesson.title}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                        <span className="capitalize">{lesson.type.toLowerCase()}</span>
                        <span>•</span>
                        <span className="flex items-center text-amber-500"><CheckCircle2 className="w-3 h-3 mr-1" /> {lesson.xpReward} XP</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="text-danger hover:bg-danger/10 hover:text-danger" onClick={() => {
                        if (window.confirm('Delete this lesson?')) deleteLessonMutation.mutate(lesson.id);
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold font-heading">Course Quizzes</h2>
              <Button onClick={() => createQuizMutation.mutate()} disabled={createQuizMutation.isPending} className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create Quiz
              </Button>
            </div>

            {!quizzes || quizzes.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700">
                <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">No quizzes yet</h3>
                <p className="text-sm text-slate-500 mb-4">Create quizzes to test your students' knowledge.</p>
                <Button onClick={() => createQuizMutation.mutate()} variant="outline">Create First Quiz</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizzes.map((quiz: any) => (
                  <div key={quiz.id} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg">{quiz.title}</h4>
                        <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase", quiz.status === 'PUBLISHED' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>
                          {quiz.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4">{quiz.description}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                      <span className="text-xs font-semibold text-slate-500">{quiz._count?.questions || 0} Questions</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-danger hover:bg-danger/10 hover:text-danger" onClick={() => {
                          if (window.confirm('Delete this quiz?')) deleteQuizMutation.mutate(quiz.id);
                        }}>
                          Delete
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/teacher/courses/${courseId}/quizzes/${quiz.id}/builder`)}>Edit</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="w-full space-y-4 animate-in fade-in">
            <div className="w-full flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold font-heading">Course Assignments</h2>
              <Button onClick={() => setShowAddAssignment(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create Assignment
              </Button>
            </div>

            {!assignments || assignments.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700">
                <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">No assignments yet</h3>
                <p className="text-sm text-slate-500 mb-4">Assign tasks and projects to your students.</p>
                <Button onClick={() => setShowAddAssignment(true)} variant="outline">Create First Assignment</Button>
              </div>
            ) : (
              <div className="w-full space-y-3">
                {assignments.map((assignment: any) => (
                  <div key={assignment.id} className="w-full bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold">{assignment.title}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Max Score: {assignment.maxScore}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary hover:bg-primary/10" onClick={() => handleEditAssignment(assignment)}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-danger hover:bg-danger/10 hover:text-danger" onClick={() => {
                        if (window.confirm('Delete this assignment?')) deleteAssignmentMutation.mutate(assignment.id);
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Add Lesson Modal */}
      {showAddLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold font-heading">Add New Lesson</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Lesson Title</label>
                <input 
                  type="text" 
                  value={lessonTitle} 
                  onChange={e => setLessonTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  placeholder="e.g. Introduction to Kinematics"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setLessonType('VIDEO')}
                  className={clsx("p-3 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 transition-colors", lessonType === 'VIDEO' ? "border-primary bg-primary/5 text-primary" : "border-slate-200 dark:border-slate-700 text-slate-600")}
                >
                  <Video className="w-4 h-4" /> Video
                </button>
                <button 
                  onClick={() => setLessonType('DOCUMENT')}
                  className={clsx("p-3 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 transition-colors", lessonType === 'DOCUMENT' ? "border-primary bg-primary/5 text-primary" : "border-slate-200 dark:border-slate-700 text-slate-600")}
                >
                  <FileText className="w-4 h-4" /> Document
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Upload File (Optional)</label>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={e => setLessonFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  accept={lessonType === 'VIDEO' ? "video/*" : ".pdf,.doc,.docx"}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">XP Reward</label>
                <input 
                  type="number" 
                  value={lessonXp} 
                  onChange={e => setLessonXp(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddLesson(false)}>Cancel</Button>
              <Button 
                onClick={() => createLessonMutation.mutate()} 
                disabled={!lessonTitle || createLessonMutation.isPending}
              >
                {createLessonMutation.isPending ? 'Uploading...' : 'Save Lesson'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Assignment Modal */}
      {showAddAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold font-heading">{editAssignmentId ? 'Edit Assignment' : 'Add New Assignment'}</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Title</label>
                <input 
                  type="text" 
                  value={assignmentTitle} 
                  onChange={e => setAssignmentTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea 
                  value={assignmentDesc} 
                  onChange={e => setAssignmentDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Due Date</label>
                  <input 
                    type="date" 
                    value={assignmentDate} 
                    onChange={e => setAssignmentDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Max Score</label>
                  <input 
                    type="number" 
                    value={assignmentScore} 
                    onChange={e => setAssignmentScore(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">XP Reward</label>
                  <input 
                    type="number" 
                    value={assignmentXp} 
                    onChange={e => setAssignmentXp(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Attachment (Optional)</label>
                
                {existingAttachments.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Existing Attachments</p>
                    {existingAttachments.map((url, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                        <div className="flex items-center gap-2 truncate pr-4">
                          <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="truncate">Attachment {i + 1}</span>
                        </div>
                        <button 
                          onClick={() => setExistingAttachments(prev => prev.filter((_, index) => index !== i))}
                          className="text-danger hover:bg-danger/10 p-1.5 rounded-md transition-colors"
                          title="Remove attachment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label 
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files) {
                      setAssignmentFiles(Array.from(e.dataTransfer.files));
                    }
                  }}
                >
                  <span className="text-sm font-medium mb-1">
                    {assignmentFiles.length > 0 ? `${assignmentFiles.length} new file(s) selected` : 'Click or drag new files here'}
                  </span>
                  <input 
                    type="file" 
                    multiple
                    className="hidden"
                    onChange={e => setAssignmentFiles(e.target.files ? Array.from(e.target.files) : [])}
                  />
                </label>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setShowAddAssignment(false);
                setEditAssignmentId(null);
                setAssignmentTitle('');
                setAssignmentDesc('');
                setAssignmentDate('');
                setAssignmentScore(100);
                setAssignmentFiles([]);
              }}>Cancel</Button>
              <Button 
                onClick={() => editAssignmentId ? updateAssignmentMutation.mutate() : createAssignmentMutation.mutate()} 
                disabled={!assignmentTitle || !assignmentDate || createAssignmentMutation.isPending || updateAssignmentMutation.isPending}
              >
                {createAssignmentMutation.isPending || updateAssignmentMutation.isPending ? 'Saving...' : (editAssignmentId ? 'Update Assignment' : 'Create Assignment')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
