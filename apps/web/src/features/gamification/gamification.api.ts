import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  color: string | null;
  category: string;
  awardedAt?: string;
  isEarned?: boolean;
}

export interface GamificationProgress {
  xp: number;
  level: {
    id: string;
    levelNumber: number;
    label: string;
    minXP: number;
    maxXP: number;
    iconUrl: string | null;
    color: string | null;
  } | null;
  nextLevel: {
    id: string;
    levelNumber: number;
    label: string;
    minXP: number;
    maxXP: number;
  } | null;
  badges: Badge[];
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string | null;
  };
}

export interface LeaderboardEntry {
  id: string;
  studentId: string;
  type: string;
  period: string;
  totalXP: number;
  rank: number;
  student: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

export const gamificationKeys = {
  all: ['gamification'] as const,
  progress: (studentId?: string) => [...gamificationKeys.all, 'progress', studentId] as const,
  leaderboard: (type: string) => [...gamificationKeys.all, 'leaderboard', type] as const,
};

export const useStudentProgress = (studentId?: string) => {
  return useQuery({
    queryKey: gamificationKeys.progress(studentId),
    queryFn: async () => {
      const url = studentId ? `/gamification/progress/${studentId}` : '/gamification/progress';
      const response = await api.get<{ success: boolean; data: GamificationProgress }>(url);
      return response.data.data;
    },
  });
};

export const useLeaderboard = (type: 'ALL_TIME' | 'WEEKLY' = 'ALL_TIME') => {
  return useQuery({
    queryKey: gamificationKeys.leaderboard(type),
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: LeaderboardEntry[] }>(`/gamification/leaderboard`, {
        params: { type }
      });
      return response.data.data;
    },
  });
};
