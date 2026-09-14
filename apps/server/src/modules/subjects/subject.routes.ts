import { Router, IRouter } from 'express';
import { SubjectController } from './subject.controller';
import { authenticate } from '../../core/middleware/auth.middleware';
import { requireRole } from '../../core/middleware/rbac.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import { auditLog } from '../../core/middleware/audit.middleware';
import { createSubjectBodySchema, updateSubjectBodySchema, subjectIdParamSchema } from './subject.schema';

const router: IRouter = Router();
const controller = new SubjectController();

// All routes require authentication
router.use(authenticate);

// Public read access for authenticated users (Students/Teachers)
router.get('/', controller.getAllSubjects);
router.get('/:id', validate({ params: subjectIdParamSchema }), controller.getSubjectById);

// Admin & Teacher routes for mutations
router.use(requireRole('ADMIN', 'TEACHER'));

router.post(
  '/',
  validate({ body: createSubjectBodySchema }),
  auditLog('CREATE', 'SUBJECTS'),
  controller.createSubject
);

router.patch(
  '/:id',
  validate({ params: subjectIdParamSchema, body: updateSubjectBodySchema }),
  auditLog('UPDATE', 'SUBJECTS'),
  controller.updateSubject
);

router.delete(
  '/:id',
  validate({ params: subjectIdParamSchema }),
  auditLog('DELETE', 'SUBJECTS'),
  controller.deleteSubject
);

export { router as subjectRouter };
