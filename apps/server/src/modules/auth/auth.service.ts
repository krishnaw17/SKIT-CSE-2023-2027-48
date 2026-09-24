import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { AuthRepository } from './auth.repository';
import { EmailService } from '../notifications/email.service';
import { env } from '../../config/env';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../../core/errors';
import type {
  AuthPayload,
  TokenPair,
  SafeUser,
} from './auth.types';
import { toSafeUser } from './auth.types';
import type {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './auth.schema';

const BCRYPT_ROUNDS = 12;
const VERIFY_TOKEN_TTL_HOURS = 24;
const RESET_TOKEN_TTL_MINUTES = 30;

export class AuthService {
  private readonly repo = new AuthRepository();
  private readonly emailService = new EmailService();

  async register(dto: RegisterDto): Promise<SafeUser> {
    const existing = await this.repo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyExpiry = new Date(
      Date.now() + VERIFY_TOKEN_TTL_HOURS * 60 * 60 * 1000,
    );

    const user = await this.repo.createUser({
      email: dto.email,
      passwordHash,
      role: dto.role as UserRole,
      emailVerifyToken: verifyToken,
      emailVerifyExpiry: verifyExpiry,
    });

    // Create role-specific profile
    if (dto.role === 'STUDENT') {
      await this.repo.createStudentProfile(user.id, dto.firstName, dto.lastName);
    } else if (dto.role === 'TEACHER') {
      await this.repo.createTeacherProfile(user.id, dto.firstName, dto.lastName);
    }

    // Send verification email (non-blocking)
    this.emailService
      .sendVerificationEmail(user.email, dto.firstName, verifyToken)
      .catch(() => {});

    return toSafeUser(user);
  }

  async login(
    dto: LoginDto,
    deviceInfo: { userAgent: string; ip: string },
  ): Promise<AuthPayload> {
    const user = await this.repo.findByEmail(dto.email);
    if (!user) {
      // Constant-time to prevent user enumeration
      await bcrypt.compare('dummy', '$2b$12$dummy.hash.to.prevent.timing.attacks.xxxxxx');
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = await this.generateTokenPair(user.id, user.role, deviceInfo);
    await this.repo.updateLastLogin(user.id);

    return { user: toSafeUser(user), tokens };
  }

  async refresh(
    dto: RefreshTokenDto,
    deviceInfo: { userAgent: string; ip: string },
  ): Promise<TokenPair> {
    const storedToken = await this.repo.findRefreshToken(dto.refreshToken);

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      // If token was already revoked, possible token theft — revoke all
      if (storedToken?.isRevoked) {
        await this.repo.revokeAllUserTokens(storedToken.userId);
        throw new UnauthorizedError('Token reuse detected — all sessions invalidated');
      }
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const deviceHash = this.hashDevice(deviceInfo.userAgent, deviceInfo.ip);
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = this.getRefreshExpiry();

    await this.repo.rotateRefreshToken(dto.refreshToken, {
      token: refreshToken,
      userId: storedToken.userId,
      deviceHash,
      deviceLabel: this.labelDevice(deviceInfo.userAgent),
      expiresAt,
    });

    const accessToken = this.signAccessToken(
      storedToken.userId,
      storedToken.user.role,
      storedToken.user.email,
    );

    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    const token = await this.repo.findRefreshToken(refreshToken);
    if (token && !token.isRevoked) {
      await this.repo.revokeRefreshToken(refreshToken);
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.repo.findByVerifyToken(token);
    if (!user) {
      throw new BadRequestError('Invalid or expired verification token');
    }
    await this.repo.markEmailVerified(user.id);
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.repo.findByEmail(dto.email);
    // Always succeed to prevent user enumeration
    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await this.repo.setPasswordResetToken(user.id, resetToken, expiry);

    const profile = await this.getDisplayName(user.id, user.role);
    this.emailService
      .sendPasswordResetEmail(user.email, profile, resetToken)
      .catch(() => {});
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await this.repo.findByResetToken(dto.token);
    if (!user) {
      throw new BadRequestError('Invalid or expired password reset token');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    await this.repo.resetPassword(user.id, passwordHash);
    // Revoke all sessions after password reset
    await this.repo.revokeAllUserTokens(user.id);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.repo.findById(userId);
    if (!user) throw new NotFoundError('User');

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.repo.updatePassword(userId, passwordHash);
    await this.repo.revokeAllUserTokens(userId);
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private async generateTokenPair(
    userId: string,
    role: UserRole,
    deviceInfo: { userAgent: string; ip: string },
  ): Promise<TokenPair> {
    const user = await this.repo.findById(userId);
    if (!user) throw new NotFoundError('User');

    const accessToken = this.signAccessToken(userId, role, user.email);
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const deviceHash = this.hashDevice(deviceInfo.userAgent, deviceInfo.ip);

    await this.repo.storeRefreshToken({
      token: refreshToken,
      userId,
      deviceHash,
      deviceLabel: this.labelDevice(deviceInfo.userAgent),
      expiresAt: this.getRefreshExpiry(),
    });

    return { accessToken, refreshToken };
  }

  private signAccessToken(userId: string, role: UserRole, email: string): string {
    return jwt.sign(
      { sub: userId, role, email },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as string } as jwt.SignOptions,
    );
  }

  private hashDevice(userAgent: string, ip: string): string {
    return crypto
      .createHash('sha256')
      .update(`${userAgent}:${ip}`)
      .digest('hex');
  }

  private labelDevice(userAgent: string): string {
    if (/mobile/i.test(userAgent)) return 'Mobile Browser';
    if (/chrome/i.test(userAgent)) return 'Chrome';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/safari/i.test(userAgent)) return 'Safari';
    return 'Unknown Browser';
  }

  private getRefreshExpiry(): Date {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  }

  private async getDisplayName(userId: string, role: UserRole): Promise<string> {
    const { prisma } = await import('../../config/database');
    if (role === 'STUDENT') {
      const p = await prisma.studentProfile.findUnique({ where: { userId } });
      return p ? `${p.firstName} ${p.lastName}` : 'Student';
    }
    if (role === 'TEACHER') {
      const p = await prisma.teacherProfile.findUnique({ where: { userId } });
      return p ? `${p.firstName} ${p.lastName}` : 'Teacher';
    }
    return 'User';
  }
}
