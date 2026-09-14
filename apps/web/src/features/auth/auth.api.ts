import apiClient from '@/lib/api';
import type { AxiosResponse } from 'axios';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Auth DTOs
export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'STUDENT' | 'TEACHER';
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthPayload {
  user: {
    id: string;
    email: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
    isEmailVerified: boolean;
    createdAt: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const unwrap = <T>(response: AxiosResponse<ApiResponse<T>>): T => response.data.data;

export const authApi = {
  register: (dto: RegisterDto) =>
    apiClient
      .post<ApiResponse<{ id: string; email: string }>>('/auth/register', dto)
      .then(unwrap),

  login: (dto: LoginDto) =>
    apiClient.post<ApiResponse<AuthPayload>>('/auth/login', dto).then(unwrap),

  logout: (refreshToken: string) =>
    apiClient.post<ApiResponse<null>>('/auth/logout', { refreshToken }).then(unwrap),

  refresh: (refreshToken: string) =>
    apiClient
      .post<ApiResponse<TokenPair>>('/auth/refresh', { refreshToken })
      .then(unwrap),

  me: () =>
    apiClient
      .get<ApiResponse<AuthPayload['user']>>('/auth/me')
      .then(unwrap),

  verifyEmail: (token: string) =>
    apiClient
      .get<ApiResponse<null>>(`/auth/verify-email?token=${token}`)
      .then(unwrap),

  forgotPassword: (email: string) =>
    apiClient
      .post<ApiResponse<null>>('/auth/forgot-password', { email })
      .then(unwrap),

  resetPassword: (data: { token: string; password: string; confirmPassword: string }) =>
    apiClient.post<ApiResponse<null>>('/auth/reset-password', data).then(unwrap),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => apiClient.post<ApiResponse<null>>('/auth/change-password', data).then(unwrap),
};
