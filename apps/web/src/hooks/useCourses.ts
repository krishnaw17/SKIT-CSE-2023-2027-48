import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getCourses, 
  getCourseById, 
  enrollInCourse, 
  getLessons, 
  getLessonById, 
  markLessonComplete 
} from '../features/courses/courses.api';

export const useCourses = (params?: { subjectId?: string; teacherId?: string }) => {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => getCourses(params),
  });
};

export const useCourse = (id: string) => {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: () => getCourseById(id),
    enabled: !!id,
  });
};

export const useEnroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => {
      return enrollInCourse(courseId);
    },
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
    },
  });
};

export const useLessons = (courseId: string) => {
  return useQuery({
    queryKey: ['courses', courseId, 'lessons'],
    queryFn: () => getLessons(courseId),
    enabled: !!courseId,
  });
};

export const useLesson = (courseId: string, lessonId: string) => {
  return useQuery({
    queryKey: ['courses', courseId, 'lessons', lessonId],
    queryFn: () => getLessonById(courseId, lessonId),
    enabled: !!courseId && !!lessonId,
  });
};

export const useMarkLessonComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, lessonId, watchedSeconds }: { courseId: string; lessonId: string; watchedSeconds?: number }) =>
      markLessonComplete(courseId, lessonId, watchedSeconds),
    onSuccess: (_, { courseId, lessonId }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'lessons', lessonId] });
    },
  });
};
