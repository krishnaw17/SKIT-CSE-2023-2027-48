import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz, useStartQuizAttempt, useSaveQuizAnswer, useSubmitQuizAttempt } from '../../hooks/useQuizzes';
import { DashboardHeader } from '../../components/layout/DashboardHeader';
import { PageLoader } from '../../components/common/PageLoader';
import { Button } from '../../components/common/Button';
import { ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

export default function QuizAttemptPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const navigate = useNavigate();
  
  const { data: quiz, isLoading: isQuizLoading } = useQuiz(courseId!, quizId!);
  const startMutation = useStartQuizAttempt();
  const saveAnswerMutation = useSaveQuizAnswer();
  const submitMutation = useSubmitQuizAttempt();

  const [activeAttempt, setActiveAttempt] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Initialization
  useEffect(() => {
    if (quiz && !activeAttempt && !startMutation.isPending && !startMutation.isSuccess) {
      // Check if we already have an active attempt from backend data (if included, or we just try starting one)
      startMutation.mutate({ courseId: courseId!, id: quizId! }, {
        onSuccess: (data) => {
          setActiveAttempt(data);
          if (quiz.timeLimit && !data.submittedAt) {
            const elapsed = Math.floor((new Date().getTime() - new Date(data.startedAt).getTime()) / 1000);
            const remaining = (quiz.timeLimit * 60) - elapsed;
            setTimeLeft(Math.max(0, remaining));
          }
        },
        onError: () => {
          // Maybe max attempts reached, navigate back
          navigate('/student/quizzes');
        }
      });
    }
  }, [quiz]);

  // Timer
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && activeAttempt && !activeAttempt.submittedAt) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev && prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, activeAttempt]);

  if (isQuizLoading || !quiz || !activeAttempt) {
    return <PageLoader />;
  }

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleOptionSelect = (optionId: string) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: { selectedOptionId: optionId } }));
    saveAnswerMutation.mutate({
      courseId: courseId!,
      id: quizId!,
      attemptId: activeAttempt.id,
      questionId: currentQuestion.id,
      selectedOptionId: optionId
    });
  };

  const handleTextChange = (text: string) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: { textAnswer: text } }));
  };

  const handleTextBlur = () => {
    if (!currentQuestion) return;
    const answer = answers[currentQuestion.id]?.textAnswer;
    if (answer !== undefined) {
      saveAnswerMutation.mutate({
        courseId: courseId!,
        id: quizId!,
        attemptId: activeAttempt.id,
        questionId: currentQuestion.id,
        textAnswer: answer
      });
    }
  };

  const handleNext = () => {
    if (!isLastQuestion) setCurrentQuestionIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (!isFirstQuestion) setCurrentQuestionIndex(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (window.confirm('Are you sure you want to submit your quiz? You cannot change your answers after submitting.')) {
      submitMutation.mutate({ courseId: courseId!, id: quizId!, attemptId: activeAttempt.id }, {
        onSuccess: (data) => {
          setActiveAttempt(data);
        }
      });
    }
  };

  const handleAutoSubmit = () => {
    submitMutation.mutate({ courseId: courseId!, id: quizId!, attemptId: activeAttempt.id }, {
      onSuccess: (data) => {
        setActiveAttempt(data);
        alert("Time's up! Your quiz has been automatically submitted.");
      }
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (activeAttempt.submittedAt) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <DashboardHeader />
        <div className="flex-1 max-w-3xl mx-auto w-full py-12 animate-fade-up text-center mt-12">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 shadow-sm">
            {activeAttempt.isPassed ? (
              <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
            ) : (
              <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            )}
          <h1 className="text-4xl font-heading font-bold mb-4">Quiz Completed!</h1>
          <p className="text-lg text-muted-foreground mb-8">You scored {activeAttempt.score} out of {activeAttempt.maxScore}</p>
          
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => navigate('/student/courses')}>Back to Courses</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <DashboardHeader />
      
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 animate-fade-up">
        {/* Header & Progress */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-heading font-bold line-clamp-1">{quiz.title}</h1>
          
          <div className="flex items-center gap-4">
            {timeLeft !== null && (
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg",
                timeLeft < 60 ? "bg-red-500/10 text-red-500 animate-pulse" : "bg-secondary text-secondary-foreground"
              )}>
                <Clock className="w-5 h-5" />
                {formatTime(timeLeft)}
              </div>
            )}
            <Button variant="primary" onClick={handleSubmit} isLoading={submitMutation.isPending}>Submit Quiz</Button>
          </div>
        </div>

        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
          <div className="flex justify-between mt-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Completed</span>
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500" key={currentQuestion.id}>
            <div className="mb-8">
              <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-md mb-4 uppercase tracking-wider">
                {currentQuestion.type.replace('_', ' ')} • {currentQuestion.points} points
              </span>
            <h2 className="text-2xl font-bold leading-snug">{currentQuestion.text}</h2>
            {currentQuestion.imageUrl && (
              <img src={currentQuestion.imageUrl} alt="Question Context" className="mt-6 rounded-xl max-h-[300px] object-cover mx-auto" />
            )}
          </div>

          <div className="space-y-4">
            {(currentQuestion.type === 'MULTIPLE_CHOICE' || currentQuestion.type === 'TRUE_FALSE') && (
              currentQuestion.options?.map((option: any) => {
                const isSelected = answers[currentQuestion.id]?.selectedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4 group",
                      isSelected 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "border-border/50 bg-background hover:border-primary/30 hover:bg-muted/30"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                      isSelected ? "border-primary" : "border-muted-foreground group-hover:border-primary/50"
                    )}>
                      {isSelected && <div className="w-3 h-3 bg-primary rounded-full" />}
                    </div>
                    <span className={cn("font-medium", isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                      {option.text}
                    </span>
                  </button>
                )
              })
            )}

            {currentQuestion.type === 'SHORT_ANSWER' && (
              <textarea
                className="w-full min-h-[150px] p-4 bg-background border-2 border-border/50 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-y text-lg"
                placeholder="Type your answer here..."
                value={answers[currentQuestion.id]?.textAnswer || ''}
                onChange={(e) => handleTextChange(e.target.value)}
                onBlur={handleTextBlur}
              />
            )}
          </div>
        </div>
      )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button variant="outline" onClick={handlePrev} disabled={isFirstQuestion} size="lg" className="border-slate-200 dark:border-slate-800">
            <ChevronLeft className="w-5 h-5 mr-2" /> Previous
          </Button>
          <Button variant={isLastQuestion ? 'primary' : 'outline'} onClick={isLastQuestion ? handleSubmit : handleNext} size="lg" className={isLastQuestion ? "bg-primary text-white" : "border-slate-200 dark:border-slate-800"}>
            {isLastQuestion ? 'Submit Quiz' : 'Next Question'} {!isLastQuestion && <ChevronRight className="w-5 h-5 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
