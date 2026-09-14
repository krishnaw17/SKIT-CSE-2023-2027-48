import { z } from 'zod';

export const createAssignmentBodySchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  dueDate: z.coerce.date(),
  maxScore: z.coerce.number().min(0).default(100),
  passingScore: z.coerce.number().min(0).default(50),
  allowLate: z.coerce.boolean().default(false),
  latePenaltyPct: z.coerce.number().min(0).max(100).default(0),
  xpReward: z.coerce.number().min(0).default(15),
  instructions: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).default('DRAFT'),
});

export const updateAssignmentBodySchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  dueDate: z.coerce.date().optional(),
  maxScore: z.coerce.number().min(0).optional(),
  passingScore: z.coerce.number().min(0).optional(),
  allowLate: z.coerce.boolean().optional(),
  latePenaltyPct: z.coerce.number().min(0).max(100).optional(),
  xpReward: z.coerce.number().min(0).optional(),
  instructions: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).optional(),
  // For removing attachments, a client would pass the updated list of URLs
  attachmentUrls: z.array(z.string().url()).optional(),
});

export const courseIdParamSchema = z.object({
  courseId: z.string().cuid('Invalid course ID'),
});

export const assignmentIdParamSchema = z.object({
  courseId: z.string().cuid(),
  id: z.string().cuid('Invalid assignment ID'),
});

export const submitAssignmentBodySchema = z.object({
  textContent: z.string().optional(),
});

export const gradeSubmissionBodySchema = z.object({
  score: z.coerce.number().min(0),
  feedback: z.string().optional(),
  status: z.enum(['GRADED', 'RETURNED']).default('GRADED'),
});

export const submissionIdParamSchema = z.object({
  courseId: z.string().cuid(),
  id: z.string().cuid(),
  submissionId: z.string().cuid(),
});
