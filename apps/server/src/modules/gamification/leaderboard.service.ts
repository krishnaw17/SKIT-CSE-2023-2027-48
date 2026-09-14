import { prisma } from '../../config/database';
import { logger } from '../../core/logger';
import { getISOWeek, getYear } from 'date-fns';

export class LeaderboardService {
  /**
   * Calculates the leaderboard for a specific period.
   * Can be run via a cron job (e.g., hourly).
   */
  static async calculateLeaderboard(type: 'WEEKLY' | 'ALL_TIME' = 'ALL_TIME') {
    try {
      const today = new Date();
      const period = type === 'WEEKLY' ? `${getYear(today)}-W${getISOWeek(today)}` : 'ALL-TIME';

      // Aggregate XP per student
      // If weekly, we would filter transactions by date range. 
      // For simplicity here, we aggregate all if ALL_TIME, or just simulate ALL_TIME for MVP.
      
      const xpAggregates = await prisma.xPTransaction.groupBy({
        by: ['studentId'],
        _sum: {
          amount: true,
        },
        orderBy: {
          _sum: {
            amount: 'desc'
          }
        }
      });

      // Clear current entries for this period/type
      await prisma.leaderboardEntry.deleteMany({
        where: { type, period }
      });

      // Insert new rankings
      const entriesToCreate = xpAggregates.map((agg, index) => ({
        studentId: agg.studentId,
        type,
        period,
        totalXP: agg._sum.amount || 0,
        rank: index + 1,
        // Optional: calculate badges and quiz averages here too
      }));

      if (entriesToCreate.length > 0) {
        await prisma.leaderboardEntry.createMany({
          data: entriesToCreate
        });
      }
      
      logger.info(`Leaderboard [${type} - ${period}] calculated successfully. Evaluated ${entriesToCreate.length} students.`);

    } catch (error) {
      logger.error('Failed to calculate leaderboard', { error });
    }
  }
}
