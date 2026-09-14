import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface AdminDashboardStats {
  stats: {
    totalStudents: number;
    totalTeachers: number;
    activeClasses: number;
    totalCourses: number;
    totalXPAwarded: number;
  };
  systemHealth: {
    database: string;
    uptime: number;
    version: string;
  };
  recentLogs: any[];
}

export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
};

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: AdminDashboardStats }>('/api/v1/admin/dashboard');
      return response.data.data;
    },
  });
};
