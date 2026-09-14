import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getQuizzes, 
  getQuizById, 
  startQuizAttempt, 
  saveQuizAnswer, 
  submitQuizAttempt 
} from '../features/quizzes/quizzes.api';

export const useQuizzes = (courseId: string) => {
  return useQuery({
    queryKey: ['courses', courseId, 'quizzes'],
    queryFn: () => getQuizzes(courseId),
    enabled: !!courseId,
  });
};

export const useQuiz = (courseId: string, id: string) => {
  return useQuery({
    queryKey: ['courses', courseId, 'quizzes', id],
    queryFn: () => getQuizById(courseId, id),
    enabled: !!courseId && !!id,
  });
};

export const useStartQuizAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, id }: { courseId: string; id: string }) => startQuizAttempt(courseId, id),
    onSuccess: (_, { courseId, id }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'quizzes', id] });
    },
  });
};

export const useSaveQuizAnswer = () => {
  return useMutation({
    mutationFn: ({ 
      courseId, id, attemptId, questionId, selectedOptionId, textAnswer 
    }: { 
      courseId: string; id: string; attemptId: string; questionId: string; selectedOptionId?: string; textAnswer?: string 
    }) => saveQuizAnswer(courseId, id, attemptId, questionId, selectedOptionId, textAnswer),
    // Not invalidating query here to avoid lag on every selection. Can invalidate on submit.
  });
};

export const useSubmitQuizAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, id, attemptId }: { courseId: string; id: string; attemptId: string }) => 
      submitQuizAttempt(courseId, id, attemptId),
    onSuccess: (_, { courseId, id }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'quizzes', id] });
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'quizzes'] });
    },
  });
};
