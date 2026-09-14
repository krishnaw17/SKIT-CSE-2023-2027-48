import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodEffects, z } from 'zod';
import { ValidationError } from '../errors';

type ZodSchema = AnyZodObject | ZodEffects<AnyZodObject>;

interface ValidationTargets {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Validates req.body, req.query, and/or req.params against Zod schemas.
 * Replaces parsed data back onto the request so controllers receive typed data.
 */
export function validate(schemas: ValidationTargets) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query) as typeof req.query;
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params) as typeof req.params;
      }
      next();
    } catch (err) {
      next(new ValidationError('Validation failed', err));
    }
  };
}

// Common reusable param schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  q: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().cuid(),
});
