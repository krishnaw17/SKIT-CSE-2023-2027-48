import { Router, IRouter } from 'express';
import { AdminController } from './admin.controller';
import { authenticate } from '../../core/middleware/auth.middleware';
import { requireRole } from '../../core/middleware/rbac.middleware';

const router: IRouter = Router();
const controller = new AdminController();

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/dashboard', controller.getDashboardStats.bind(controller));

export { router as adminRouter };
