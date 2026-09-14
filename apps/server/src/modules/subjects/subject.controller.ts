import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { sendSuccess, sendCreated, sendNoContent } from '../../core/response';
import { ConflictError, NotFoundError, BadRequestError } from '../../core/errors';

export class SubjectController {
  async createSubject(req: Request, res: Response) {
    const { name, code, description, iconUrl, color, isActive } = req.body;

    const existing = await prisma.subject.findUnique({ where: { code } });
    if (existing) {
      throw new ConflictError(`Subject with code ${code} already exists`);
    }

    const subject = await prisma.subject.create({
      data: { name, code, description, iconUrl, color, isActive },
    });

    return sendCreated(res, subject, 'Subject created successfully');
  }

  async getAllSubjects(req: Request, res: Response) {
    const query = req.user?.role === 'ADMIN' ? {} : { isActive: true };

    const subjects = await prisma.subject.findMany({
      where: query,
      orderBy: { name: 'asc' },
    });

    return sendSuccess(res, subjects);
  }

  async getSubjectById(req: Request, res: Response) {
    const id = req.params.id as string;

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        classSubjects: {
          include: {
            class: true,
            teacher: { include: { user: true } },
          },
        },
      },
    });

    if (!subject) throw new NotFoundError('Subject');

    return sendSuccess(res, subject);
  }

  async updateSubject(req: Request, res: Response) {
    const id = req.params.id as string;
    const { name, code, description, iconUrl, color, isActive } = req.body;

    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) throw new NotFoundError('Subject');

    if (code && code !== subject.code) {
      const existing = await prisma.subject.findUnique({ where: { code } });
      if (existing) {
        throw new ConflictError(`Subject with code ${code} already exists`);
      }
    }

    const updated = await prisma.subject.update({
      where: { id },
      data: { name, code, description, iconUrl, color, isActive },
    });

    return sendSuccess(res, updated, { message: 'Subject updated successfully' });
  }

  async deleteSubject(req: Request, res: Response) {
    const id = req.params.id as string;

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: { _count: { select: { classSubjects: true, courses: true } } },
    });

    if (!subject) throw new NotFoundError('Subject');

    if (subject._count.classSubjects > 0 || subject._count.courses > 0) {
      throw new BadRequestError('Cannot delete subject that is assigned to classes or courses.');
    }

    await prisma.subject.delete({ where: { id } });

    return sendNoContent(res);
  }
}
