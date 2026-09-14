import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding classes 1 to 12...');
  
  // get or create a session
  const session = await prisma.academicSession.upsert({
    where: { id: 'session-2024-25' },
    update: {},
    create: {
      id: 'session-2024-25',
      name: '2024-2025',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-05-31'),
      isCurrent: true,
      status: 'ACTIVE',
    },
  });

  const classes = [];
  for (let i = 1; i <= 12; i++) {
    classes.push(`Class ${i}`);
  }

  for (const className of classes) {
    await prisma.class.upsert({
      where: { name_academicSessionId: { name: className, academicSessionId: session.id } },
      update: {},
      create: {
        name: className,
        gradeLevel: className,
        section: 'A',
        academicSessionId: session.id,
        capacity: 40,
      },
    });
  }

  console.log('Successfully seeded Class 1 to 12!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
