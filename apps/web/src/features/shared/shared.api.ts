import apiClient from '@/lib/api';

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
}

export interface Class {
  id: string;
  name: string;
  gradeLevel: string;
  section: string;
  academicSessionId: string;
  capacity: number;
}

export const getSubjects = async () => {
  const { data } = await apiClient.get<{ success: boolean; data: Subject[] }>('/subjects');
  return data.data;
};

export const createSubject = async (payload: { name: string; code: string; description?: string; color?: string }) => {
  const { data } = await apiClient.post<{ success: boolean; data: Subject }>('/subjects', payload);
  return data.data;
};

export const getClasses = async () => {
  const { data } = await apiClient.get<{ success: boolean; data: Class[] }>('/classes');
  return data.data;
};
