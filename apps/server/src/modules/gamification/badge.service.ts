import { prisma } from '../../config/database';
import { appEmitter, AppEvents, XPAwardedPayload } from '../../core/events';
import { logger } from '../../core/logger';
import { Prisma } from '@prisma/client';

export class BadgeService {
  /**
   * Initializes listeners for events that might trigger badges
   */
  static init() {
    appEmitter.on(AppEvents.XP_AWARDED, this.evaluateBadgesOnXPAward.bind(this));
    // Could listen to other events like QUIZ_COMPLETED, COURSE_COMPLETED, STREAK_UPDATED
  }

  /**
   * Evaluates badges when XP is awarded. (Basic implementation for MVP)
   */
  static async evaluateBadgesOnXPAward(payload: XPAwardedPayload) {
    try {
      const { studentId } = payload;
      
      // Get all active badges
      const activeBadges = await prisma.badge.findMany({ where: { isActive: true } });
      
      // Get student's current badges to avoid re-awarding (assuming one-time award per badge for now)
      const earnedBadges = await prisma.studentBadge.findMany({
        where: { studentId },
        select: { badgeId: true }
      });
      const earnedBadgeIds = new Set(earnedBadges.map(b => b.badgeId));

      const unearnedBadges = activeBadges.filter(b => !earnedBadgeIds.has(b.id));

      if (unearnedBadges.length === 0) return;

      // Evaluate logic for each badge. 
      // Rule schema example: { type: 'total_xp', threshold: 1000 }
      
      for (const badge of unearnedBadges) {
        const rule = badge.triggerRule as { type: string, threshold?: number };
        if (!rule) continue;

        let shouldAward = false;

        switch (rule.type) {
          case 'total_xp':
            if (rule.threshold) {
              const totalXPResult = await prisma.xPTransaction.aggregate({
                where: { studentId },
                _sum: { amount: true }
              });
              const totalXP = totalXPResult._sum.amount || 0;
              if (totalXP >= rule.threshold) {
                shouldAward = true;
              }
            }
            break;
            
          // Add other badge types here (e.g. perfect_quiz, top_class)
        }

        if (shouldAward) {
          await this.awardBadge(studentId, badge.id);
        }
      }
    } catch (error) {
      logger.error('Failed to evaluate badges', { error });
    }
  }

  static async awardBadge(studentId: string, badgeId: string) {
    try {
      await prisma.studentBadge.create({
        data: {
          studentId,
          badgeId,
          awardedBy: 'system'
        }
      });
      
      // Emit event
      appEmitter.emit(AppEvents.BADGE_EARNED, { studentId, badgeId });
      logger.info(`Badge awarded: ${badgeId} to ${studentId}`);
    } catch (error: any) {
      // Ignore unique constraint violations (already awarded)
      if (error.code !== 'P2002') {
        throw error;
      }
    }
  }
}
