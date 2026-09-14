import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAssignments, getAssignmentById, submitAssignment, unsubmitAssignment } from '../features/assignments/assignments.api';

export const useAssignments = (courseId: string) => {
  return useQuery({
    queryKey: ['courses', courseId, 'assignments'],
    queryFn: () => getAssignments(courseId),
    enabled: !!courseId,
  });
};

export const useAssignment = (courseId: string, id: string) => {
  return useQuery({
    queryKey: ['courses', courseId, 'assignments', id],
    queryFn: () => getAssignmentById(courseId, id),
    enabled: !!courseId && !!id,
  });
};

export const useSubmitAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, id, textContent, files }: { courseId: string; id: string; textContent?: string; files?: File[] }) =>
      submitAssignment(courseId, id, textContent, files),
    onSuccess: (_, { courseId, id }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'assignments', id] });
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'assignments'] });
    },
  });
};

export const useUnsubmitAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, id }: { courseId: string; id: string }) =>
      unsubmitAssignment(courseId, id),
    onSuccess: (_, { courseId, id }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'assignments', id] });
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'assignments'] });
    },
  });
};
