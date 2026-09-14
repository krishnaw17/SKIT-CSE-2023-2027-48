import { Router, IRouter } from 'express';
import { AttendanceController } from './attendance.controller';
import { authenticate } from '../../core/middleware/auth.middleware';
import { requireRole } from '../../core/middleware/rbac.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import { auditLog } from '../../core/middleware/audit.middleware';
import {
  markAttendanceBodySchema,
  bulkMarkAttendanceBodySchema,
  attendanceParamsSchema,
} from './attendance.schema';

// Mounted under /api/v1/classes/:classId/attendance
const router: IRouter = Router({ mergeParams: true });
const controller = new AttendanceController();

router.use(authenticate);

// Public (to authenticated users)
router.get(
  '/',
  validate({ params: attendanceParamsSchema }),
  controller.getAttendance.bind(controller)
);

// Admin / Teacher specific routes
router.use(requireRole('ADMIN', 'TEACHER'));

router.post(
  '/',
  validate({ params: attendanceParamsSchema, body: markAttendanceBodySchema }),
  auditLog('MARK_ATTENDANCE', 'ATTENDANCE'),
  controller.markAttendance.bind(controller)
);

router.post(
  '/bulk',
  validate({ params: attendanceParamsSchema, body: bulkMarkAttendanceBodySchema }),
  auditLog('BULK_MARK_ATTENDANCE', 'ATTENDANCE'),
  controller.bulkMarkAttendance.bind(controller)
);

export { router as attendanceRouter };
