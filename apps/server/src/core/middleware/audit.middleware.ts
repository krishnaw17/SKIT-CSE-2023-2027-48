import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { logger } from '../logger';

/**
 * Audit log middleware — records every mutating request.
 * Should be applied after authenticate middleware.
 * Logs asynchronously — does not block the request.
 */
export function auditLog(action: string, resource: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // Fire-and-forget — do not await, do not block
    if (req.user) {
      const isMutation = ['POST', 'PUT', 'PATCH'].includes(req.method);

      prisma.auditLog
        .create({
          data: {
            actorId: req.user.id,
            action,
            resource,
            resourceId: req.params['id'] ?? null,
            newValue: isMutation && req.body !== undefined ? (req.body as object) : Prisma.JsonNull,
            ipAddress: req.ip ?? null,
            userAgent: req.get('user-agent') ?? null,
          },
        })
        .catch((err) => logger.error('Failed to write audit log', { err }));
    }
    next();
  };
}
