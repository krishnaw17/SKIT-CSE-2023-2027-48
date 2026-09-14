import { z } from 'zod';

export const markAttendanceBodySchema = z.object({
  studentId: z.string().cuid(),
  date: z.coerce.date(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
  note: z.string().optional(),
});

export const bulkMarkAttendanceBodySchema = z.object({
  date: z.coerce.date(),
  records: z.array(z.object({
    studentId: z.string().cuid(),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
    note: z.string().optional(),
  })).min(1),
});

export const attendanceParamsSchema = z.object({
  classId: z.string().cuid(),
});

export const singleAttendanceParamsSchema = z.object({
  classId: z.string().cuid(),
  id: z.string().cuid(),
});

export const classSubjectParamsSchema = z.object({
  classId: z.string().cuid(),
  subjectId: z.string().cuid().optional(),
});
