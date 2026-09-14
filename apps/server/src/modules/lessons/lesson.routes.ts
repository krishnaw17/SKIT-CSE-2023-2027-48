import { Router, IRouter } from 'express';
import { LessonController } from './lesson.controller';
import { authenticate } from '../../core/middleware/auth.middleware';
import { requireRole } from '../../core/middleware/rbac.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import { auditLog } from '../../core/middleware/audit.middleware';
import { upload } from '../../core/middleware/upload.middleware';
import {
  createLessonBodySchema,
  updateLessonBodySchema,
  courseIdParamSchema,
  lessonIdParamSchema,
} from './lesson.schema';
import { z } from 'zod';

// Note: Mounted under /api/v1/courses/:courseId/lessons
const router: IRouter = Router({ mergeParams: true });
const controller = new LessonController();

router.use(authenticate);

// Public (to authenticated users)
router.get(
  '/',
  validate({ params: courseIdParamSchema }),
  controller.getLessonsByCourse.bind(controller)
);
router.get(
  '/:id',
  validate({ params: lessonIdParamSchema }),
  controller.getLessonById.bind(controller)
);

// Student only
router.post(
  '/:id/progress',
  requireRole('STUDENT'),
  validate({ params: lessonIdParamSchema, body: z.object({ watchedSeconds: z.number().optional() }) }),
  controller.markLessonComplete.bind(controller)
);

// Admin / Teacher specific routes
router.use(requireRole('ADMIN', 'TEACHER'));

// Note: Using multer for multipart/form-data
router.post(
  '/',
  upload.single('file'),
  // We don't validate body with Zod here when it's multipart because values come in as strings.
  // A custom middleware or manual validation is better for multipart, but for simplicity we rely on the controller.
  auditLog('CREATE', 'LESSONS'),
  controller.createLesson.bind(controller)
);

router.patch(
  '/:id',
  upload.single('file'),
  auditLog('UPDATE', 'LESSONS'),
  controller.updateLesson.bind(controller)
);

router.delete(
  '/:id',
  validate({ params: lessonIdParamSchema }),
  auditLog('DELETE', 'LESSONS'),
  controller.deleteLesson.bind(controller)
);

export { router as lessonRouter };
