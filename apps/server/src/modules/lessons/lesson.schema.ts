import { z } from 'zod';

export const createLessonBodySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  type: z.enum(['VIDEO', 'DOCUMENT', 'TEXT', 'LINK']),
  contentText: z.string().optional(),
  contentUrl: z.string().url().optional(),
  duration: z.coerce.number().int().min(0).optional(),
  order: z.coerce.number().int().min(0),
  isPublished: z.coerce.boolean().optional().default(false),
  xpReward: z.coerce.number().int().min(0).optional().default(5),
});

export const updateLessonBodySchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  type: z.enum(['VIDEO', 'DOCUMENT', 'TEXT', 'LINK']).optional(),
  contentText: z.string().optional(),
  contentUrl: z.string().url().optional(),
  duration: z.coerce.number().int().min(0).optional(),
  order: z.coerce.number().int().min(0).optional(),
  isPublished: z.coerce.boolean().optional(),
  xpReward: z.coerce.number().int().min(0).optional(),
});

export const courseIdParamSchema = z.object({
  courseId: z.string().cuid('Invalid course ID'),
});

export const lessonIdParamSchema = z.object({
  courseId: z.string().cuid(),
  id: z.string().cuid('Invalid lesson ID'),
});
