import { prisma } from '../../config/database';
import { User, UserRole } from '@prisma/client';

export class AuthRepository {
  async findByEmail(email: string): Promise<any> {
    return prisma.user.findUnique({ 
      where: { email },
      include: { profile: true, teacherProfile: true }
    });
  }

  async findById(id: string): Promise<any> {
    return prisma.user.findUnique({ 
      where: { id },
      include: { profile: true, teacherProfile: true }
    });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    role: UserRole;
    emailVerifyToken: string;
    emailVerifyExpiry: Date;
  }): Promise<User> {
    return prisma.user.create({ data });
  }

  async createStudentProfile(userId: string, firstName: string, lastName: string) {
    return prisma.studentProfile.create({
      data: { userId, firstName, lastName },
    });
  }

  async createTeacherProfile(userId: string, firstName: string, lastName: string) {
    return prisma.teacherProfile.create({
      data: { userId, firstName, lastName },
    });
  }

  async markEmailVerified(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });
  }

  async findByVerifyToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpiry: { gte: new Date() },
      },
    });
  }

  async setPasswordResetToken(
    userId: string,
    token: string,
    expiry: Date,
  ): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { passwordResetToken: token, passwordResetExpiry: expiry },
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gte: new Date() },
      },
    });
  }

  async resetPassword(userId: string, passwordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async storeRefreshToken(data: {
    token: string;
    userId: string;
    deviceHash: string;
    deviceLabel: string;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({ data });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  async rotateRefreshToken(
    oldToken: string,
    newData: {
      token: string;
      userId: string;
      deviceHash: string;
      deviceLabel: string;
      expiresAt: Date;
    },
  ) {
    return prisma.$transaction([
      prisma.refreshToken.update({
        where: { token: oldToken },
        data: { isRevoked: true },
      }),
      prisma.refreshToken.create({ data: newData }),
    ]);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }
}
