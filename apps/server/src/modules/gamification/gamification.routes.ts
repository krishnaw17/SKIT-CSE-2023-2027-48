import { Router, IRouter } from 'express';
import { GamificationController } from './gamification.controller';
import { authenticate } from '../../core/middleware/auth.middleware';

const router: IRouter = Router();
const controller = new GamificationController();

router.use(authenticate);

// Get my progress
router.get('/progress', controller.getStudentProgress);

// Get global leaderboard
router.get('/leaderboard', controller.getLeaderboard);

export { router as gamificationRouter };
