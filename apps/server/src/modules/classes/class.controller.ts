import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { sendSuccess, sendCreated, sendNoContent } from '../../core/response';
import { ConflictError, NotFoundError, BadRequestError } from '../../core/errors';
import { Prisma } from '@prisma/client';

export class ClassController {
  async createClass(req: Request, res: Response) {
    const { name, gradeLevel, section, academicSessionId, roomNumber, capacity, isActive } = req.body;

    const session = await prisma.academicSession.findUnique({ where: { id: academicSessionId } });
    if (!session) throw new BadRequestError('Academic session not found');

    const existing = await prisma.class.findUnique({
      where: { name_academicSessionId: { name, academicSessionId } },
    });
    if (existing) {
      throw new ConflictError(`Class ${name} already exists in this session`);
    }

    const newClass = await prisma.class.create({
      data: { name, gradeLevel, section, academicSessionId, roomNumber, capacity, isActive },
    });

    return sendCreated(res, newClass, 'Class created successfully');
  }

  async getAllClasses(req: Request, res: Response) {
    const academicSessionId = req.query['sessionId'] as string | undefined;

    const query: Prisma.ClassWhereInput = {};
    if (academicSessionId) {
      query.academicSessionId = academicSessionId;
    }
    if (req.user?.role !== 'ADMIN') {
      query.isActive = true;
    }

    const classes = await prisma.class.findMany({
      where: query,
      include: {
        academicSession: true,
        _count: { select: { students: true, classSubjects: true } },
      },
      orderBy: [{ gradeLevel: 'asc' }, { section: 'asc' }],
    });

    classes.sort((a, b) => {
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });

    return sendSuccess(res, classes);
  }

  async getClassById(req: Request, res: Response) {
    const id = req.params.id as string;

    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        academicSession: true,
        classSubjects: {
          include: {
            subject: true,
            teacher: { include: { user: { select: { email: true, isActive: true } } } },
          },
        },
        students: {
          include: { user: { select: { email: true, isActive: true } } },
          orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        },
      },
    });

    if (!classData) throw new NotFoundError('Class');

    return sendSuccess(res, classData);
  }

  async updateClass(req: Request, res: Response) {
    const id = req.params.id as string;
    const { name, gradeLevel, section, academicSessionId, roomNumber, capacity, isActive } = req.body;

    const classData = await prisma.class.findUnique({ where: { id } });
    if (!classData) throw new NotFoundError('Class');

    const newName = name ?? classData.name;
    const newSessionId = academicSessionId ?? classData.academicSessionId;

    if (newName !== classData.name || newSessionId !== classData.academicSessionId) {
      const existing = await prisma.class.findUnique({
        where: { name_academicSessionId: { name: newName, academicSessionId: newSessionId } },
      });
      if (existing) {
        throw new ConflictError(`Class ${newName} already exists in that session`);
      }
    }

    const updated = await prisma.class.update({
      where: { id },
      data: { name, gradeLevel, section, academicSessionId, roomNumber, capacity, isActive },
    });

    return sendSuccess(res, updated, { message: 'Class updated successfully' });
  }

  async deleteClass(req: Request, res: Response) {
    const id = req.params.id as string;

    const classData = await prisma.class.findUnique({
      where: { id },
      include: { _count: { select: { students: true } } },
    });

    if (!classData) throw new NotFoundError('Class');

    if (classData._count.students > 0) {
      throw new BadRequestError('Cannot delete class with enrolled students.');
    }

    await prisma.class.delete({ where: { id } });

    return sendNoContent(res);
  }

  async assignSubject(req: Request, res: Response) {
    const classId = req.params.id as string;
    const { subjectId, teacherId, schedule } = req.body;

    const [classData, subject, teacher] = await Promise.all([
      prisma.class.findUnique({ where: { id: classId } }),
      prisma.subject.findUnique({ where: { id: subjectId } }),
      prisma.teacherProfile.findUnique({ where: { id: teacherId } }),
    ]);

    if (!classData) throw new NotFoundError('Class');
    if (!subject) throw new NotFoundError('Subject');
    if (!teacher) throw new NotFoundError('Teacher');

    const existingAssignment = await prisma.classSubject.findUnique({
      where: { classId_subjectId: { classId, subjectId } },
    });

    if (existingAssignment) {
      const updated = await prisma.classSubject.update({
        where: { id: existingAssignment.id },
        data: { teacherId, schedule: schedule ? (schedule as Prisma.InputJsonValue) : Prisma.JsonNull },
        include: { subject: true, teacher: true },
      });
      return sendSuccess(res, updated, { message: 'Subject assignment updated' });
    }

    const assignment = await prisma.classSubject.create({
      data: {
        classId,
        subjectId,
        teacherId,
        schedule: schedule ? (schedule as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
      include: { subject: true, teacher: true },
    });

    return sendCreated(res, assignment, 'Subject assigned to class successfully');
  }

  async removeSubject(req: Request, res: Response) {
    const classId = req.params.id as string;
    const subjectId = req.params.subjectId as string;

    const assignment = await prisma.classSubject.findUnique({
      where: { classId_subjectId: { classId, subjectId: subjectId as string } },
    });

    if (!assignment) throw new NotFoundError('Subject assignment');

    await prisma.classSubject.delete({
      where: { id: assignment.id },
    });

    return sendNoContent(res);
  }
}
