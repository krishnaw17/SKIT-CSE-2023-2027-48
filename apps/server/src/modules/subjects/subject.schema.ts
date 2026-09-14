import { z } from 'zod';

export const createSubjectBodySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters').toUpperCase(),
  description: z.string().optional(),
  iconUrl: z.string().url('Must be a valid URL').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color').optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateSubjectBodySchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).toUpperCase().optional(),
  description: z.string().optional(),
  iconUrl: z.string().url().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  isActive: z.boolean().optional(),
});

export const subjectIdParamSchema = z.object({
  id: z.string().cuid('Invalid subject ID'),
});
