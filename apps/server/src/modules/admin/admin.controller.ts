import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { sendSuccess } from '../../core/response';

export class AdminController {
  async getDashboardStats(req: Request, res: Response) {
    // 1. Total Users By Role
    const userStats = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    });

    const students = userStats.find(s => s.role === 'STUDENT')?._count.id || 0;
    const teachers = userStats.find(s => s.role === 'TEACHER')?._count.id || 0;
    
    // 2. Total Active Classes
    const activeClasses = await prisma.class.count({
      where: { isActive: true }
    });

    // 3. Total Courses
    const totalCourses = await prisma.course.count();

    // 4. System Health (mock for MVP)
    const systemHealth = {
      database: 'Connected',
      uptime: process.uptime(),
      version: '1.0.0'
    };
    
    // 5. Total XP Awarded
    const xpAggregate = await prisma.xPTransaction.aggregate({
      _sum: { amount: true }
    });
    
    // 6. Recent Audit Logs
    const recentLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        actor: { select: { email: true, role: true } }
      }
    });

    return sendSuccess(res, {
      stats: {
        totalStudents: students,
        totalTeachers: teachers,
        activeClasses,
        totalCourses,
        totalXPAwarded: xpAggregate._sum.amount || 0
      },
      systemHealth,
      recentLogs
    });
  }
}
