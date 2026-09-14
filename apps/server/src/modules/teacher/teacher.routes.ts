import { Router, IRouter } from 'express';
import { TeacherController } from './teacher.controller';
import { authenticate } from '../../core/middleware/auth.middleware';
import { requireRole } from '../../core/middleware/rbac.middleware';

const router: IRouter = Router();
const controller = new TeacherController();

router.use(authenticate);
router.use(requireRole('TEACHER', 'ADMIN'));

router.get('/dashboard', controller.getDashboardStats.bind(controller));
router.get('/submissions/pending', controller.getPendingSubmissions.bind(controller));
router.get('/submissions/graded', controller.getGradedSubmissions.bind(controller));

export { router as teacherRouter };
