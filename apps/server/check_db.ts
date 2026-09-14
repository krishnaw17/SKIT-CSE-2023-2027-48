import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const courses = await prisma.course.findMany();
  console.log('Courses count:', courses.length);
  if (courses.length > 0) {
    console.log('First course:', courses[0].title, 'isPublished:', courses[0].isPublished);
  }
  
  const enrollments = await prisma.enrollment.findMany();
  console.log('Enrollments count:', enrollments.length);
}

check()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
