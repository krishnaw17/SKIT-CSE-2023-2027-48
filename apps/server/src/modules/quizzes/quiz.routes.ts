import { Router, IRouter } from 'express';
import { QuizController } from './quiz.controller';
import { authenticate } from '../../core/middleware/auth.middleware';
import { requireRole } from '../../core/middleware/rbac.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import { auditLog } from '../../core/middleware/audit.middleware';
import { upload } from '../../core/middleware/upload.middleware';
import {
  createQuizBodySchema,
  updateQuizBodySchema,
  courseIdParamSchema,
  quizIdParamSchema,
  createQuestionBodySchema,
  updateQuestionBodySchema,
  questionIdParamSchema,
  submitAnswerBodySchema,
  attemptIdParamSchema
} from './quiz.schema';

// Mounted under /api/v1/courses/:courseId/quizzes
const router: IRouter = Router({ mergeParams: true });
const controller = new QuizController();

router.use(authenticate);

// Public (to authenticated users)
router.get(
  '/',
  validate({ params: courseIdParamSchema }),
  controller.getQuizzesByCourse.bind(controller)
);
router.get(
  '/:id',
  validate({ params: quizIdParamSchema }),
  controller.getQuizById.bind(controller)
);

// Student Only - Quiz Attempts
router.post(
  '/:id/attempts',
  requireRole('STUDENT'),
  validate({ params: quizIdParamSchema }),
  auditLog('START_QUIZ', 'QUIZZES'),
  controller.startAttempt.bind(controller)
);

router.put(
  '/:id/attempts/:attemptId/answers',
  requireRole('STUDENT'),
  validate({ params: attemptIdParamSchema, body: submitAnswerBodySchema }),
  controller.saveAnswer.bind(controller)
);

router.post(
  '/:id/attempts/:attemptId/submit',
  requireRole('STUDENT'),
  validate({ params: attemptIdParamSchema }),
  auditLog('SUBMIT_QUIZ', 'QUIZZES'),
  controller.submitAttempt.bind(controller)
);

// Admin / Teacher specific routes
router.use(requireRole('ADMIN', 'TEACHER'));

// Quiz Management
router.post(
  '/',
  validate({ body: createQuizBodySchema }),
  auditLog('CREATE', 'QUIZZES'),
  controller.createQuiz.bind(controller)
);

router.patch(
  '/:id',
  validate({ params: quizIdParamSchema, body: updateQuizBodySchema }),
  auditLog('UPDATE', 'QUIZZES'),
  controller.updateQuiz.bind(controller)
);

router.delete(
  '/:id',
  validate({ params: quizIdParamSchema }),
  auditLog('DELETE', 'QUIZZES'),
  controller.deleteQuiz.bind(controller)
);

// Question Management
router.post(
  '/:id/questions',
  validate({ params: quizIdParamSchema, body: createQuestionBodySchema }),
  auditLog('CREATE_QUESTION', 'QUIZZES'),
  controller.createQuestion.bind(controller)
);

router.patch(
  '/:id/questions/:questionId',
  validate({ params: questionIdParamSchema, body: updateQuestionBodySchema }),
  auditLog('UPDATE_QUESTION', 'QUIZZES'),
  controller.updateQuestion.bind(controller)
);

router.delete(
  '/:id/questions/:questionId',
  validate({ params: questionIdParamSchema }),
  auditLog('DELETE_QUESTION', 'QUIZZES'),
  controller.deleteQuestion.bind(controller)
);

// AI Generation
router.post(
  '/:id/generate',
  validate({ params: quizIdParamSchema }),
  upload.single('file'),
  auditLog('GENERATE_AI', 'QUIZZES'),
  controller.generateQuizFromNotes.bind(controller)
);

export { router as quizRouter };
