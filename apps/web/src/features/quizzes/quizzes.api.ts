import apiClient from '../../lib/api';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  order: number;
}

export interface QuizQuestion {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  text: string;
  imageUrl: string | null;
  order: number;
  points: number;
  options: QuizOption[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  attemptNumber: number;
  score: number | null;
  maxScore: number | null;
  isPassed: boolean | null;
  startedAt: string;
  submittedAt: string | null;
  timeTaken: number | null;
  xpAwarded: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  timeLimit: number | null;
  maxAttempts: number;
  passingScore: number;
  xpReward: number;
  xpBonusPerfect: number;
  questions?: QuizQuestion[];
  myAttempts?: QuizAttempt[];
  _count?: { questions: number };
}

export const getQuizzes = async (courseId: string) => {
  const { data } = await apiClient.get<{ success: boolean; data: Quiz[] }>(`/courses/${courseId}/quizzes`);
  return data.data;
};

export const getQuizById = async (courseId: string, id: string) => {
  const { data } = await apiClient.get<{ success: boolean; data: Quiz }>(`/courses/${courseId}/quizzes/${id}`);
  return data.data;
};

// Teacher API endpoints
export const createQuiz = async (courseId: string, payload: Partial<Quiz>) => {
  const { data } = await apiClient.post<{ success: boolean; data: Quiz }>(`/courses/${courseId}/quizzes`, payload);
  return data.data;
};

export const updateQuiz = async (courseId: string, id: string, payload: Partial<Quiz>) => {
  const { data } = await apiClient.patch<{ success: boolean; data: Quiz }>(`/courses/${courseId}/quizzes/${id}`, payload);
  return data.data;
};

export const deleteQuiz = async (courseId: string, id: string) => {
  const { data } = await apiClient.delete<{ success: boolean; data: any }>(`/courses/${courseId}/quizzes/${id}`);
  return data.data;
};

export const generateQuizFromAI = async (courseId: string, id: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await apiClient.post<{ success: boolean; data: any[] }>(
    `/courses/${courseId}/quizzes/${id}/generate`, 
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data.data;
};

export const createQuestion = async (courseId: string, quizId: string, payload: any) => {
  const { data } = await apiClient.post<{ success: boolean; data: QuizQuestion }>(`/courses/${courseId}/quizzes/${quizId}/questions`, payload);
  return data.data;
};

export const updateQuestion = async (courseId: string, quizId: string, questionId: string, payload: any) => {
  const { data } = await apiClient.patch<{ success: boolean; data: QuizQuestion }>(`/courses/${courseId}/quizzes/${quizId}/questions/${questionId}`, payload);
  return data.data;
};

export const deleteQuestion = async (courseId: string, quizId: string, questionId: string) => {
  const { data } = await apiClient.delete<{ success: boolean; data: any }>(`/courses/${courseId}/quizzes/${quizId}/questions/${questionId}`);
  return data.data;
};

// Student API endpoints
export const startQuizAttempt = async (courseId: string, id: string) => {
  const { data } = await apiClient.post<{ success: boolean; data: QuizAttempt }>(`/courses/${courseId}/quizzes/${id}/attempts`);
  return data.data;
};

export const saveQuizAnswer = async (
  courseId: string, 
  id: string, 
  attemptId: string, 
  questionId: string, 
  selectedOptionId?: string, 
  textAnswer?: string
) => {
  const { data } = await apiClient.put<{ success: boolean; data: any }>(
    `/courses/${courseId}/quizzes/${id}/attempts/${attemptId}/answers`,
    { questionId, selectedOptionId, textAnswer }
  );
  return data.data;
};

export const submitQuizAttempt = async (courseId: string, id: string, attemptId: string) => {
  const { data } = await apiClient.post<{ success: boolean; data: QuizAttempt }>(
    `/courses/${courseId}/quizzes/${id}/attempts/${attemptId}/submit`
  );
  return data.data;
};
