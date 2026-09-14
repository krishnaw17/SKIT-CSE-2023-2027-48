import { prisma } from '../../config/database';
import { appEmitter, AppEvents, XPAwardedPayload } from '../../core/events';
import { logger } from '../../core/logger';
import { XPService } from './xp.service';

export class LevelService {
  /**
   * Initialize event listeners
   */
  static init() {
    appEmitter.on(AppEvents.XP_AWARDED, this.evaluateLevelOnXPAward.bind(this));
  }

  static async evaluateLevelOnXPAward(payload: XPAwardedPayload) {
    try {
      const { studentId } = payload;
      
      const totalXP = await XPService.getTotalXP(studentId);
      
      // Find the level they should be at
      const targetLevel = await prisma.level.findFirst({
        where: { minXP: { lte: totalXP } },
        orderBy: { levelNumber: 'desc' } // Get the highest level they qualify for
      });

      if (!targetLevel) return;

      // Since we don't store current level directly on the profile right now, we can calculate it
      // or we can emit LEVEL_UP if we cross a threshold. Wait, do we store current level? 
      // The schema doesn't explicitly have a `levelId` on StudentProfile. It's computed from total XP.
      // But we might want to emit a notification if they level up.
      
      // For MVP, we can check the most recently earned level threshold they just crossed.
      // E.g., if totalXP - amount < minXP <= totalXP
      if (totalXP - payload.amount < targetLevel.minXP) {
        // They just leveled up!
        appEmitter.emit(AppEvents.LEVEL_UP, { studentId, newLevel: targetLevel.levelNumber });
        logger.info(`Level Up: ${studentId} reached level ${targetLevel.levelNumber}`);
      }
    } catch (error) {
      logger.error('Failed to evaluate level', { error });
    }
  }

  static async getStudentLevel(studentId: string) {
    const totalXP = await XPService.getTotalXP(studentId);
    return this.calculateLevelFromXP(totalXP);
  }

  static async calculateLevelFromXP(xp: number) {
    const level = await prisma.level.findFirst({
      where: { minXP: { lte: xp } },
      orderBy: { levelNumber: 'desc' }
    });
    return level || null;
  }
}
