import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { logger } from './core/logger';
import { globalErrorHandler } from './core/middleware/error.middleware';
import { authRouter } from './modules/auth/auth.routes';
import { subjectRouter } from './modules/subjects/subject.routes';
import { classRouter } from './modules/classes/class.routes';
import { courseRouter } from './modules/courses/course.routes';
import { gamificationRouter } from './modules/gamification/gamification.routes';
import { teacherRouter } from './modules/teacher/teacher.routes';
import { adminRouter } from './modules/admin/admin.routes';
// Future module routers imported here as they are built

const app: Express = express();

// ============================================================================
// Security middleware
// ============================================================================

app.set('trust proxy', 1); // Required for rate limiting behind reverse proxies

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ============================================================================
// Rate limiting
// ============================================================================

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 auth attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Too many authentication attempts' },
  },
});

app.use(globalLimiter);

// ============================================================================
// Body parsing & compression
// ============================================================================

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// HTTP request logging
// ============================================================================

app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.url === '/health',
  }),
);

// ============================================================================
// Routes
// ============================================================================

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/auth', authLimiter, authRouter);
app.use('/api/v1/subjects', subjectRouter);
app.use('/api/v1/classes', classRouter);
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/gamification', gamificationRouter);
app.use('/api/v1/teacher', teacherRouter);
app.use('/api/v1/admin', adminRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  });
});

// ============================================================================
// Global error handler — MUST be last
// ============================================================================

app.use(globalErrorHandler);

export { app };
