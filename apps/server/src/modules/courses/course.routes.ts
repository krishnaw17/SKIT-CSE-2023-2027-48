import { Router, IRouter } from 'express';
import { CourseController } from './course.controller';
import { authenticate } from '../../core/middleware/auth.middleware';
import { requireRole } from '../../core/middleware/rbac.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import { auditLog } from '../../core/middleware/audit.middleware';
import {
  createCourseBodySchema,
  updateCourseBodySchema,
  courseIdParamSchema,
  enrollmentIdParamSchema,
} from './course.schema';
import { lessonRouter } from '../lessons/lesson.routes';
import { assignmentRouter } from '../assignments/assignment.routes';
import { quizRouter } from '../quizzes/quiz.routes';

const router: IRouter = Router();
const controller = new CourseController();

router.get('/debug-all', async (req, res) => {
  const { prisma } = require('../../config/database');
  const course = await prisma.course.findUnique({ where: { id: "cmsymu5az0005skihfql4a02h" } });
  const teacherId = course?.teacherId;
  const profile = await prisma.teacherProfile.findUnique({ where: { id: teacherId } });
  
  const coursesCount = await prisma.course.count({
    where: { teacherId: profile?.id, isPublished: true }
  });
  
  const enrollmentsCount = await prisma.enrollment.findMany({
    where: { course: { teacherId: profile?.id } },
    select: { studentId: true },
    distinct: ['studentId']
  });

  const rawCourses = await prisma.course.findMany({
    where: { teacherId: profile?.id }
  });

  res.json({ 
    coursesCount, 
    enrollmentsLength: enrollmentsCount.length, 
    profileId: profile?.id, 
    profileUserId: profile?.userId,
    rawCourses
  });
});

router.get('/debug-dashboard', async (req, res) => {
  const { prisma } = require('../../config/database');
  const userId = "cmsiwiyjs00005fni3b3qbesn";
  const profile = await prisma.teacherProfile.findUnique({ where: { userId } });
  
  const coursesCount = await prisma.course.count({
    where: { teacherId: profile?.id, isPublished: true }
  });

  const uniqueStudents = await prisma.enrollment.findMany({
    where: { course: { teacherId: profile?.id } },
    select: { studentId: true },
    distinct: ['studentId']
  });

  const pendingGrading = await prisma.assignmentSubmission.count({
    where: {
      assignment: { course: { teacherId: profile?.id } },
      status: 'SUBMITTED',
      score: null
    }
  });

  res.json({
    stats: {
      coursesCount,
      studentsCount: uniqueStudents.length,
      pendingGrading,
    },
    profileId: profile?.id
  });
});

router.use(authenticate);

// Public (to authenticated users)
router.use('/:courseId/lessons', lessonRouter);
router.use('/:courseId/assignments', assignmentRouter);
router.use('/:courseId/quizzes', quizRouter);
router.get('/', controller.getAllCourses);
router.get('/:id', validate({ params: courseIdParamSchema }), controller.getCourseById);

// Student Enrollments
router.post(
  '/:id/enroll',
  requireRole('STUDENT'),
  validate({ params: courseIdParamSchema }),
  auditLog('ENROLL_STUDENT', 'COURSES'),
  controller.enrollStudent
);

router.delete(
  '/:id/enroll',
  requireRole('STUDENT'),
  validate({ params: courseIdParamSchema }),
  auditLog('UNENROLL_STUDENT', 'COURSES'),
  controller.unenrollStudent
);

// Admin / Teacher specific routes
router.use(requireRole('ADMIN', 'TEACHER'));

router.post(
  '/',
  validate({ body: createCourseBodySchema }),
  auditLog('CREATE', 'COURSES'),
  controller.createCourse
);

router.patch(
  '/:id',
  validate({ params: courseIdParamSchema, body: updateCourseBodySchema }),
  auditLog('UPDATE', 'COURSES'),
  controller.updateCourse
);

router.delete(
  '/:id',
  validate({ params: courseIdParamSchema }),
  auditLog('DELETE', 'COURSES'),
  controller.deleteCourse
);

// Enrollments
router.delete(
  '/:id/enroll/:studentId',
  validate({ params: enrollmentIdParamSchema }),
  auditLog('REMOVE_STUDENT', 'COURSES'),
  controller.removeStudent
);

export { router as courseRouter };
