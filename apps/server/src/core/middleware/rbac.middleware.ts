import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../errors';

/**
 * Role-Based Access Control middleware.
 * Usage: router.get('/admin', authenticate, requireRole('ADMIN'), handler)
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `This action requires one of these roles: ${roles.join(', ')}`,
        ),
      );
    }
    next();
  };
}

/**
 * Self-or-admin guard — allows a user to access their own resource,
 * or admin to access any resource.
 * @param getResourceOwnerId - function to extract owner id from the request
 */
export function requireSelfOrAdmin(
  getResourceOwnerId: (req: Request) => string | undefined,
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    const ownerId = getResourceOwnerId(req);
    if (req.user.role === UserRole.ADMIN || req.user.id === ownerId) {
      return next();
    }
    next(new ForbiddenError('You do not have permission to access this resource'));
  };
}
