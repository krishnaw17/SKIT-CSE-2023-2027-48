import { PrismaClient } from '@prisma/client';
import { CourseService } from '../modules/courses/course.service';

const prisma = new PrismaClient();

async function check() {
  const course = await prisma.course.findFirst({
    where: { title: 'Advance Maths' },
    include: {
      _count: {
        select: {
          lessons: { where: { isPublished: true } },
          quizzes: { where: { status: 'PUBLISHED' } },
          assignments: { where: { status: 'PUBLISHED' } }
        }
      }
    }
  });
  console.log('Course Tasks:', JSON.stringify(course?._count, null, 2));
  
  if (course) {
    const enrollments = await prisma.enrollment.findMany({ where: { courseId: course.id } });
    console.log('Enrollments before:', enrollments.map(e => e.progressPercent));
    
    for (const e of enrollments) {
       await CourseService.updateStudentProgress(e.studentId, e.courseId);
    }

    const enrollmentsAfter = await prisma.enrollment.findMany({ where: { courseId: course.id } });
    console.log('Enrollments after:', enrollmentsAfter.map(e => e.progressPercent));
  }
}

check().then(() => process.exit(0));
