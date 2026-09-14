import { PrismaClient } from '@prisma/client';
import { CourseService } from '../modules/courses/course.service';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting progress synchronization...');

  // Fetch all enrollments
  const enrollments = await prisma.enrollment.findMany({
    select: { studentId: true, courseId: true }
  });

  console.log(`Found ${enrollments.length} enrollments. Updating progress...`);

  let count = 0;
  for (const enrollment of enrollments) {
    await CourseService.updateStudentProgress(enrollment.studentId, enrollment.courseId);
    count++;
    if (count % 10 === 0) {
      console.log(`Processed ${count} / ${enrollments.length} enrollments...`);
    }
  }

  console.log('Progress synchronization completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
