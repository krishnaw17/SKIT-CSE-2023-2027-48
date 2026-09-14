import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQuizById, updateQuiz, createQuestion, updateQuestion, deleteQuestion, generateQuizFromAI } from '@/features/quizzes/quizzes.api';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { PageLoader } from '@/components/common/PageLoader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2, Wand2, UploadCloud, Loader2, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';

export default function QuizBuilderPage() {
  const { quizId, courseId } = useParams<{ quizId: string, courseId: string }>();
  const { user } = useAuthStore();
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // If we only have quizId in route params, we'll fetch it first.
  // Actually, getQuizById requires courseId. In Teacher routes, usually we have /teacher/courses/:courseId/quizzes/:quizId
  // Let's assume courseId is passed in URL or we can extract it from the quiz data if we use a different endpoint.
  // We'll use a mocked courseId "mock" just to load it if missing, but we really need it.
  // Let's fetch using the quiz ID directly if there's a global endpoint, else we'll extract from location state if passed.
  
  const [newQuestionType, setNewQuestionType] = useState<'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER'>('MULTIPLE_CHOICE');
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [quizSettings, setQuizSettings] = useState({ title: '', description: '', xpReward: 0 });
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [questionPoints, setQuestionPoints] = useState(10);
  const [isQuestionRequired, setIsQuestionRequired] = useState(true);
  const [options, setOptions] = useState([{ text: '', isCorrect: true }, { text: '', isCorrect: false }]);

  // We actually need courseId for API. The previous page passed it via URL maybe? 
  // Wait, the router path is `/teacher/quizzes/:quizId/builder`. So courseId is not in params!
  // I'll need to fetch the quiz without courseId if possible, or I'll change the router path.
  // In `router/index.tsx`, the path is probably `/teacher/quizzes/:id/builder`.
  
  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', quizId],
    // HACK: the API requires courseId but we might not have it. Let's assume we can get it from an API without courseId.
    // If not, we'll have to pass it. Assuming apiClient.get(`/quizzes/${quizId}`) exists for teachers.
    // For now, let's use a dummy courseId to fetch, or use `courseId` from params if we fix the router.
    queryFn: () => getQuizById(courseId || 'unknown', quizId!),
    enabled: !!quizId && !!courseId
  });

  const addQuestionMutation = useMutation({
    mutationFn: () => createQuestion(quiz?.courseId!, quizId!, {
      type: newQuestionType,
      text: questionText,
      points: questionPoints,
      isRequired: isQuestionRequired,
      order: (quiz?.questions?.length || 0) + 1,
      options: options
    }),
    onSuccess: () => {
      toast.success('Question added');
      setShowAddQuestion(false);
      setEditingQuestionId(null);
      setQuestionText('');
      setOptions([{ text: '', isCorrect: true }, { text: '', isCorrect: false }]);
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
    }
  });

  const updateQuestionMutation = useMutation({
    mutationFn: () => updateQuestion(quiz?.courseId!, quizId!, editingQuestionId!, {
      type: newQuestionType,
      text: questionText,
      points: questionPoints,
      isRequired: isQuestionRequired,
      options: options
    }),
    onSuccess: () => {
      toast.success('Question updated');
      setShowAddQuestion(false);
      setEditingQuestionId(null);
      setQuestionText('');
      setOptions([{ text: '', isCorrect: true }, { text: '', isCorrect: false }]);
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
    }
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: string) => deleteQuestion(quiz?.courseId!, quizId!, questionId),
    onSuccess: () => {
      toast.success('Question deleted');
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
    }
  });

  const generateAIMutation = useMutation({
    mutationFn: () => generateQuizFromAI(quiz?.courseId!, quizId!, aiFile!),
    onSuccess: () => {
      toast.success('AI successfully generated questions!');
      setShowAIModal(false);
      setAiFile(null);
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to generate quiz from AI. Ensure GEMINI_API_KEY is valid.');
    }
  });

  const updateQuizMutation = useMutation({
    mutationFn: (updates: Partial<any>) => updateQuiz(quiz!.courseId, quizId!, updates),
    onSuccess: () => {
      toast.success('Quiz updated successfully');
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
    }
  });

  const handleAddOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const handleUpdateOption = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleSetCorrectOption = (index: number) => {
    if (newQuestionType === 'MULTIPLE_CHOICE') {
      const newOptions = options.map((opt, i) => ({ ...opt, isCorrect: i === index }));
      setOptions(newOptions);
    }
  };

  if (!courseId) {
    return <div className="p-8 text-center text-red-500">Error: courseId is missing in the URL. Please navigate from the Course Edit page.</div>;
  }

  if (isLoading) return <PageLoader />;
  if (!quiz) return <div>Quiz not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <DashboardHeader />

      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/teacher/courses/${quiz.courseId}/edit`)} className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                  {quiz.status}
                </span>
                <span className="text-sm font-semibold text-primary">Quiz Builder</span>
              </div>
              <h1 className="font-heading text-xl font-bold">{quiz.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {quiz.status === 'DRAFT' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => toast('Draft saved. This quiz will be automatically deleted in 3 days if not published.', { icon: 'ℹ️' })} 
                  className="border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  Save as Draft
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => updateQuizMutation.mutate({ status: 'PUBLISHED' })} 
                  disabled={updateQuizMutation.isPending || (!quiz.questions || quiz.questions.length === 0)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {updateQuizMutation.isPending ? 'Publishing...' : 'Publish Quiz'}
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => {
              setQuizSettings({
                title: quiz.title,
                description: quiz.description || '',
                xpReward: quiz.xpReward || 0
              });
              setShowSettingsModal(true);
            }} className="flex items-center gap-2">
              <Settings className="w-4 h-4" /> Settings
            </Button>
            <Button variant="outline" onClick={() => setShowAIModal(true)} className="flex items-center gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/30">
              <Wand2 className="w-4 h-4" /> Generate with AI
            </Button>
            <Button onClick={() => {
              setEditingQuestionId(null);
              setQuestionText('');
              setQuestionPoints(10);
              setIsQuestionRequired(true);
              setOptions([{ text: '', isCorrect: true }, { text: '', isCorrect: false }]);
              setNewQuestionType('MULTIPLE_CHOICE');
              setShowAddQuestion(true);
            }} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Question
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-6">
        
        {(!quiz.questions || quiz.questions.length === 0) ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700">
            <h3 className="font-semibold mb-1">No questions yet</h3>
            <p className="text-sm text-slate-500 mb-4">Start building your quiz by adding your first question.</p>
            <Button onClick={() => setShowAddQuestion(true)} variant="outline">Add First Question</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {quiz.questions.map((q: any, i: number) => (
              <div key={q.id} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Question {i + 1} • {q.type.replace('_', ' ')} • {q.points} Points</span>
                    <h4 className="font-semibold text-lg">{q.text}</h4>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setEditingQuestionId(q.id);
                      setQuestionText(q.text);
                      setQuestionPoints(q.points);
                      setIsQuestionRequired(q.isRequired ?? true);
                      setNewQuestionType(q.type);
                      setOptions(q.options?.length > 0 ? q.options : [{ text: '', isCorrect: true }, { text: '', isCorrect: false }]);
                      setShowAddQuestion(true);
                    }}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="icon" className="text-danger hover:bg-danger/10" onClick={() => deleteQuestionMutation.mutate(q.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {q.type === 'MULTIPLE_CHOICE' && (
                  <div className="space-y-2 mt-4">
                    {q.options?.map((opt: any) => (
                      <div key={opt.id} className={`p-3 rounded-lg border flex items-center justify-between ${opt.isCorrect ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                        <span>{opt.text}</span>
                        {opt.isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                      </div>
                    ))}
                  </div>
                )}
                {/* Additional question types can be rendered here */}
              </div>
            ))}
          </div>
        )}

      </div>

      {showAddQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold font-heading">{editingQuestionId ? 'Edit Question' : 'Add New Question'}</h2>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold mb-1">Question Type</label>
                <select 
                  value={newQuestionType}
                  onChange={(e) => setNewQuestionType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                >
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="TRUE_FALSE">True / False</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Question Text</label>
                <textarea 
                  value={questionText} 
                  onChange={e => setQuestionText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent h-24 resize-none"
                  placeholder="Enter the question here..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Points</label>
                  <input 
                    type="number" 
                    value={questionPoints} 
                    onChange={e => setQuestionPoints(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  />
                </div>
                <div className="flex items-center h-full pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isQuestionRequired} 
                      onChange={e => setIsQuestionRequired(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Compulsory Question</span>
                  </label>
                </div>
              </div>

              {newQuestionType === 'MULTIPLE_CHOICE' && (
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-semibold">Options</label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>+ Add Option</Button>
                  </div>
                  
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="correct_option" 
                        checked={opt.isCorrect} 
                        onChange={() => handleSetCorrectOption(i)}
                        className="w-5 h-5 text-primary focus:ring-primary cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={opt.text} 
                        onChange={e => handleUpdateOption(i, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                        placeholder={`Option ${i + 1}`}
                      />
                    </div>
                  ))}
                  <p className="text-xs text-slate-500">Select the radio button next to the correct answer.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setShowAddQuestion(false);
                setEditingQuestionId(null);
              }}>Cancel</Button>
              <Button 
                onClick={() => editingQuestionId ? updateQuestionMutation.mutate() : addQuestionMutation.mutate()} 
                disabled={!questionText || addQuestionMutation.isPending || updateQuestionMutation.isPending}
              >
                {(addQuestionMutation.isPending || updateQuestionMutation.isPending) ? 'Saving...' : 'Save Question'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold font-heading">Quiz Settings</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Quiz Title</label>
                <input 
                  type="text" 
                  value={quizSettings.title} 
                  onChange={e => setQuizSettings({...quizSettings, title: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea 
                  value={quizSettings.description} 
                  onChange={e => setQuizSettings({...quizSettings, description: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">XP Reward</label>
                <input 
                  type="number" 
                  value={quizSettings.xpReward} 
                  onChange={e => setQuizSettings({...quizSettings, xpReward: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSettingsModal(false)}>Cancel</Button>
              <Button 
                onClick={() => {
                  updateQuizMutation.mutate(quizSettings);
                  setShowSettingsModal(false);
                }} 
                disabled={!quizSettings.title || updateQuizMutation.isPending}
              >
                {updateQuizMutation.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/10">
              <h2 className="text-xl font-bold font-heading flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Wand2 className="w-5 h-5" /> Generate with AI
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {generateAIMutation.isPending ? (
                <div className="py-8 text-center flex flex-col items-center">
                  <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                  <h3 className="font-semibold text-lg">AI is reading your notes...</h3>
                  <p className="text-slate-500 text-sm mt-2">This may take a few moments as we extract and generate multiple-choice questions.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Upload Lecture Notes (PDF)</label>
                    <label 
                      className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          setAiFile(e.dataTransfer.files[0]);
                        }
                      }}
                    >
                      <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
                      <span className="font-semibold text-sm mb-1">{aiFile ? aiFile.name : 'Click to select a file'}</span>
                      <span className="text-xs text-slate-500">Only PDF files up to 10MB are recommended</span>
                      <input 
                        type="file" 
                        accept="application/pdf"
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setAiFile(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                  
                  {user?.role === 'ADMIN' && (
                    <div className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 p-3 rounded-lg text-xs">
                      <strong>Developer Note:</strong> Make sure GEMINI_API_KEY is configured in the server's .env file.
                    </div>
                  )}
                </>
              )}
            </div>
            
            {!generateAIMutation.isPending && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowAIModal(false)}>Cancel</Button>
                <Button 
                  onClick={() => generateAIMutation.mutate()} 
                  disabled={!aiFile}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white border-none"
                >
                  Generate Quiz
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
