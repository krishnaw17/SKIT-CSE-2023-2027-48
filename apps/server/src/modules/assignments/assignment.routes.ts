import { Router, IRouter } from 'express';
import { AssignmentController } from './assignment.controller';
import { authenticate } from '../../core/middleware/auth.middleware';
import { requireRole } from '../../core/middleware/rbac.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import { auditLog } from '../../core/middleware/audit.middleware';
import { upload } from '../../core/middleware/upload.middleware';
import {
  createAssignmentBodySchema,
  updateAssignmentBodySchema,
  courseIdParamSchema,
  assignmentIdParamSchema,
  submitAssignmentBodySchema,
  gradeSubmissionBodySchema,
  submissionIdParamSchema,
} from './assignment.schema';

// Mounted under /api/v1/courses/:courseId/assignments
const router: IRouter = Router({ mergeParams: true });
const controller = new AssignmentController();

router.use(authenticate);

// Public (to authenticated users)
router.get(
  '/',
  validate({ params: courseIdParamSchema }),
  controller.getAssignmentsByCourse.bind(controller)
);
router.get(
  '/:id',
  validate({ params: assignmentIdParamSchema }),
  controller.getAssignmentById.bind(controller)
);

// Student only
router.post(
  '/:id/submissions',
  requireRole('STUDENT'),
  upload.array('files', 5), // Up to 5 files
  // We skip Zod body validation for multipart to simplify, since content comes as strings.
  // In a real app we'd have a custom Zod parser for multipart fields.
  auditLog('SUBMIT', 'ASSIGNMENTS'),
  controller.submitAssignment.bind(controller)
);

router.delete(
  '/:id/submissions',
  requireRole('STUDENT'),
  validate({ params: assignmentIdParamSchema }),
  auditLog('DELETE', 'ASSIGNMENT_SUBMISSION'),
  controller.deleteSubmission.bind(controller)
);

// Admin / Teacher specific routes
router.use(requireRole('ADMIN', 'TEACHER'));

router.post(
  '/',
  upload.array('files', 5),
  auditLog('CREATE', 'ASSIGNMENTS'),
  controller.createAssignment.bind(controller)
);

router.patch(
  '/:id',
  upload.array('files', 5),
  auditLog('UPDATE', 'ASSIGNMENTS'),
  controller.updateAssignment.bind(controller)
);

router.delete(
  '/:id',
  validate({ params: assignmentIdParamSchema }),
  auditLog('DELETE', 'ASSIGNMENTS'),
  controller.deleteAssignment.bind(controller)
);

router.get(
  '/:id/submissions',
  validate({ params: assignmentIdParamSchema }),
  controller.getSubmissions.bind(controller)
);

router.patch(
  '/:id/submissions/:submissionId/grade',
  validate({ params: submissionIdParamSchema, body: gradeSubmissionBodySchema }),
  auditLog('GRADE_SUBMISSION', 'ASSIGNMENTS'),
  controller.gradeSubmission.bind(controller)
);

export { router as assignmentRouter };
