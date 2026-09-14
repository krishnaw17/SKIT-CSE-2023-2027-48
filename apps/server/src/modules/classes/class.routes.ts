import { Router, IRouter } from 'express';
import { ClassController } from './class.controller';
import { authenticate } from '../../core/middleware/auth.middleware';
import { requireRole } from '../../core/middleware/rbac.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import { auditLog } from '../../core/middleware/audit.middleware';
import {
  createClassBodySchema,
  updateClassBodySchema,
  classIdParamSchema,
  assignSubjectBodySchema,
  removeSubjectParamSchema,
} from './class.schema';
import { attendanceRouter } from '../attendance/attendance.routes';
import { z } from 'zod';

const router: IRouter = Router();
const controller = new ClassController();

router.use(authenticate);

// Public read access for authenticated users
router.use('/:classId/attendance', attendanceRouter);

router.get('/', controller.getAllClasses);
router.get('/:id', validate({ params: classIdParamSchema }), controller.getClassById);

// Admin only mutations
router.use(requireRole('ADMIN'));

router.post(
  '/',
  validate({ body: createClassBodySchema }),
  auditLog('CREATE', 'CLASSES'),
  controller.createClass
);

router.patch(
  '/:id',
  validate({ params: classIdParamSchema, body: updateClassBodySchema }),
  auditLog('UPDATE', 'CLASSES'),
  controller.updateClass
);

router.delete(
  '/:id',
  validate({ params: classIdParamSchema }),
  auditLog('DELETE', 'CLASSES'),
  controller.deleteClass
);

// Subject assignments
router.post(
  '/:id/subjects',
  validate({ params: classIdParamSchema, body: assignSubjectBodySchema }),
  auditLog('ASSIGN_SUBJECT', 'CLASSES'),
  controller.assignSubject
);

router.delete(
  '/:id/subjects/:subjectId',
  validate({ params: removeSubjectParamSchema }),
  auditLog('REMOVE_SUBJECT', 'CLASSES'),
  controller.removeSubject
);

export { router as classRouter };
