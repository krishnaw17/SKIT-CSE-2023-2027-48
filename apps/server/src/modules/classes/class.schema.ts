import { z } from 'zod';

export const createClassBodySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  gradeLevel: z.string().min(1, 'Grade level is required'),
  section: z.string().min(1, 'Section is required'),
  academicSessionId: z.string().cuid('Invalid academic session ID'),
  roomNumber: z.string().optional(),
  capacity: z.number().int().min(1).optional().default(40),
  isActive: z.boolean().optional().default(true),
});

export const updateClassBodySchema = z.object({
  name: z.string().min(2).optional(),
  gradeLevel: z.string().min(1).optional(),
  section: z.string().min(1).optional(),
  academicSessionId: z.string().cuid().optional(),
  roomNumber: z.string().optional(),
  capacity: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const classIdParamSchema = z.object({
  id: z.string().cuid('Invalid class ID'),
});

export const assignSubjectBodySchema = z.object({
  subjectId: z.string().cuid('Invalid subject ID'),
  teacherId: z.string().cuid('Invalid teacher ID'),
  schedule: z.object({
    days: z.array(z.string()),
    time: z.string().optional(),
  }).optional(),
});

export const removeSubjectParamSchema = z.object({
  id: z.string().cuid('Invalid class ID'),
  subjectId: z.string().cuid('Invalid subject ID'),
});
