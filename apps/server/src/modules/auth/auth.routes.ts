import { Router, IRouter } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../core/middleware/validate.middleware';
import { authenticate } from '../../core/middleware/auth.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.schema';
import { z } from 'zod';

const router: IRouter = Router();
const controller = new AuthController();

// Public routes
router.post(
  '/register',
  validate({ body: registerSchema }),
  controller.register.bind(controller),
);

router.post(
  '/login',
  validate({ body: loginSchema }),
  controller.login.bind(controller),
);

router.post(
  '/refresh',
  validate({ body: refreshTokenSchema }),
  controller.refresh.bind(controller),
);

router.post(
  '/logout',
  validate({ body: z.object({ refreshToken: z.string() }) }),
  controller.logout.bind(controller),
);

router.get(
  '/verify-email',
  validate({ query: z.object({ token: z.string().min(1) }) as any }),
  controller.verifyEmail.bind(controller),
);

router.post(
  '/forgot-password',
  validate({ body: forgotPasswordSchema }),
  controller.forgotPassword.bind(controller),
);

router.post(
  '/reset-password',
  validate({ body: resetPasswordSchema }),
  controller.resetPassword.bind(controller),
);

// Protected routes
router.get('/me', authenticate, controller.me.bind(controller));

router.post(
  '/change-password',
  authenticate,
  validate({ body: changePasswordSchema }),
  controller.changePassword.bind(controller),
);

export { router as authRouter };
