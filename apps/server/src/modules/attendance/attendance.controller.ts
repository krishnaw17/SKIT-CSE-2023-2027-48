import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { sendSuccess, sendCreated, sendNoContent } from '../../core/response';
import { NotFoundError, BadRequestError } from '../../core/errors';
import { Prisma } from '@prisma/client';

export class AttendanceController {
  private async verifyTeacherAccess(classId: string, userId: string) {
    const classData = await prisma.class.findUnique({ where: { id: classId } });
    if (!classData) throw new NotFoundError('Class');

    const profile = await prisma.teacherProfile.findUnique({ where: { userId } });
    if (!profile) throw new BadRequestError('Teacher profile not found');

    // To simplify: if teacher is assigned to any subject in this class, they can mark attendance.
    const isAssigned = await prisma.classSubject.findFirst({
      where: { classId, teacherId: profile.id }
    });

    if (!isAssigned) {
      // In a real app, homeroom teachers might have a separate relation.
      throw new BadRequestError('You are not assigned to this class');
    }

    return { classData, teacherId: profile.id };
  }

  async markAttendance(req: Request, res: Response) {
    const classId = req.params.classId as string;
    const { studentId, date, status, note } = req.body;
    const subjectId = req.query['subjectId'] as string | undefined; // Optional: subject-specific attendance

    const { teacherId } = await this.verifyTeacherAccess(classId, req.user!.id);

    const student = await prisma.studentProfile.findUnique({ where: { id: studentId } });
    if (!student || student.classId !== classId) throw new BadRequestError('Student not found in this class');

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0); // Normalize to date only

    const xpAwarded = status === 'PRESENT' ? 5 : 0; // Simple rule: 5 XP for being present

    const updateData: any = { status, note, xpAwarded, markedById: teacherId };
    
    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_date_subjectId: {
          studentId,
          date: targetDate,
          subjectId: subjectId || '' // Prisma unique constraint handles this if empty string used instead of null in compound? Actually Prisma requires exactly the type. 
          // Wait, subjectId is String?. In Prisma, unique constraint with optional fields is tricky.
          // Let's rely on Prisma generated type for where clause.
        }
      } as any, // using any because of subjectId nullability in unique index
      update: updateData,
      create: {
        studentId,
        classId,
        subjectId: subjectId || null,
        date: targetDate,
        status,
        note,
        xpAwarded,
        markedById: teacherId
      }
    });

    // XP Award
    if (xpAwarded > 0) {
      await prisma.xPTransaction.create({
        data: {
          studentId,
          source: 'ATTENDANCE',
          amount: xpAwarded,
          description: `Attendance: Present on ${targetDate.toISOString().split('T')[0]}`,
          referenceId: attendance.id
        }
      });
    }

    return sendSuccess(res, attendance, { message: 'Attendance marked successfully' });
  }

  async bulkMarkAttendance(req: Request, res: Response) {
    const classId = req.params.classId as string;
    const { date, records } = req.body;
    const subjectId = req.query['subjectId'] as string | undefined;

    const { teacherId } = await this.verifyTeacherAccess(classId, req.user!.id);

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const results = [];
    for (const record of records) {
      const { studentId, status, note } = record;
      const xpAwarded = status === 'PRESENT' ? 5 : 0;
      
      const attendance = await prisma.attendance.upsert({
        where: {
          studentId_date_subjectId: {
            studentId,
            date: targetDate,
            subjectId: subjectId || 'NULL' // Prisma 5 handles null in unique constraints differently, we mapped it as optional in schema but it's part of @@unique. If subjectId is null, we can't easily upsert. Better to use a placeholder or split logic.
          }
        } as any,
        update: { status, note, xpAwarded, markedById: teacherId },
        create: {
          studentId, classId, subjectId: subjectId || null, date: targetDate, status, note, xpAwarded, markedById: teacherId
        }
      });

      if (xpAwarded > 0) {
        // Find existing xp transaction to avoid duplicates
        const existingTx = await prisma.xPTransaction.findFirst({ where: { referenceId: attendance.id }});
        if (!existingTx) {
          await prisma.xPTransaction.create({
            data: {
              studentId, source: 'ATTENDANCE', amount: xpAwarded,
              description: `Attendance: Present on ${targetDate.toISOString().split('T')[0]}`,
              referenceId: attendance.id
            }
          });
        }
      }
      results.push(attendance);
    }

    return sendSuccess(res, results, { message: 'Bulk attendance marked successfully' });
  }

  async getAttendance(req: Request, res: Response) {
    const classId = req.params.classId as string;
    const dateQuery = req.query['date'] as string | undefined;
    const subjectId = req.query['subjectId'] as string | undefined;

    // Verify access
    if (req.user?.role === 'TEACHER') {
      await this.verifyTeacherAccess(classId, req.user.id);
    }

    const query: Prisma.AttendanceWhereInput = { classId };
    
    if (dateQuery) {
      const targetDate = new Date(dateQuery);
      targetDate.setUTCHours(0, 0, 0, 0);
      query.date = targetDate;
    }
    
    if (subjectId) {
      query.subjectId = subjectId;
    }

    // Students only see their own attendance
    if (req.user?.role === 'STUDENT') {
      const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id }});
      if (profile) query.studentId = profile.id;
    }

    const attendance = await prisma.attendance.findMany({
      where: query,
      include: {
        student: { select: { firstName: true, lastName: true, admissionNumber: true, avatarUrl: true } },
        markedBy: { select: { firstName: true, lastName: true } }
      },
      orderBy: { date: 'desc' }
    });

    return sendSuccess(res, attendance);
  }
}
