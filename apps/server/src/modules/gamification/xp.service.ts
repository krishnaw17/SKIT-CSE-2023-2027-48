import { prisma } from '../../config/database';
import { appEmitter, AppEvents, XPAwardedPayload } from '../../core/events';
import { logger } from '../../core/logger';
import { Prisma } from '@prisma/client';

export class XPService {
  /**
   * Awards XP to a student and emits an event.
   */
  static async awardXP(payload: XPAwardedPayload): Promise<void> {
    try {
      const { studentId, amount, source, description, referenceId } = payload;

      if (amount <= 0) return;

      // Wrap in transaction to update total XP on Leaderboard entries (or we can compute it on the fly)
      // Actually, XPTransactions act as a ledger. Leaderboard can be aggregated.
      
      const transaction = await prisma.xPTransaction.create({
        data: {
          studentId,
          amount,
          source: source as any, // XPSource enum
          description,
          ...(referenceId !== undefined && { referenceId })
        }
      });

      logger.info(`XP Awarded to ${studentId}: +${amount} from ${source}`);
      
      // Emit event so other services (Level, Badge, Leaderboard) can react
      appEmitter.emit(AppEvents.XP_AWARDED, payload);

    } catch (error) {
      logger.error('Failed to award XP', { error, payload });
    }
  }

  static async getTotalXP(studentId: string): Promise<number> {
    const aggregate = await prisma.xPTransaction.aggregate({
      where: { studentId },
      _sum: { amount: true }
    });
    return aggregate._sum.amount || 0;
  }
}
