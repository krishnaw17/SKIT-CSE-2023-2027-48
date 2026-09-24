import { PrismaClient, UserRole, BadgeRarity, LeaderboardType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.info('🌱 Seeding database…');

  // ============================================================
  // 1. Academic session
  // ============================================================
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

  // ============================================================
  // 2. Subjects
  // ============================================================
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { code: 'MATH10' },
      update: {},
      create: { code: 'MATH10', name: 'Mathematics', color: '#3B82F6', description: 'Grade 10 Mathematics' },
    }),
    prisma.subject.upsert({
      where: { code: 'SCI10' },
      update: {},
      create: { code: 'SCI10', name: 'Science', color: '#10B981', description: 'Grade 10 Science' },
    }),
    prisma.subject.upsert({
      where: { code: 'ENG10' },
      update: {},
      create: { code: 'ENG10', name: 'English', color: '#F59E0B', description: 'Grade 10 English' },
    }),
    prisma.subject.upsert({
      where: { code: 'HIS10' },
      update: {},
      create: { code: 'HIS10', name: 'History', color: '#8B5CF6', description: 'Grade 10 History' },
    }),
  ]);

  // ============================================================
  // 3. Classes
  // ============================================================
  const classA = await prisma.class.upsert({
    where: { name_academicSessionId: { name: 'Grade 10-A', academicSessionId: session.id } },
    update: {},
    create: {
      name: 'Grade 10-A',
      gradeLevel: 'Grade 10',
      section: 'A',
      academicSessionId: session.id,
      capacity: 35,
    },
  });

  // ============================================================
  // 4. Admin user
  // ============================================================
  const adminHash = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@xyzschool.edu' },
    update: {},
    create: {
      email: 'admin@xyzschool.edu',
      passwordHash: adminHash,
      role: UserRole.ADMIN,
      isEmailVerified: true,
      adminProfile: {
        create: { firstName: 'Super', lastName: 'Admin', displayName: 'Admin' },
      },
    },
  });
  console.info(`✅ Admin: ${admin.email}`);

  // ============================================================
  // 5. Teacher user
  // ============================================================
  const teacherHash = await bcrypt.hash('Teacher@123', 12);
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@xyzschool.edu' },
    update: {},
    create: {
      email: 'teacher@xyzschool.edu',
      passwordHash: teacherHash,
      role: UserRole.TEACHER,
      isEmailVerified: true,
      teacherProfile: {
        create: {
          firstName: 'Sarah',
          lastName: 'Williams',
          displayName: 'Ms. Williams',
          employeeNumber: 'T001',
          department: 'Mathematics',
        },
      },
    },
  });
  console.info(`✅ Teacher: ${teacher.email}`);

  // ============================================================
  // 6. Student user
  // ============================================================
  const studentHash = await bcrypt.hash('Student@123', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@xyzschool.edu' },
    update: {},
    create: {
      email: 'student@xyzschool.edu',
      passwordHash: studentHash,
      role: UserRole.STUDENT,
      isEmailVerified: true,
      studentProfile: {
        create: {
          firstName: 'Alex',
          lastName: 'Johnson',
          displayName: 'Alex J.',
          admissionNumber: 'S2024001',
          classId: classA.id,
        },
      },
    },
  });
  console.info(`✅ Student: ${student.email}`);

  // ============================================================
  // 7. Levels (1–20)
  // ============================================================
  const levelLabels = [
    'Novice', 'Apprentice', 'Explorer', 'Learner', 'Student',
    'Scholar', 'Thinker', 'Analyst', 'Expert', 'Master',
    'Sage', 'Mentor', 'Luminary', 'Champion', 'Virtuoso',
    'Grandmaster', 'Prodigy', 'Visionary', 'Legend', 'Apex',
  ];

  for (let i = 0; i < 20; i++) {
    const level = i + 1;
    await prisma.level.upsert({
      where: { levelNumber: level },
      update: {},
      create: {
        levelNumber: level,
        label: levelLabels[i] ?? `Level ${level}`,
        minXP: i === 0 ? 0 : Math.round(100 * Math.pow(1.5, i - 1)),
        maxXP: Math.round(100 * Math.pow(1.5, i)),
        color: `hsl(${220 + i * 8}, 70%, ${55 - i}%)`,
      },
    });
  }
  console.info('✅ 20 levels seeded');

  // ============================================================
  // 8. Badges
  // ============================================================
  const badges = [
    { name: 'First Step', description: 'Complete your first quiz', category: 'academic', rarity: BadgeRarity.COMMON, triggerRule: { type: 'quiz_count', threshold: 1 }, xpBonus: 10 },
    { name: 'Perfect Score', description: 'Score 100% on any quiz', category: 'academic', rarity: BadgeRarity.RARE, triggerRule: { type: 'quiz_score', threshold: 100 }, xpBonus: 50 },
    { name: '7-Day Streak', description: 'Learn 7 days in a row', category: 'streak', rarity: BadgeRarity.UNCOMMON, triggerRule: { type: 'streak_days', threshold: 7 }, xpBonus: 25 },
    { name: '30-Day Streak', description: 'Learn 30 days in a row', category: 'streak', rarity: BadgeRarity.EPIC, triggerRule: { type: 'streak_days', threshold: 30 }, xpBonus: 100 },
    { name: 'Fast Learner', description: 'Complete 5 lessons in one day', category: 'academic', rarity: BadgeRarity.UNCOMMON, triggerRule: { type: 'lessons_per_day', threshold: 5 }, xpBonus: 30 },
    { name: 'Top of Class', description: 'Reach #1 on the class leaderboard', category: 'social', rarity: BadgeRarity.EPIC, triggerRule: { type: 'leaderboard_rank', threshold: 1 }, xpBonus: 75 },
    { name: 'Legend', description: 'Reach Level 20', category: 'special', rarity: BadgeRarity.LEGENDARY, triggerRule: { type: 'level', threshold: 20 }, xpBonus: 200 },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: { ...badge, iconUrl: `https://api.iconify.design/twemoji/star.svg` },
    });
  }
  console.info(`✅ ${badges.length} badges seeded`);

  // ============================================================
  // 9. Default settings (XP rules)
  // ============================================================
  const settings = [
    { key: 'xp.quiz_completion', value: 10, description: 'XP awarded for completing a quiz', category: 'gamification' },
    { key: 'xp.quiz_perfect_score_bonus', value: 20, description: 'Bonus XP for 100% quiz score', category: 'gamification' },
    { key: 'xp.assignment_submission', value: 15, description: 'XP for submitting an assignment on time', category: 'gamification' },
    { key: 'xp.attendance_daily', value: 5, description: 'XP per day of attendance', category: 'gamification' },
    { key: 'xp.streak_daily', value: 10, description: 'XP per day of active streak', category: 'gamification' },
    { key: 'xp.lesson_completion', value: 5, description: 'XP for completing a lesson', category: 'gamification' },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, value: s.value, description: s.description, category: s.category },
    });
  }
  console.info(`✅ ${settings.length} settings seeded`);

  // ============================================================
  // 10. Student streak & XP init
  // ============================================================
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: student.id },
  });

  if (studentProfile) {
    await prisma.streak.upsert({
      where: { studentId: studentProfile.id },
      update: {},
      create: {
        studentId: studentProfile.id,
        currentStreak: 0,
        longestStreak: 0,
      },
    });
  }

  console.info('✅ Database seeded successfully!');
  console.info('');
  console.info('Test credentials:');
  console.info('  Admin:   admin@xyzschool.edu   / Admin@123');
  console.info('  Teacher: teacher@xyzschool.edu / Teacher@123');
  console.info('  Student: student@xyzschool.edu / Student@123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
