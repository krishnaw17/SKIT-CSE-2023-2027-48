import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ where: { role: 'TEACHER' } });
  console.log('Teachers:', users.map(u => u.email));
  
  if (users.length > 0) {
    const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: users[0].id } });
    console.log('Teacher Profile:', teacherProfile);
    
    const courses = await prisma.course.findMany({
      where: { teacher: { userId: users[0].id } },
      include: { subject: true }
    });
    console.log('Courses for this teacher:', courses.length);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
