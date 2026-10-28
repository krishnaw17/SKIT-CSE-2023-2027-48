import { prisma } from '../../config/database';
import { appEmitter, AppEvents } from '../../core/events';
import { logger } from '../../core/logger';
import { differenceInDays, startOfDay } from 'date-fns';

export class StreakService {
  /**
   * Initializes listeners (e.g. listening to daily attendance, or just generic activity)
   * We could listen to any XP event to count as 'active today'
   */
  static init() {
    appEmitter.on(AppEvents.XP_AWARDED, async (payload) => {
      await this.updateStreak(payload.studentId);
    });
  }

  /**
   * Updates streak based on activity.
   */
  static async updateStreak(studentId: string) {
    try {
      const today = startOfDay(new Date());
      
      const streak = await prisma.streak.upsert({
        where: { studentId },
        update: {}, // We'll manually compute update fields
        create: {
          studentId,
          currentStreak: 0,
          longestStreak: 0,
          weeklyStreak: 0,
          lastActiveDate: null
        }
      });

      if (!streak.lastActiveDate) {
        // First activity ever
        await this.applyStreakUpdate(studentId, 1, 1, today);
        return;
      }

      const lastActive = startOfDay(new Date(streak.lastActiveDate));
      const daysDifference = differenceInDays(today, lastActive);

      if (daysDifference === 0) {
        // Already active today, do nothing
        return;
      } else if (daysDifference === 1) {
        // Active yesterday, streak continues!
        const newStreak = streak.currentStreak + 1;
        const newLongest = Math.max(newStreak, streak.longestStreak);
        await this.applyStreakUpdate(studentId, newStreak, newLongest, today);
        
        appEmitter.emit(AppEvents.STREAK_UPDATED, { studentId, currentStreak: newStreak });
        
        // Award XP for streak? Could emit an XP_AWARDED event itself, but watch for loops!
        // Maybe directly award XP or do it via a separate rule.
      } else {
        // Streak broken (days > 1)
        await this.applyStreakUpdate(studentId, 1, streak.longestStreak, today);
        appEmitter.emit(AppEvents.STREAK_UPDATED, { studentId, currentStreak: 1 });
      }

    } catch (error) {
      logger.error('Failed to update streak', { error });
    }
  }

  private static async applyStreakUpdate(studentId: string, current: number, longest: number, date: Date) {
    await prisma.streak.update({
      where: { studentId },
      data: {
        currentStreak: current,
        longestStreak: longest,
        lastActiveDate: date
      }
    });
  }
}
