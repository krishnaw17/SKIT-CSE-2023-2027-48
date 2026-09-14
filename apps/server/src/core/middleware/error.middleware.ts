import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError, ValidationError } from '../errors';
import { logger } from '../logger';
import { sendError } from '../response';
import { env } from '../../config/env';

export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    sendError(res, 422, 'VALIDATION_ERROR', 'Validation failed', err.flatten().fieldErrors);
    return;
  }

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      sendError(res, 409, 'CONFLICT', 'A record with these details already exists');
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 404, 'NOT_FOUND', 'Record not found');
      return;
    }
  }

  // Operational errors (AppError subclasses)
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error('Non-operational AppError', { err, path: req.path });
    }
    const details = err instanceof ValidationError ? (err as ValidationError).details : undefined;
    sendError(res, err.statusCode, err.code, err.message, details);
    return;
  }

  // Unknown errors
  logger.error('Unhandled error', {
    err,
    path: req.path,
    method: req.method,
    stack: err instanceof Error ? err.stack : undefined,
  });

  sendError(
    res,
    500,
    'INTERNAL_ERROR',
    'An unexpected error occurred. Please try again later.'
  );
}
