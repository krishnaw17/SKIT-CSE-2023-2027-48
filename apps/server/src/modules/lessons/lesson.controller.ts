import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { sendSuccess, sendCreated, sendNoContent } from '../../core/response';
import { NotFoundError, BadRequestError } from '../../core/errors';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary.util';
import { CourseService } from '../courses/course.service';

export class LessonController {
  private async verifyCourseAccess(courseId: string, userId: string, role: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundError('Course');

    if (role === 'TEACHER') {
      const profile = await prisma.teacherProfile.findUnique({ where: { userId } });
      if (course.teacherId !== profile?.id) {
        throw new BadRequestError('You do not have permission to modify this course');
      }
    }
    return course;
  }

  async createLesson(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    await this.verifyCourseAccess(courseId, req.user!.id, req.user!.role);

    const { title, description, type, contentText, duration, order, isPublished, xpReward } = req.body;
    let contentUrl = req.body.contentUrl;

    if (req.file) {
      const resourceType = type === 'VIDEO' ? 'video' : 'raw';
      const ext = req.file.originalname.split('.').pop()?.toLowerCase();
      const uploadResult = await uploadToCloudinary(req.file.buffer, `glms/courses/${courseId}/lessons`, resourceType, ext);
      contentUrl = uploadResult.secure_url;
    }

    if ((type === 'VIDEO' || type === 'DOCUMENT') && !contentUrl) {
      throw new BadRequestError(`${type} lessons require a file upload or contentUrl`);
    }

    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        title,
        description,
        type,
        contentText,
        contentUrl,
        duration: duration ? Number(duration) : null,
        order: order !== undefined && order !== null ? Number(order) : 0,
        isPublished: isPublished === 'true' || isPublished === true,
        xpReward: xpReward ? Number(xpReward) : 5,
      },
    });

    await CourseService.updateAllCourseEnrollmentsProgress(courseId);

    return sendCreated(res, lesson, 'Lesson created successfully');
  }

  async getLessonsByCourse(req: Request, res: Response) {
    const courseId = req.params.courseId as string;

    const query: any = { courseId };
    if (req.user?.role === 'STUDENT') {
      query.isPublished = true;
    }

    const lessons = await prisma.lesson.findMany({
      where: query,
      orderBy: { order: 'asc' },
    });

    return sendSuccess(res, lessons);
  }

  async getLessonById(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    const id = req.params.id as string;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson || lesson.courseId !== courseId) throw new NotFoundError('Lesson');

    // Students only see published lessons
    if (req.user?.role === 'STUDENT' && !lesson.isPublished) {
      throw new NotFoundError('Lesson');
    }

    return sendSuccess(res, lesson);
  }

  async updateLesson(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    const id = req.params.id as string;
    await this.verifyCourseAccess(courseId, req.user!.id, req.user!.role);

    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson || lesson.courseId !== courseId) throw new NotFoundError('Lesson');

    const { title, description, type, contentText, duration, order, isPublished, xpReward } = req.body;
    let contentUrl = req.body.contentUrl !== undefined ? req.body.contentUrl : lesson.contentUrl;

    if (req.file) {
      const resourceType = (type || lesson.type) === 'VIDEO' ? 'video' : 'raw';
      const ext = req.file.originalname.split('.').pop()?.toLowerCase();
      const uploadResult = await uploadToCloudinary(req.file.buffer, `glms/courses/${courseId}/lessons`, resourceType, ext);
      contentUrl = uploadResult.secure_url;
      
      // Optionally delete old file if it was hosted on Cloudinary
      // (This requires extracting publicId from secure_url, omitted for brevity but standard practice)
    }

    const updated = await prisma.lesson.update({
      where: { id },
      data: {
        title,
        description,
        type,
        contentText,
        contentUrl,
        duration: duration !== undefined ? Number(duration) : lesson.duration,
        order: order !== undefined ? Number(order) : lesson.order,
        isPublished: isPublished !== undefined ? (isPublished === 'true' || isPublished === true) : lesson.isPublished,
        xpReward: xpReward !== undefined ? Number(xpReward) : lesson.xpReward,
      },
    });

    if (updated.isPublished !== lesson.isPublished) {
      await CourseService.updateAllCourseEnrollmentsProgress(courseId);
    }

    return sendSuccess(res, updated, { message: 'Lesson updated successfully' });
  }

  async deleteLesson(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    const id = req.params.id as string;
    await this.verifyCourseAccess(courseId, req.user!.id, req.user!.role);

    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson || lesson.courseId !== courseId) throw new NotFoundError('Lesson');

    await prisma.lesson.delete({ where: { id } });

    if (lesson.isPublished) {
      await CourseService.updateAllCourseEnrollmentsProgress(courseId);
    }

    return sendNoContent(res);
  }

  async markLessonComplete(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    const id = req.params.id as string;
    const { watchedSeconds } = req.body;

    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!studentProfile) throw new BadRequestError('Student profile not found');

    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson || lesson.courseId !== courseId) throw new NotFoundError('Lesson');

    const existingProgress = await prisma.lessonProgress.findUnique({
      where: { studentId_lessonId: { studentId: studentProfile.id, lessonId: id } }
    });

    if (existingProgress && existingProgress.isCompleted) {
      return sendSuccess(res, existingProgress, { message: 'Lesson already completed' });
    }

    const updateData: any = {
      isCompleted: true,
      completedAt: new Date(),
    };
    if (watchedSeconds !== undefined) {
      updateData.watchedSeconds = Number(watchedSeconds);
    }

    const progress = await prisma.lessonProgress.upsert({
      where: { studentId_lessonId: { studentId: studentProfile.id, lessonId: id } },
      update: updateData,
      create: {
        studentId: studentProfile.id,
        lessonId: id,
        isCompleted: true,
        completedAt: new Date(),
        watchedSeconds: watchedSeconds ? Number(watchedSeconds) : 0
      }
    });

    // Award XP
    if (lesson.xpReward > 0 && !existingProgress?.isCompleted) {
       await prisma.xPTransaction.create({
         data: {
           studentId: studentProfile.id,
           source: 'MANUAL_AWARD', // Or a new XPSource for LESSON_COMPLETION
           amount: lesson.xpReward,
           description: `Completed lesson: ${lesson.title}`,
           referenceId: lesson.id
         }
       });
       // In a full system, you would also trigger level up checks here or via events
    }

    // Update course progress accurately based on completed tasks
    await CourseService.updateStudentProgress(studentProfile.id, courseId);

    return sendSuccess(res, progress, { message: 'Lesson marked as complete' });
  }
}
