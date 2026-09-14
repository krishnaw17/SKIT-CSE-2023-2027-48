import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface TeacherDashboardStats {
  stats: {
    coursesCount: number;
    studentsCount: number;
    pendingGrading: number;
    avgCompletion: number;
  };
  recentQuizzes: any[]; // We can properly type this later if needed
  chartData: { name: string, score: number }[];
  classAverageData: { name: string, score: number }[];
}

export const teacherKeys = {
  all: ['teacher'] as const,
  dashboard: () => [...teacherKeys.all, 'dashboard'] as const,
  pendingSubmissions: () => [...teacherKeys.all, 'submissions', 'pending'] as const,
  gradedSubmissions: () => [...teacherKeys.all, 'submissions', 'graded'] as const,
};

export const useTeacherDashboard = () => {
  return useQuery({
    queryKey: teacherKeys.dashboard(),
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: TeacherDashboardStats }>('/teacher/dashboard');
      return response.data.data;
    },
  });
};

export const usePendingSubmissions = () => {
  return useQuery({
    queryKey: teacherKeys.pendingSubmissions(),
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: any[] }>('/teacher/submissions/pending');
      return response.data.data;
    },
  });
};

export const useGradedSubmissions = () => {
  return useQuery({
    queryKey: teacherKeys.gradedSubmissions(),
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: any[] }>('/teacher/submissions/graded');
      return response.data.data;
    },
  });
};
