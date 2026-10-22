import { prisma } from '../../config/database';
import { NotFoundError } from '../../core/errors';

export interface CourseTaskBreakdown {
  totalLessons: number;
  completedLessons: number;
  totalQuizzes: number;
  passedQuizzes: number;
  totalAssignments: number;
  submittedAssignments: number;
  totalTasks: number;
  completedTasks: number;
  progressPercent: number;
}

export interface StudentCourseAnalytics {
  courseId: string;
  courseTitle: string;
  studentId: string;
  breakdown: CourseTaskBreakdown;
  lastActivityAt?: Date;
  xpEarnedInCourse: number;
  isCompleted: boolean;
}

export interface CourseTeacherMetrics {
  courseId: string;
  title: string;
  totalEnrolled: number;
  averageProgress: number;
  completionRate: number;
  pendingSubmissionsCount: number;
  activeStudentsLast7Days: number;
}

export class CourseAnalyticsService {
  /**
   * Retrieves a comprehensive task breakdown and progress analytics for a student in a course
   */
  static async getStudentCourseAnalytics(studentId: string, courseId: string): Promise<StudentCourseAnalytics> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: {
            lessons: { where: { isPublished: true } },
            quizzes: { where: { status: 'PUBLISHED' } },
            assignments: { where: { status: 'PUBLISHED' } },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundError('Course');
    }

    const totalLessons = course._count.lessons;
    const totalQuizzes = course._count.quizzes;
    const totalAssignments = course._count.assignments;
    const totalTasks = totalLessons + totalQuizzes + totalAssignments;

    // Lessons progress
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        studentId,
        lesson: { courseId, isPublished: true },
        isCompleted: true,
      },
    });

    // Quizzes passed (distinct per quiz)
    const passedQuizzesAttempts = await prisma.quizAttempt.findMany({
      where: {
        studentId,
        quiz: { courseId, status: 'PUBLISHED' },
        isPassed: true,
      },
      distinct: ['quizId'],
      select: { id: true },
    });
    const passedQuizzes = passedQuizzesAttempts.length;

    // Assignments submitted/graded
    const submittedAssignments = await prisma.assignmentSubmission.count({
      where: {
        studentId,
        assignment: { courseId, status: 'PUBLISHED' },
        status: { in: ['SUBMITTED', 'LATE', 'GRADED', 'RETURNED'] },
      },
    });

    const completedTasks = completedLessons + passedQuizzes + submittedAssignments;
    const progressPercent = totalTasks > 0 ? Math.min(100, Math.round((completedTasks / totalTasks) * 100)) : 0;

    // XP earned by student from this course's lessons
    const courseLessons = await prisma.lesson.findMany({
      where: { courseId },
      select: { id: true },
    });
    const lessonIds = courseLessons.map((l) => l.id);

    const xpAgg = await prisma.xPTransaction.aggregate({
      where: {
        studentId,
        referenceId: { in: lessonIds },
      },
      _sum: { amount: true },
    });

    return {
      courseId: course.id,
      courseTitle: course.title,
      studentId,
      breakdown: {
        totalLessons,
        completedLessons,
        totalQuizzes,
        passedQuizzes,
        totalAssignments,
        submittedAssignments,
        totalTasks,
        completedTasks,
        progressPercent,
      },
      xpEarnedInCourse: xpAgg._sum.amount || 0,
      isCompleted: progressPercent === 100,
    };
  }

  /**
   * Generates aggregated metrics for instructors on course performance and student engagement
   */
  static async getCourseTeacherMetrics(courseId: string): Promise<CourseTeacherMetrics> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true },
    });

    if (!course) {
      throw new NotFoundError('Course');
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      select: { progressPercent: true, studentId: true, updatedAt: true },
    });

    const totalEnrolled = enrollments.length;
    if (totalEnrolled === 0) {
      return {
        courseId,
        title: course.title,
        totalEnrolled: 0,
        averageProgress: 0,
        completionRate: 0,
        pendingSubmissionsCount: 0,
        activeStudentsLast7Days: 0,
      };
    }

    const totalProgress = enrollments.reduce((acc, curr) => acc + (curr.progressPercent || 0), 0);
    const averageProgress = Math.round(totalProgress / totalEnrolled);
    const completedCount = enrollments.filter((e) => (e.progressPercent || 0) >= 100).length;
    const completionRate = Math.round((completedCount / totalEnrolled) * 100);

    // Pending assignment submissions needing grading
    const pendingSubmissionsCount = await prisma.assignmentSubmission.count({
      where: {
        assignment: { courseId, status: 'PUBLISHED' },
        status: 'SUBMITTED',
      },
    });

    // Active students in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeStudentsLast7Days = enrollments.filter((e) => e.updatedAt >= sevenDaysAgo).length;

    return {
      courseId,
      title: course.title,
      totalEnrolled,
      averageProgress,
      completionRate,
      pendingSubmissionsCount,
      activeStudentsLast7Days,
    };
  }

  /**
   * Validates course completion eligibility before issuing certificate or rewards
   */
  static async verifyCourseCompletionEligibility(studentId: string, courseId: string): Promise<boolean> {
    const analytics = await this.getStudentCourseAnalytics(studentId, courseId);
    return analytics.isCompleted;
  }
}
