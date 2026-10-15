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
  courseQuerySchema,
} from './course.schema';
import { lessonRouter } from '../lessons/lesson.routes';
import { assignmentRouter } from '../assignments/assignment.routes';
import { quizRouter } from '../quizzes/quiz.routes';

const router: IRouter = Router();
const controller = new CourseController();

router.use(authenticate);

// Public (to authenticated users)
router.use('/:courseId/lessons', lessonRouter);
router.use('/:courseId/assignments', assignmentRouter);
router.use('/:courseId/quizzes', quizRouter);
router.get('/', validate({ query: courseQuerySchema }), controller.getAllCourses);
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
