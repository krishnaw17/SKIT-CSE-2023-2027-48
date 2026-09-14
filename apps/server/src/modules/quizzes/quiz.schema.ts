import { z } from 'zod';

export const createQuizBodySchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).default('DRAFT'),
  timeLimit: z.coerce.number().min(1).optional(),
  maxAttempts: z.coerce.number().min(1).default(1),
  passingScore: z.coerce.number().min(0).default(50),
  xpReward: z.coerce.number().min(0).default(10),
  xpBonusPerfect: z.coerce.number().min(0).default(20),
  shuffleQuestions: z.coerce.boolean().default(false),
  shuffleOptions: z.coerce.boolean().default(false),
  showResultsAt: z.enum(['IMMEDIATELY', 'AFTER_DUE', 'MANUAL']).default('IMMEDIATELY'),
  availableFrom: z.coerce.date().optional(),
  availableUntil: z.coerce.date().optional(),
});

export const updateQuizBodySchema = createQuizBodySchema.partial();

export const courseIdParamSchema = z.object({
  courseId: z.string().cuid(),
});

export const quizIdParamSchema = z.object({
  courseId: z.string().cuid(),
  id: z.string().cuid(),
});

// Questions
export const createQuestionBodySchema = z.object({
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER']),
  text: z.string().min(1),
  imageUrl: z.string().url().optional(),
  order: z.coerce.number().min(0),
  points: z.coerce.number().min(0).default(1),
  explanation: z.string().optional(),
  isRequired: z.boolean().default(true).optional(),
  options: z.array(z.object({
    text: z.string().min(1),
    isCorrect: z.boolean().default(false),
    order: z.coerce.number().min(0),
  })).optional(),
});

export const updateQuestionBodySchema = createQuestionBodySchema.partial();

export const questionIdParamSchema = z.object({
  courseId: z.string().cuid(),
  id: z.string().cuid(),
  questionId: z.string().cuid(),
});

// Attempts
export const submitAnswerBodySchema = z.object({
  questionId: z.string().cuid(),
  selectedOptionId: z.string().cuid().optional(),
  textAnswer: z.string().optional(),
});

export const attemptIdParamSchema = z.object({
  courseId: z.string().cuid(),
  id: z.string().cuid(),
  attemptId: z.string().cuid(),
});
