import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { sendSuccess } from '../../core/response';
import { NotFoundError } from '../../core/errors';
import { XPService } from './xp.service';
import { LevelService } from './level.service';

export class GamificationController {
  async getStudentProgress(req: Request, res: Response) {
    const studentId = req.params.studentId || req.user?.id; // Allow fetching own or specific if admin

    let profileId = studentId as string;
    
    // If studentId is actually a userId (from req.user.id), we need to resolve the profile
    if (req.user?.role === 'STUDENT' && !req.params.studentId) {
       const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id }});
       if (!profile) throw new NotFoundError('Student Profile');
       profileId = profile.id;
    }

    const [totalXP, activeBadges, earnedBadges, streak] = await Promise.all([
      XPService.getTotalXP(profileId),
      prisma.badge.findMany({ where: { isActive: true }, orderBy: { xpBonus: 'asc' } }),
      prisma.studentBadge.findMany({ 
        where: { studentId: profileId },
        include: { badge: true }
      }),
      prisma.streak.findUnique({ where: { studentId: profileId } })
    ]);

    const earnedBadgeMap = new Map(earnedBadges.map(eb => [eb.badgeId, eb]));
    
    const formattedBadges = activeBadges.map(badge => {
      const earned = earnedBadgeMap.get(badge.id);
      return {
        ...badge,
        isEarned: !!earned,
        awardedAt: earned ? earned.awardedAt : undefined
      };
    });

    const level = await LevelService.calculateLevelFromXP(totalXP);
    const nextLevel = await prisma.level.findFirst({
      where: { minXP: { gt: totalXP } },
      orderBy: { minXP: 'asc' }
    });

    // Real-time chart data (XP earned over the last 5 days)
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 4);
    fiveDaysAgo.setHours(0, 0, 0, 0);

    const recentXP = await prisma.xPTransaction.findMany({
      where: {
        studentId: profileId,
        createdAt: { gte: fiveDaysAgo }
      },
      select: { amount: true, createdAt: true }
    });

    const chartDataMap = new Map<string, number>();
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      chartDataMap.set(d.toLocaleDateString('en-US', { weekday: 'short' }), 0);
    }

    recentXP.forEach(tx => {
      const day = tx.createdAt.toLocaleDateString('en-US', { weekday: 'short' });
      if (chartDataMap.has(day)) {
        chartDataMap.set(day, chartDataMap.get(day)! + tx.amount);
      }
    });

    const chartData = Array.from(chartDataMap.entries()).map(([name, score]) => ({ name, score }));

    return sendSuccess(res, {
      xp: totalXP,
      level,
      nextLevel,
      badges: formattedBadges,
      streak: streak || { currentStreak: 0, longestStreak: 0 },
      chartData
    });
  }

  async getLeaderboard(req: Request, res: Response) {
    const type = (req.query.type as 'ALL_TIME' | 'WEEKLY') || 'ALL_TIME';

    let dateFilter = {};
    if (type === 'WEEKLY') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      dateFilter = { createdAt: { gte: oneWeekAgo } };
    }

    // Group by studentId and sum XP
    const xpGroup = await prisma.xPTransaction.groupBy({
      by: ['studentId'],
      where: dateFilter,
      _sum: { amount: true }
    });

    // Create a map of studentId to totalXP
    const xpMap = new Map(xpGroup.map(g => [g.studentId, g._sum.amount || 0]));

    // Fetch ALL student profiles
    const allProfiles = await prisma.studentProfile.findMany({
      select: { id: true, firstName: true, lastName: true, avatarUrl: true }
    });

    // Combine and sort by XP descending
    const rawLeaderboard = allProfiles.map(profile => ({
      id: profile.id, // Using studentId as entry id for React key
      totalXP: xpMap.get(profile.id) || 0,
      student: profile
    })).sort((a, b) => b.totalXP - a.totalXP);

    // Assign ranks
    const leaderboard = rawLeaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    return sendSuccess(res, leaderboard);
  }
}
