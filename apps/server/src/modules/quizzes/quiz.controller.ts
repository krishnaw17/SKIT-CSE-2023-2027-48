import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { sendSuccess, sendCreated, sendNoContent } from '../../core/response';
import { NotFoundError, BadRequestError, ConflictError } from '../../core/errors';
import { AIService } from '../../core/services/ai.service';
import { CourseService } from '../courses/course.service';
import { XPService } from '../gamification/xp.service';

export class QuizController {
  private async verifyTeacherAccess(courseId: string, userId: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundError('Course');

    const profile = await prisma.teacherProfile.findUnique({ where: { userId } });
    if (course.teacherId !== profile?.id) {
      throw new BadRequestError('You do not have permission to modify this course');
    }
    return { course, teacherId: profile.id };
  }

  // ==========================================
  // Quizzes (Builder)
  // ==========================================

  async createQuiz(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    const { teacherId } = await this.verifyTeacherAccess(courseId, req.user!.id);

    const {
      title, description, status, timeLimit, maxAttempts, passingScore,
      xpReward, xpBonusPerfect, shuffleQuestions, shuffleOptions,
      showResultsAt, availableFrom, availableUntil
    } = req.body;

    const quiz = await prisma.quiz.create({
      data: {
        courseId, teacherId, title, description, status, timeLimit, maxAttempts,
        passingScore, xpReward, xpBonusPerfect, shuffleQuestions, shuffleOptions,
        showResultsAt,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        availableUntil: availableUntil ? new Date(availableUntil) : null,
      }
    });

    if (status === 'PUBLISHED') {
      await CourseService.updateAllCourseEnrollmentsProgress(courseId);
    }

    return sendCreated(res, quiz, 'Quiz created successfully');
  }

  async getQuizzesByCourse(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    
    const query: any = { courseId };
    if (req.user?.role === 'STUDENT') {
      query.status = 'PUBLISHED';
    }

    const quizzes = await prisma.quiz.findMany({
      where: query,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { questions: true } } }
    });

    return sendSuccess(res, quizzes);
  }

  async getQuizById(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    const id = req.params.id as string;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: { orderBy: { order: 'asc' }, select: { id: true, text: true, order: true, isCorrect: req.user?.role !== 'STUDENT' } }
          }
        }
      }
    });

    if (!quiz || quiz.courseId !== courseId) throw new NotFoundError('Quiz');

    if (req.user?.role === 'STUDENT' && quiz.status === 'DRAFT') {
      throw new NotFoundError('Quiz');
    }

    // Attach user attempts if student
    if (req.user?.role === 'STUDENT') {
      const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
      if (studentProfile) {
        const attempts = await prisma.quizAttempt.findMany({
          where: { quizId: id, studentId: studentProfile.id },
          orderBy: { attemptNumber: 'desc' }
        });
        (quiz as any).myAttempts = attempts;
      }
    }

    return sendSuccess(res, quiz);
  }

  async updateQuiz(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    const id = req.params.id as string;
    await this.verifyTeacherAccess(courseId, req.user!.id);

    const quiz = await prisma.quiz.findUnique({ where: { id } });
    if (!quiz || quiz.courseId !== courseId) throw new NotFoundError('Quiz');

    const updateData = { ...req.body };
    if (updateData.availableFrom) updateData.availableFrom = new Date(updateData.availableFrom);
    if (updateData.availableUntil) updateData.availableUntil = new Date(updateData.availableUntil);

    const updated = await prisma.quiz.update({
      where: { id },
      data: updateData
    });

    if (updated.status !== quiz.status) {
      await CourseService.updateAllCourseEnrollmentsProgress(courseId);
    }

    return sendSuccess(res, updated, { message: 'Quiz updated successfully' });
  }

  async deleteQuiz(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    const id = req.params.id as string;
    await this.verifyTeacherAccess(courseId, req.user!.id);

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { _count: { select: { attempts: true } } }
    });

    if (!quiz || quiz.courseId !== courseId) throw new NotFoundError('Quiz');

    await prisma.quiz.delete({ where: { id } });

    if (quiz.status === 'PUBLISHED') {
      await CourseService.updateAllCourseEnrollmentsProgress(courseId);
    }

    return sendNoContent(res);
  }

  // ==========================================
  // Questions
  // ==========================================

  async createQuestion(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    const id = req.params.id as string;
    await this.verifyTeacherAccess(courseId, req.user!.id);

    const quiz = await prisma.quiz.findUnique({ where: { id } });
    if (!quiz || quiz.courseId !== courseId) throw new NotFoundError('Quiz');

    const { type, text, imageUrl, order, points, explanation, isRequired, options } = req.body;

    const data: any = {
      quizId: id, type, text, imageUrl, order, points, explanation, isRequired
    };
    if (options) {
      data.options = { create: options };
    }

    const question = await prisma.question.create({
      data,
      include: { options: true }
    });

    return sendCreated(res, question, 'Question created successfully');
  }

  async updateQuestion(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    const id = req.params.id as string;
    const questionId = req.params.questionId as string;
    await this.verifyTeacherAccess(courseId, req.user!.id);

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question || question.quizId !== id) throw new NotFoundError('Question');

    const { type, text, imageUrl, order, points, explanation, isRequired, options } = req.body;

    const updated = await prisma.$transaction(async (tx) => {
      const q = await tx.question.update({
        where: { id: questionId },
        data: { type, text, imageUrl, order, points, explanation, isRequired }
      });

      if (options) {
        await tx.option.deleteMany({ where: { questionId } });
        await tx.option.createMany({
          data: options.map((opt: any) => ({ ...opt, questionId }))
        });
      }

      return tx.question.findUnique({ where: { id: questionId }, include: { options: true } });
    });

    return sendSuccess(res, updated, { message: 'Question updated successfully' });
  }

  async deleteQuestion(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    const id = req.params.id as string;
    const questionId = req.params.questionId as string;
    await this.verifyTeacherAccess(courseId, req.user!.id);

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question || question.quizId !== id) throw new NotFoundError('Question');

    await prisma.question.delete({ where: { id: questionId } });
    return sendNoContent(res);
  }

  async generateQuizFromNotes(req: Request, res: Response, next: NextFunction) {
    try {
    const courseId = req.params.courseId as string;
    const id = req.params.id as string;
    await this.verifyTeacherAccess(courseId, req.user!.id);

    if (!req.file) {
      throw new BadRequestError('No PDF file uploaded');
    }

    const aiService = new AIService();
    const questionsJSON = await aiService.generateQuizFromPDF(req.file.buffer, req.file.mimetype);

    const questionsCount = await prisma.question.count({ where: { quizId: id } });

    const createdQuestions = await prisma.$transaction(async (tx) => {
      const results = [];
      for (let i = 0; i < questionsJSON.length; i++) {
        const q = questionsJSON[i];
        const newQuestion = await tx.question.create({
          data: {
            quizId: id,
            type: 'MULTIPLE_CHOICE',
            text: q.text,
            points: q.points || 10,
            order: questionsCount + i + 1,
            options: {
              create: q.options.map((opt: any, index: number) => ({
                text: opt.text,
                isCorrect: opt.isCorrect,
                order: index + 1
              }))
            }
          },
          include: { options: true }
        });
        results.push(newQuestion);
      }
      return results;
    });

    return sendCreated(res, createdQuestions, 'AI generated questions successfully');
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // Attempts & Taking Quiz
  // ==========================================

  async startAttempt(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    const id = req.params.id as string;

    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!studentProfile) throw new BadRequestError('Student profile not found');

    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: studentProfile.id, courseId } }
    });
    if (!enrollment) throw new BadRequestError('You are not enrolled in this course');

    const quiz = await prisma.quiz.findUnique({ where: { id } });
    if (!quiz || quiz.courseId !== courseId) throw new NotFoundError('Quiz');
    if (quiz.status !== 'PUBLISHED') throw new BadRequestError('Quiz is not published');

    const now = new Date();
    if (quiz.availableFrom && now < quiz.availableFrom) throw new BadRequestError('Quiz is not available yet');
    if (quiz.availableUntil && now > quiz.availableUntil) throw new BadRequestError('Quiz is no longer available');

    const attemptsCount = await prisma.quizAttempt.count({
      where: { quizId: id, studentId: studentProfile.id }
    });

    if (attemptsCount >= quiz.maxAttempts) {
      throw new BadRequestError('Maximum attempts reached');
    }

    // Check if there is an active (unsubmitted) attempt
    const activeAttempt = await prisma.quizAttempt.findFirst({
      where: { quizId: id, studentId: studentProfile.id, submittedAt: null }
    });

    if (activeAttempt) {
      return sendSuccess(res, activeAttempt, { message: 'Resuming active attempt' });
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: id,
        studentId: studentProfile.id,
        attemptNumber: attemptsCount + 1,
      }
    });

    return sendCreated(res, attempt, 'Quiz attempt started');
  }

  async saveAnswer(req: Request, res: Response) {
    const attemptId = req.params.attemptId as string;
    const { questionId, selectedOptionId, textAnswer } = req.body;

    const attempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } });
    if (!attempt) throw new NotFoundError('Attempt');
    if (attempt.submittedAt) throw new BadRequestError('Attempt already submitted');

    // Make sure user owns attempt
    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (attempt.studentId !== studentProfile?.id) throw new NotFoundError('Attempt');

    const answer = await prisma.quizAnswer.upsert({
      where: { attemptId_questionId: { attemptId, questionId } },
      update: { selectedOptionId, textAnswer },
      create: { attemptId, questionId, selectedOptionId, textAnswer }
    });

    return sendSuccess(res, answer);
  }

  async submitAttempt(req: Request, res: Response) {
    const attemptId = req.params.attemptId as string;

    const attempt = await prisma.quizAttempt.findUnique({ 
      where: { id: attemptId },
      include: { quiz: true, answers: true } 
    });
    if (!attempt) throw new NotFoundError('Attempt');
    if (attempt.submittedAt) throw new BadRequestError('Attempt already submitted');

    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (attempt.studentId !== studentProfile?.id) throw new NotFoundError('Attempt');

    const questions = await prisma.question.findMany({
      where: { quizId: attempt.quizId },
      include: { options: true }
    });

    let score = 0;
    let maxScore = 0;

    const answersToUpdate: any[] = [];

    for (const question of questions) {
      maxScore += question.points;
      const answer = attempt.answers.find(a => a.questionId === question.id);
      
      let isCorrect = false;
      let pointsEarned = 0;

      if (answer) {
        if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
          const correctOption = question.options.find(o => o.isCorrect);
          if (correctOption && answer.selectedOptionId === correctOption.id) {
            isCorrect = true;
            pointsEarned = question.points;
          }
        } else if (question.type === 'SHORT_ANSWER') {
          // Manual grading needed for short answer, mark as null for now
          isCorrect = null as any; 
          pointsEarned = 0;
        }

        answersToUpdate.push({
          where: { id: answer.id },
          data: { isCorrect, pointsEarned }
        });
      }

      score += pointsEarned;
    }

    const isPassed = score >= attempt.quiz.passingScore;
    
    // Calculate XP
    let xpAwarded = 0;
    if (isPassed) {
      xpAwarded += attempt.quiz.xpReward;
      if (score === maxScore) xpAwarded += attempt.quiz.xpBonusPerfect;
    }

    const timeTaken = Math.floor((new Date().getTime() - attempt.startedAt.getTime()) / 1000);

    // Run transaction
    const finalAttempt = await prisma.$transaction(async (tx) => {
      await Promise.all(answersToUpdate.map(p => tx.quizAnswer.update(p as any)));
      
      const final = await tx.quizAttempt.update({
        where: { id: attemptId },
        data: {
          submittedAt: new Date(),
          score,
          maxScore,
          isPassed,
          timeTaken,
          xpAwarded
        }
      });

      return final;
    });

    if (xpAwarded > 0) {
      await XPService.awardXP({
        studentId: studentProfile.id,
        amount: attempt.quiz.xpReward,
        source: 'QUIZ_COMPLETION',
        description: `Completed quiz: ${attempt.quiz.title}`,
        referenceId: attempt.quiz.id
      });

      if (score === maxScore && attempt.quiz.xpBonusPerfect > 0) {
        await XPService.awardXP({
          studentId: studentProfile.id,
          amount: attempt.quiz.xpBonusPerfect,
          source: 'QUIZ_PERFECT_SCORE',
          description: `Perfect score on quiz: ${attempt.quiz.title}`,
          referenceId: attempt.quiz.id
        });
      }
    }

    // Update course progress accurately based on completed tasks
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: studentProfile.id, courseId: attempt.quiz.courseId } }
    });
    if (enrollment) {
      await CourseService.updateStudentProgress(studentProfile.id, attempt.quiz.courseId);
    }

    return sendSuccess(res, finalAttempt, { message: 'Quiz submitted successfully' });
  }
}
