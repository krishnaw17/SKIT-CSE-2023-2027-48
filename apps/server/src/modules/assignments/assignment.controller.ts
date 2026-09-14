import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { sendSuccess, sendCreated, sendNoContent } from '../../core/response';
import { NotFoundError, BadRequestError, ConflictError, ForbiddenError } from '../../core/errors';
import { uploadToCloudinary } from '../../utils/cloudinary.util';
import { CourseService } from '../courses/course.service';
import { XPService } from '../gamification/xp.service';

export class AssignmentController {
  private async verifyTeacherAccess(courseId: string, userId: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundError('Course');

    const profile = await prisma.teacherProfile.findUnique({ where: { userId } });
    if (course.teacherId !== profile?.id) {
      throw new BadRequestError('You do not have permission to modify this course');
    }
    return { course, teacherId: profile.id };
  }

  async createAssignment(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    const { teacherId } = await this.verifyTeacherAccess(courseId, req.user!.id);

    const {
      title,
      description,
      dueDate,
      maxScore,
      passingScore,
      allowLate,
      latePenaltyPct,
      xpReward,
      instructions,
      status,
    } = req.body;

    const attachmentUrls: string[] = [];

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        const ext = file.originalname.split('.').pop()?.toLowerCase();
        const isRaw = ext && ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(ext);
        const resourceType = isRaw ? 'raw' : 'auto';
        
        try {
          const uploadResult = await uploadToCloudinary(
            file.buffer, 
            `glms/courses/${courseId}/assignments/attachments`, 
            resourceType, 
            isRaw ? undefined : ext,
            file.originalname
          );
          attachmentUrls.push(uploadResult.secure_url);
        } catch (error: any) {
          throw new BadRequestError('Failed to upload attachment: ' + (error.message || 'Unknown error'));
        }
      }
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId,
        teacherId,
        title,
        description,
        dueDate: new Date(dueDate),
        maxScore: Number(maxScore),
        passingScore: Number(passingScore),
        allowLate: allowLate === 'true' || allowLate === true,
        latePenaltyPct: Number(latePenaltyPct),
        xpReward: Number(xpReward),
        instructions,
        status,
        attachmentUrls,
      },
    });

    if (status === 'PUBLISHED') {
      await CourseService.updateAllCourseEnrollmentsProgress(courseId);
    }

    return sendCreated(res, assignment, 'Assignment created successfully');
  }

  async getAssignmentsByCourse(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    const query: any = { courseId };

    if (req.user?.role === 'STUDENT') {
      query.status = 'PUBLISHED';
    }

    const assignments = await prisma.assignment.findMany({
      where: query,
      orderBy: { dueDate: 'asc' },
      include: {
        _count: { select: { submissions: true } },
      },
    });

    return sendSuccess(res, assignments);
  }

  async getAssignmentById(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    const id = req.params.id as string;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        course: { select: { title: true } },
      },
    });

    if (!assignment || assignment.courseId !== courseId) throw new NotFoundError('Assignment');

    if (req.user?.role === 'STUDENT' && assignment.status === 'DRAFT') {
      throw new NotFoundError('Assignment');
    }

    // Attach user's own submission if student
    if (req.user?.role === 'STUDENT') {
      const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
      if (studentProfile) {
        const submission = await prisma.assignmentSubmission.findUnique({
          where: { assignmentId_studentId: { assignmentId: id, studentId: studentProfile.id } },
        });
        (assignment as any).mySubmission = submission;
      }
    }

    return sendSuccess(res, assignment);
  }

  async updateAssignment(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    const id = req.params.id as string;
    await this.verifyTeacherAccess(courseId, req.user!.id);

    const assignment = await prisma.assignment.findUnique({ where: { id } });
    if (!assignment || assignment.courseId !== courseId) throw new NotFoundError('Assignment');

    const updateData: any = { ...req.body };
    delete updateData.attachmentUrls; // handled below
    delete updateData.existingAttachments; // handled below

    if (updateData.dueDate) updateData.dueDate = new Date(updateData.dueDate);
    if (updateData.maxScore) updateData.maxScore = Number(updateData.maxScore);
    if (updateData.passingScore) updateData.passingScore = Number(updateData.passingScore);
    if (updateData.allowLate !== undefined) updateData.allowLate = updateData.allowLate === 'true' || updateData.allowLate === true;
    if (updateData.latePenaltyPct) updateData.latePenaltyPct = Number(updateData.latePenaltyPct);
    if (updateData.xpReward) updateData.xpReward = Number(updateData.xpReward);

    let attachmentUrls = [...assignment.attachmentUrls];
    if (req.body.existingAttachments !== undefined) {
      if (req.body.existingAttachments === '') {
        attachmentUrls = [];
      } else {
        attachmentUrls = Array.isArray(req.body.existingAttachments) 
          ? req.body.existingAttachments 
          : [req.body.existingAttachments];
      }
    }

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        const ext = file.originalname.split('.').pop()?.toLowerCase();
        const isRaw = ext && ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(ext);
        const resourceType = isRaw ? 'raw' : 'auto';
        
        try {
          const uploadResult = await uploadToCloudinary(
            file.buffer, 
            `glms/courses/${courseId}/assignments/attachments`, 
            resourceType, 
            isRaw ? undefined : ext,
            file.originalname
          );
          attachmentUrls.push(uploadResult.secure_url);
        } catch (error: any) {
          throw new BadRequestError('Failed to upload attachment: ' + (error.message || 'Unknown error'));
        }
      }
    }

    updateData.attachmentUrls = attachmentUrls;

    const updated = await prisma.assignment.update({
      where: { id },
      data: updateData,
    });

    if (updated.status !== assignment.status) {
      await CourseService.updateAllCourseEnrollmentsProgress(courseId);
    }

    return sendSuccess(res, updated, { message: 'Assignment updated successfully' });
  }

  async deleteAssignment(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    const id = req.params.id as string;
    await this.verifyTeacherAccess(courseId, req.user!.id);

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: { _count: { select: { submissions: true } } },
    });

    if (!assignment || assignment.courseId !== courseId) throw new NotFoundError('Assignment');
    if (assignment._count.submissions > 0) {
      throw new BadRequestError('Cannot delete assignment with active submissions');
    }

    await prisma.assignment.delete({ where: { id } });

    if (assignment.status === 'PUBLISHED') {
      await CourseService.updateAllCourseEnrollmentsProgress(courseId);
    }

    return sendNoContent(res);
  }

  // ==========================================
  // Submissions
  // ==========================================

  async submitAssignment(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    const id = req.params.id as string;

    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!studentProfile) throw new BadRequestError('Student profile not found');

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: studentProfile.id, courseId } },
    });
    if (!enrollment) throw new BadRequestError('You are not enrolled in this course');

    const assignment = await prisma.assignment.findUnique({ where: { id } });
    if (!assignment || assignment.courseId !== courseId) throw new NotFoundError('Assignment');

    if (assignment.status !== 'PUBLISHED') throw new BadRequestError('Assignment is not open for submissions');

    const now = new Date();
    const isLate = now > assignment.dueDate;

    if (isLate && !assignment.allowLate) {
      throw new BadRequestError('This assignment is past its due date and does not accept late submissions');
    }

    const existing = await prisma.assignmentSubmission.findUnique({
      where: { assignmentId_studentId: { assignmentId: id, studentId: studentProfile.id } },
    });

    if (existing && existing.status !== 'RETURNED') {
      throw new ConflictError('You have already submitted this assignment');
    }

    const fileUrls: string[] = [];

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        const ext = file.originalname.split('.').pop()?.toLowerCase();
        const isRaw = ext && ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(ext);
        const resourceType = isRaw ? 'raw' : 'auto';
        
        try {
          const uploadResult = await uploadToCloudinary(
            file.buffer, 
            `glms/courses/${courseId}/submissions/${id}/${studentProfile.id}`, 
            resourceType, 
            isRaw ? undefined : ext,
            file.originalname
          );
          fileUrls.push(uploadResult.secure_url);
        } catch (error: any) {
          throw new BadRequestError('Failed to upload file: ' + (error.message || 'Unknown error'));
        }
      }
    }

    const { textContent } = req.body;

    if (!textContent && fileUrls.length === 0) {
      throw new BadRequestError('Submission must include either text content or file attachments');
    }

    const data = {
      assignmentId: id,
      studentId: studentProfile.id,
      textContent,
      fileUrls,
      status: isLate ? 'LATE' : 'SUBMITTED',
      isLate,
      submittedAt: now,
    };

    const submission = existing
      ? await prisma.assignmentSubmission.update({ where: { id: existing.id }, data: data as any })
      : await prisma.assignmentSubmission.create({ data: data as any });

    // Update course progress accurately based on completed tasks
    if (enrollment) {
      await CourseService.updateStudentProgress(studentProfile.id, assignment.courseId);
    }

    return sendSuccess(res, submission, { message: 'Assignment submitted successfully' });
  }

  async deleteSubmission(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    const id = req.params.id as string;

    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!studentProfile) throw new NotFoundError('Student Profile');

    // Make sure they are enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: studentProfile.id, courseId } },
    });
    if (!enrollment) throw new ForbiddenError('You are not enrolled in this course');

    const existing = await prisma.assignmentSubmission.findUnique({
      where: { assignmentId_studentId: { assignmentId: id, studentId: studentProfile.id } },
    });

    if (!existing) {
      throw new NotFoundError('Submission not found');
    }

    await prisma.assignmentSubmission.delete({
      where: { id: existing.id }
    });

    return sendSuccess(res, null, { message: 'Submission deleted successfully' });
  }

  async getSubmissions(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    const id = req.params.id as string;
    await this.verifyTeacherAccess(courseId, req.user!.id);

    const submissions = await prisma.assignmentSubmission.findMany({
      where: { assignmentId: id },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return sendSuccess(res, submissions);
  }

  async gradeSubmission(req: Request, res: Response) {
    const courseId = req.params.courseId as string;
    const id = req.params.id as string;
    const submissionId = req.params.submissionId as string;
    const { teacherId } = await this.verifyTeacherAccess(courseId, req.user!.id);

    const assignment = await prisma.assignment.findUnique({ where: { id } });
    if (!assignment) throw new NotFoundError('Assignment');

    const submission = await prisma.assignmentSubmission.findUnique({ where: { id: submissionId } });
    if (!submission || submission.assignmentId !== id) throw new NotFoundError('Submission');

    const { score, feedback, status } = req.body;

    if (score > assignment.maxScore) {
      throw new BadRequestError(`Score cannot exceed maximum score of ${assignment.maxScore}`);
    }

    // Calculate XP
    const ratio = score / assignment.maxScore;
    const xpAwarded = Math.round(assignment.xpReward * ratio);

    const updated = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score: Number(score),
        feedback,
        status,
        gradedAt: new Date(),
        gradedBy: teacherId,
        xpAwarded,
      },
    });

    // If it's the first time grading, award XP
    if (!submission.gradedAt && xpAwarded > 0) {
      await XPService.awardXP({
        studentId: submission.studentId,
        amount: xpAwarded,
        source: 'ASSIGNMENT_GRADE',
        description: `Graded assignment: ${assignment.title}`,
        referenceId: assignment.id
      });
    }

    return sendSuccess(res, updated, { message: 'Submission graded successfully' });
  }
}
