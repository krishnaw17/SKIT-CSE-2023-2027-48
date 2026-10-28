import EventEmitter from 'events';

class AppEventEmitter extends EventEmitter {}

export const appEmitter = new AppEventEmitter();

// Define Event Types
export enum AppEvents {
  XP_AWARDED = 'xp:awarded',
  BADGE_EARNED = 'badge:earned',
  LEVEL_UP = 'level:up',
  STREAK_UPDATED = 'streak:updated',
}

// Event Payload Interfaces
export interface XPAwardedPayload {
  studentId: string;
  amount: number;
  source: string;
  description: string;
  referenceId?: string;
}

export interface BadgeEarnedPayload {
  studentId: string;
  badgeId: string;
}

export interface LevelUpPayload {
  studentId: string;
  newLevel: number;
}

export interface StreakUpdatedPayload {
  studentId: string;
  currentStreak: number;
}
