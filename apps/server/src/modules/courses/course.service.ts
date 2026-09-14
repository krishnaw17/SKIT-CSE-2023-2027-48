import { prisma } from '../../config/database';

export class CourseService {
  /**
   * Recalculates and updates the progress percent for a student's course enrollment
   */
  static async updateStudentProgress(studentId: string, courseId: string) {
    // 1. Get total active tasks in the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: {
            lessons: { where: { isPublished: true } },
            quizzes: { where: { status: 'PUBLISHED' } },
            assignments: { where: { status: 'PUBLISHED' } }
          }
        }
      }
    });

    if (!course) return;

    const totalTasks = 
      course._count.lessons + 
      course._count.quizzes + 
      course._count.assignments;

    if (totalTasks === 0) {
      await prisma.enrollment.updateMany({
        where: { studentId, courseId },
        data: { progressPercent: 0 }
      });
      return;
    }

    // 2. Count completed tasks by student
    const completedLessons = await prisma.lessonProgress.count({
      where: { studentId, lesson: { courseId, isPublished: true }, isCompleted: true }
    });

    // QuizAttempts can have multiple per quiz, so we need distinct
    const passedQuizzes = await prisma.quizAttempt.findMany({
      where: { studentId, quiz: { courseId, status: 'PUBLISHED' }, isPassed: true },
      distinct: ['quizId'],
      select: { id: true }
    });
    const completedQuizzesCount = passedQuizzes.length;

    const submittedAssignments = await prisma.assignmentSubmission.count({
      where: { 
        studentId, 
        assignment: { courseId, status: 'PUBLISHED' }, 
        status: { in: ['SUBMITTED', 'LATE', 'GRADED', 'RETURNED'] } 
      }
    });

    const completedTasks = completedLessons + completedQuizzesCount + submittedAssignments;
    const progressPercent = Math.min(100, Math.round((completedTasks / totalTasks) * 100));

    // 3. Update enrollment
    await prisma.enrollment.updateMany({
      where: { studentId, courseId },
      data: { progressPercent }
    });
  }

  /**
   * Recalculates progress for all students enrolled in a specific course.
   * Useful when course tasks (lessons, quizzes, assignments) are added or removed.
   */
  static async updateAllCourseEnrollmentsProgress(courseId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      select: { studentId: true }
    });
    
    for (const e of enrollments) {
      await this.updateStudentProgress(e.studentId, courseId);
    }
  }
}
