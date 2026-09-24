import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../config/database';
import bcrypt from 'bcryptjs';

jest.mock('../../config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    studentProfile: {
      create: jest.fn(),
    },
    teacherProfile: {
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

describe('Authentication API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('R-01: should register a new student successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'student@test.com',
        role: 'STUDENT',
      });
      (prisma.studentProfile.create as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'student@test.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          role: 'STUDENT'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('R-03: should return error for duplicate email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-2' });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'existing@test.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          role: 'TEACHER'
        });

      expect(res.status).toBe(409); // Conflict
      expect(res.body.success).toBe(false);
    });

    it('R-05: should return error for password mismatch', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'student2@test.com',
          password: 'Password123!',
          confirmPassword: 'DifferentPassword!',
          role: 'STUDENT'
        });

      expect(res.status).toBe(400); // Bad Request
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('L-01: should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'student@test.com',
        passwordHash: hashedPassword,
        role: 'STUDENT',
        isActive: true,
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'student@test.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens).toBeDefined();
    });

    it('L-04: should return error for wrong password', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'student@test.com',
        passwordHash: hashedPassword,
        role: 'STUDENT',
        isActive: true,
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'student@test.com',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
