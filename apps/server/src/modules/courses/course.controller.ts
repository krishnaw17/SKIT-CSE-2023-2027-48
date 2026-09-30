import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { sendSuccess, sendCreated, sendNoContent } from '../../core/response';
import { ConflictError, NotFoundError, BadRequestError } from '../../core/errors';
import { Prisma } from '@prisma/client';

export class CourseController {
  async createCourse(req: Request, res: Response) {
    const { title, description, thumbnailUrl, subjectId, teacherId, classId, isPublished, xpReward, estimatedHours } = req.body;

    const [subject, teacher] = await Promise.all([
      prisma.subject.findUnique({ where: { id: subjectId } }),
      prisma.teacherProfile.findUnique({ where: { userId: teacherId } }),
    ]);

    if (!subject) throw new BadRequestError('Subject not found');
    if (!teacher) throw new BadRequestError('Teacher not found');

    if (classId) {
      const cls = await prisma.class.findUnique({ where: { id: classId } });
      if (!cls) throw new BadRequestError('Class not found');
    }

    const course = await prisma.course.create({
      data: { title, description, thumbnailUrl, subjectId, teacherId: teacher.id, classId, isPublished, xpReward, estimatedHours },
    });

    return sendCreated(res, course, 'Course created successfully');
  }

  async getAllCourses(req: Request, res: Response) {
    const subjectId = req.query['subjectId'] as string | undefined;
    const teacherId = req.query['teacherId'] as string | undefined;

    const query: Prisma.CourseWhereInput = {};
    if (subjectId) query.subjectId = subjectId;
    if (teacherId) {
      query.teacher = { userId: teacherId };
    }

    if (req.user?.role === 'STUDENT') {
      query.isPublished = true;
    }

    const courses = await prisma.course.findMany({
      where: query,
      include: {
        subject: true,
        teacher: { include: { user: { select: { email: true, isActive: true } } } },
        _count: { select: { enrollments: true, lessons: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    let resultCourses = courses as any[];

    if (req.user?.role === 'STUDENT') {
      const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
      if (studentProfile) {
        const enrollments = await prisma.enrollment.findMany({
          where: { studentId: studentProfile.id },
          select: { courseId: true, progressPercent: true }
        });
        
        const enrollmentMap = new Map(enrollments.map(e => [e.courseId, e.progressPercent]));
        
        resultCourses = courses.map(course => ({
          ...course,
          isEnrolled: enrollmentMap.has(course.id),
          progressPercent: enrollmentMap.get(course.id) || 0
        }));
      }
    }

    return sendSuccess(res, resultCourses);
  }

  async getCourseById(req: Request, res: Response) {
    const id = req.params.id as string;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        subject: true,
        teacher: { include: { user: { select: { email: true, isActive: true } } } },
        lessons: { orderBy: { order: 'asc' } },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) throw new NotFoundError('Course');

    // If student, check if they are enrolled
    if (req.user?.role === 'STUDENT') {
      const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
      if (studentProfile) {
        const enrollment = await prisma.enrollment.findUnique({
          where: { studentId_courseId: { studentId: studentProfile.id, courseId: id } },
        });
        (course as any).isEnrolled = !!enrollment;
        (course as any).progressPercent = enrollment?.progressPercent ?? 0;
      }
    }

    return sendSuccess(res, course);
  }

  async updateCourse(req: Request, res: Response) {
    const id = req.params.id as string;
    const { title, description, thumbnailUrl, subjectId, teacherId, classId, isPublished, xpReward, estimatedHours } = req.body;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundError('Course');

    if (subjectId && subjectId !== course.subjectId) {
      const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
      if (!subject) throw new BadRequestError('Subject not found');
    }

    if (teacherId && teacherId !== course.teacherId) {
      const teacher = await prisma.teacherProfile.findUnique({ where: { id: teacherId } });
      if (!teacher) throw new BadRequestError('Teacher not found');
    }
    if (classId && classId !== course.classId) {
      const cls = await prisma.class.findUnique({ where: { id: classId } });
      if (!cls) throw new BadRequestError('Class not found');
    }

    const updated = await prisma.course.update({
      where: { id },
      data: { title, description, thumbnailUrl, subjectId, teacherId, classId, isPublished, xpReward, estimatedHours },
    });

    return sendSuccess(res, updated, { message: 'Course updated successfully' });
  }

  async deleteCourse(req: Request, res: Response) {
    const id = req.params.id as string;

    const course = await prisma.course.findUnique({
      where: { id },
      include: { _count: { select: { enrollments: true, lessons: true, assignments: true, quizzes: true } } },
    });

    if (!course) throw new NotFoundError('Course');

    if (course._count.enrollments > 0) {
      throw new BadRequestError('Cannot delete course with active enrollments.');
    }

    await prisma.course.delete({ where: { id } });

    return sendNoContent(res);
  }

  async enrollStudent(req: Request, res: Response) {
    const courseId = req.params.id as string;
    
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new BadRequestError('Student profile not found');
    const studentId = student.id;

    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course) throw new NotFoundError('Course');
    if (!student) throw new NotFoundError('Student');
    if (!course.isPublished) throw new BadRequestError('Cannot enroll in unpublished course');

    const existing = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });

    if (existing) {
      throw new ConflictError('Student is already enrolled in this course');
    }

    const enrollment = await prisma.enrollment.create({
      data: { studentId, courseId },
    });

    return sendCreated(res, enrollment, 'Successfully enrolled in course');
  }

  async unenrollStudent(req: Request, res: Response) {
    const courseId = req.params.id as string;
    
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new BadRequestError('Student profile not found');

    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: student.id, courseId } },
    });

    if (!enrollment) throw new NotFoundError('Enrollment not found');

    await prisma.enrollment.delete({
      where: { id: enrollment.id },
    });

    return sendNoContent(res);
  }

  async removeStudent(req: Request, res: Response) {
    const courseId = req.params.id as string;
    const studentId = req.params.studentId as string;

    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });

    if (!enrollment) throw new NotFoundError('Enrollment');

    await prisma.enrollment.delete({
      where: { id: enrollment.id },
    });

    return sendNoContent(res);
  }
}
