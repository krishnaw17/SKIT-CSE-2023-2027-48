import { PrismaClient } from '@prisma/client';

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
  console.log(JSON.stringify(course, null, 2));
}

check().then(() => process.exit(0));
