import apiClient from '../../lib/api';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  subjectId: string;
  teacherId: string;
  isPublished: boolean;
  xpReward: number;
  estimatedHours: number | null;
  createdAt: string;
  updatedAt: string;
  subject?: any;
  teacher?: any;
  _count?: { enrollments: number; lessons: number };
  isEnrolled?: boolean;
  progressPercent?: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  type: 'VIDEO' | 'DOCUMENT' | 'TEXT' | 'LINK';
  contentUrl: string | null;
  contentText: string | null;
  duration: number | null;
  order: number;
  isPublished: boolean;
  xpReward: number;
}

export const getCourses = async (params?: { subjectId?: string; teacherId?: string }) => {
  const { data } = await apiClient.get<{ success: boolean; data: Course[] }>('/courses', { params });
  return data.data;
};

export const getCourseById = async (id: string) => {
  const { data } = await apiClient.get<{ success: boolean; data: Course & { lessons: Lesson[] } }>(`/courses/${id}`);
  return data.data;
};

export const enrollInCourse = async (courseId: string) => {
  const { data } = await apiClient.post<{ success: boolean; data: any }>(`/courses/${courseId}/enroll`);
  return data.data;
};

export const unenrollFromCourse = async (courseId: string) => {
  const { data } = await apiClient.delete<{ success: boolean; data: any }>(`/courses/${courseId}/enroll`);
  return data.data;
};

export const getLessons = async (courseId: string) => {
  const { data } = await apiClient.get<{ success: boolean; data: Lesson[] }>(`/courses/${courseId}/lessons`);
  return data.data;
};

export const getLessonById = async (courseId: string, lessonId: string) => {
  const { data } = await apiClient.get<{ success: boolean; data: Lesson }>(`/courses/${courseId}/lessons/${lessonId}`);
  return data.data;
};

export const markLessonComplete = async (courseId: string, lessonId: string, watchedSeconds?: number) => {
  const { data } = await apiClient.post<{ success: boolean; data: any }>(`/courses/${courseId}/lessons/${lessonId}/progress`, { watchedSeconds });
  return data.data;
};

// --- Teacher Specific APIs ---

export const createCourse = async (payload: Partial<Course>) => {
  const { data } = await apiClient.post<{ success: boolean; data: Course }>('/courses', payload);
  return data.data;
};

export const updateCourse = async (id: string, payload: Partial<Course>) => {
  const { data } = await apiClient.patch<{ success: boolean; data: Course }>(`/courses/${id}`, payload);
  return data.data;
};

export const deleteCourse = async (id: string) => {
  const { data } = await apiClient.delete<{ success: boolean; data: any }>(`/courses/${id}`);
  return data.data;
};

// Lesson mutations (FormData is used because of file uploads)
export const createLesson = async (courseId: string, formData: FormData) => {
  const { data } = await apiClient.post<{ success: boolean; data: Lesson }>(`/courses/${courseId}/lessons`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

export const updateLesson = async (courseId: string, lessonId: string, formData: FormData) => {
  const { data } = await apiClient.patch<{ success: boolean; data: Lesson }>(`/courses/${courseId}/lessons/${lessonId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

export const deleteLesson = async (courseId: string, lessonId: string) => {
  const { data } = await apiClient.delete<{ success: boolean; data: any }>(`/courses/${courseId}/lessons/${lessonId}`);
  return data.data;
};
