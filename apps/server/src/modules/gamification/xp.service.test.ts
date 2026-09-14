import { XPService } from './xp.service';
import { prisma } from '../../config/database';
import { appEmitter, AppEvents } from '../../core/events';
import { XPSource } from '@prisma/client';

// Mock dependencies
jest.mock('../../config/database', () => ({
  prisma: {
    xPTransaction: {
      create: jest.fn(),
      aggregate: jest.fn(),
    }
  }
}));

jest.mock('../../core/events', () => ({
  appEmitter: {
    emit: jest.fn(),
  },
  AppEvents: {
    XP_AWARDED: 'xp_awarded'
  }
}));

describe('XPService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should award XP successfully', async () => {
    const payload = {
      studentId: 'student-1',
      amount: 50,
      source: XPSource.QUIZ_COMPLETION,
      description: 'Quiz passed'
    };

    (prisma.xPTransaction.create as jest.Mock).mockResolvedValue({
      id: 'xp-1',
      ...payload
    });

    (prisma.xPTransaction.aggregate as jest.Mock).mockResolvedValue({
      _sum: { amount: 50 }
    });

    await XPService.awardXP(payload);

    expect(prisma.xPTransaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        studentId: 'student-1',
        amount: 50
      })
    });

    expect(appEmitter.emit).toHaveBeenCalledWith(AppEvents.XP_AWARDED, expect.objectContaining({
      studentId: 'student-1',
      amount: 50
    }));
  });
});
