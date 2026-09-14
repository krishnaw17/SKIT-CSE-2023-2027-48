import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { sendSuccess } from '../../core/response';
import { BadRequestError, NotFoundError } from '../../core/errors';

export class TeacherController {
  async getDashboardStats(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      
      const profile = await prisma.teacherProfile.findUnique({ where: { userId } });
      if (!profile) throw new BadRequestError('Teacher profile not found');

      // 1. Total Courses (Only Published)
      const coursesCount = await prisma.course.count({
        where: { teacherId: profile.id, isPublished: true }
      });

      // 2. Total Students Enrolled (Unique Students)
      const uniqueStudents = await prisma.enrollment.findMany({
        where: { course: { teacherId: profile.id } },
        select: { studentId: true },
        distinct: ['studentId']
      });
      const enrollmentsCount = uniqueStudents.length;

      // 3. Pending assignments (submitted but not graded)
      const pendingGrading = await prisma.assignmentSubmission.count({
        where: {
          assignment: { course: { teacherId: profile.id } },
          status: 'SUBMITTED',
          score: null
        }
      });

      const recentQuizzes = await prisma.quiz.findMany({
        where: { teacherId: profile.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          _count: { select: { attempts: true } }
        }
      });

      // Real-time chart data (Enrollments over the last 5 days)
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 4);
      fiveDaysAgo.setHours(0, 0, 0, 0);

      const recentEnrolls = await prisma.enrollment.findMany({
        where: {
          course: { teacherId: profile.id },
          enrolledAt: { gte: fiveDaysAgo }
        },
        select: { enrolledAt: true }
      });

      const chartDataMap = new Map<string, number>();
      for (let i = 4; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        chartDataMap.set(d.toLocaleDateString('en-US', { weekday: 'short' }), 0);
      }

      recentEnrolls.forEach(e => {
        const dateStr = e.enrolledAt.toLocaleDateString('en-US', { weekday: 'short' });
        if (chartDataMap.has(dateStr)) {
          chartDataMap.set(dateStr, chartDataMap.get(dateStr)! + 1);
        }
      });

      const chartData = Array.from(chartDataMap.entries()).map(([day, count]) => ({
        name: day,
        score: count
      }));

      // Fetch Recent Assignments for Average
      const recentAssignments = await prisma.assignment.findMany({
        where: { course: { teacherId: profile.id } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          submissions: {
            where: { status: { in: ['GRADED', 'RETURNED'] } },
            select: { score: true }
          }
        }
      });

      // Fetch Recent Quizzes for Average
      const recentQuizzesForAvg = await prisma.quiz.findMany({
        where: { course: { teacherId: profile.id } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          attempts: {
            where: { submittedAt: { not: null } },
            select: { score: true, maxScore: true }
          }
        }
      });

      const activities: { date: Date; name: string; score: number }[] = [];

      recentAssignments.forEach(assignment => {
        const gradedSubs = assignment.submissions.filter(s => s.score !== null);
        let avgPercentage = 0;
        
        if (gradedSubs.length > 0 && assignment.maxScore > 0) {
          const totalScore = gradedSubs.reduce((sum, sub) => sum + (sub.score || 0), 0);
          const avgScore = totalScore / gradedSubs.length;
          avgPercentage = Math.round((avgScore / assignment.maxScore) * 100);
        }

        activities.push({
          date: assignment.createdAt,
          name: assignment.title.length > 12 ? assignment.title.substring(0, 10) + '..' : assignment.title,
          score: avgPercentage
        });
      });

      recentQuizzesForAvg.forEach(quiz => {
        const attempts = quiz.attempts.filter(a => a.score !== null && a.maxScore !== null && a.maxScore > 0);
        let avgPercentage = 0;

        if (attempts.length > 0) {
          const totalPct = attempts.reduce((sum, a) => sum + ((a.score! / a.maxScore!) * 100), 0);
          avgPercentage = Math.round(totalPct / attempts.length);
        }

        activities.push({
          date: quiz.createdAt,
          name: quiz.title.length > 12 ? quiz.title.substring(0, 10) + '..' : quiz.title,
          score: avgPercentage
        });
      });

      // Sort combined activities by date descending, take top 5, then reverse to chronological order for the chart
      activities.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      const classAverageData = activities.slice(0, 5).reverse().map(item => ({
        name: item.name,
        score: item.score
      }));

      // Calculate overall average completion for the stats card
      let avgCompletion = 0;
      if (classAverageData.length > 0) {
        avgCompletion = Math.round(classAverageData.reduce((sum, item) => sum + item.score, 0) / classAverageData.length);
      }

      return sendSuccess(res, {
        stats: {
          coursesCount,
          studentsCount: enrollmentsCount,
          pendingGrading,
          activeQuizzes: recentQuizzes.length,
          avgCompletion
        },
        recentQuizzes,
        chartData,
        classAverageData
      });
    } catch (error: any) {
      // DEBUG: return error as 200 so UI doesn't crash and we can see what it is
      return sendSuccess(res, {
        stats: {
          coursesCount: -1, // -1 indicates error
          studentsCount: -1,
          pendingGrading: 0,
          activeQuizzes: 0,
          avgCompletion: 0,
          error: error.message || error.toString()
        },
        recentQuizzes: [],
        chartData: [],
        classAverageData: []
      });
    }
  }

  async getPendingSubmissions(req: Request, res: Response) {
    const profile = await prisma.teacherProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw new NotFoundError('Teacher Profile');

    const submissions = await prisma.assignmentSubmission.findMany({
      where: {
        status: 'SUBMITTED',
        assignment: { teacherId: profile.id }
      },
      include: {
        student: { select: { firstName: true, lastName: true, avatarUrl: true } },
        assignment: { select: { id: true, title: true, maxScore: true, courseId: true, course: { select: { title: true } } } }
      },
      orderBy: { submittedAt: 'asc' }
    });

    return sendSuccess(res, submissions);
  }

  async getGradedSubmissions(req: Request, res: Response) {
    const profile = await prisma.teacherProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw new NotFoundError('Teacher Profile');

    const submissions = await prisma.assignmentSubmission.findMany({
      where: {
        status: { in: ['GRADED', 'RETURNED'] },
        assignment: { teacherId: profile.id }
      },
      include: {
        student: { select: { firstName: true, lastName: true, avatarUrl: true } },
        assignment: { select: { id: true, title: true, maxScore: true, courseId: true, course: { select: { title: true } } } }
      },
      orderBy: { gradedAt: 'desc' }
    });

    return sendSuccess(res, submissions);
  }
}
