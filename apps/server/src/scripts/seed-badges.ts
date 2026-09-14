import { PrismaClient, BadgeRarity } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBadges() {
  console.log('Seeding badges...');

  const badges = [
    {
      name: 'First Blood',
      description: 'Earned your first XP on the platform!',
      iconUrl: '🩸',
      color: '#EF4444',
      category: 'academic',
      triggerRule: { type: 'total_xp', threshold: 10 },
      xpBonus: 50,
      rarity: BadgeRarity.COMMON
    },
    {
      name: 'Rising Star',
      description: 'Earned 500 XP total.',
      iconUrl: '⭐',
      color: '#F59E0B',
      category: 'academic',
      triggerRule: { type: 'total_xp', threshold: 500 },
      xpBonus: 100,
      rarity: BadgeRarity.UNCOMMON
    },
    {
      name: 'Overachiever',
      description: 'Earned 2000 XP total.',
      iconUrl: '🚀',
      color: '#8B5CF6',
      category: 'academic',
      triggerRule: { type: 'total_xp', threshold: 2000 },
      xpBonus: 300,
      rarity: BadgeRarity.RARE
    },
    {
      name: 'Scholar',
      description: 'Earned 5000 XP total.',
      iconUrl: '🎓',
      color: '#3B82F6',
      category: 'academic',
      triggerRule: { type: 'total_xp', threshold: 5000 },
      xpBonus: 500,
      rarity: BadgeRarity.EPIC
    },
    {
      name: 'Legendary Mind',
      description: 'Earned 10000 XP total.',
      iconUrl: '👑',
      color: '#10B981',
      category: 'academic',
      triggerRule: { type: 'total_xp', threshold: 10000 },
      xpBonus: 1000,
      rarity: BadgeRarity.LEGENDARY
    }
  ];

  for (const b of badges) {
    await prisma.badge.upsert({
      where: { name: b.name },
      update: b,
      create: b
    });
  }
  console.log('Badges seeded successfully!');

  console.log('Evaluating badges for existing students...');
  const students = await prisma.studentProfile.findMany();
  const activeBadges = await prisma.badge.findMany({ where: { isActive: true } });
  
  for (const student of students) {
    try {
      const xpResult = await prisma.xPTransaction.aggregate({
        where: { studentId: student.id },
        _sum: { amount: true }
      });
      const totalXP = xpResult._sum.amount || 0;

      for (const badge of activeBadges) {
        const rule = badge.triggerRule as { type: string, threshold?: number };
        if (rule?.type === 'total_xp' && rule.threshold && totalXP >= rule.threshold) {
          try {
            await prisma.studentBadge.create({
              data: {
                studentId: student.id,
                badgeId: badge.id,
                awardedBy: 'system'
              }
            });
            console.log(`Awarded ${badge.name} to ${student.id}`);
          } catch (e: any) {
            if (e.code !== 'P2002') console.error(e);
          }
        }
      }
    } catch (e) {
      console.log(`Failed to evaluate for student ${student.id}`, e);
    }
  }
  
  console.log('Retroactive evaluation complete!');
}

seedBadges()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
