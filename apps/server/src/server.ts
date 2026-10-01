import 'dotenv/config';
import { app } from './app';
import { env } from './config/env';
import { logger } from './core/logger';
import { prisma } from './config/database';
import { verifyMailer } from './config/mailer';
import { BadgeService } from './modules/gamification/badge.service';
import { LevelService } from './modules/gamification/level.service';
import { StreakService } from './modules/gamification/streak.service';

async function bootstrap(): Promise<void> {
  // Verify database connection
  try {
    await prisma.$connect();
    logger.info('✅ Database connected');
  } catch (err) {
    logger.error('❌ Database connection failed', { err });
    process.exit(1);
  }

  // Verify mailer (non-fatal)
  await verifyMailer();

  // Initialize Gamification listeners
  BadgeService.init();
  LevelService.init();
  StreakService.init();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 GLMS API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal} — shutting down gracefully`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Server closed');
      process.exit(0);
    });

    // Force exit after 10s
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection', { reason });
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', { err });
    process.exit(1);
  });
}

bootstrap();
