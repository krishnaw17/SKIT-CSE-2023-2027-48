import { User, UserRole } from '@prisma/client';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthPayload {
  user: SafeUser;
  tokens: TokenPair;
}

export type SafeUser = {
  id: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: Date;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
};

export function toSafeUser(user: any): SafeUser {
  let firstName, lastName, avatarUrl;
  
  if (user.profile) {
    firstName = user.profile.firstName;
    lastName = user.profile.lastName;
    avatarUrl = user.profile.avatarUrl;
  } else if (user.teacherProfile) {
    firstName = user.teacherProfile.firstName;
    lastName = user.teacherProfile.lastName;
    avatarUrl = user.teacherProfile.avatarUrl;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    firstName,
    lastName,
    avatarUrl
  };
}
