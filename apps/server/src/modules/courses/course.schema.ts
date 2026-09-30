import { z } from 'zod';

export const createCourseBodySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  subjectId: z.string().cuid('Invalid subject ID'),
  teacherId: z.string().cuid('Invalid teacher ID'),
  classId: z.string().cuid('Invalid class ID').optional(),
  isPublished: z.boolean().optional().default(false),
  xpReward: z.number().int().min(0).optional().default(0),
  estimatedHours: z.number().min(0).optional(),
});

export const updateCourseBodySchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  subjectId: z.string().cuid().optional(),
  teacherId: z.string().cuid().optional(),
  classId: z.string().cuid().optional(),
  isPublished: z.boolean().optional(),
  xpReward: z.number().int().min(0).optional(),
  estimatedHours: z.number().min(0).optional(),
});

export const courseIdParamSchema = z.object({
  id: z.string().cuid('Invalid course ID'),
});

export const enrollStudentBodySchema = z.object({
  studentId: z.string().cuid('Invalid student ID'),
});

export const enrollmentIdParamSchema = z.object({
  courseId: z.string().cuid(),
  studentId: z.string().cuid(),
});
