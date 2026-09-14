import { GamificationProgress } from './gamification.api';
import clsx from 'clsx';
import { Trophy } from 'lucide-react';

interface XPProgressBarProps {
  progress?: GamificationProgress | undefined;
  className?: string;
}

export function XPProgressBar({ progress, className }: XPProgressBarProps) {
  if (!progress || !progress.level) return null;

  const currentLevelXP = progress.level.minXP;
  const nextLevelXP = progress.nextLevel ? progress.nextLevel.minXP : progress.level.maxXP || progress.xp + 100;
  
  const xpInCurrentLevel = progress.xp - currentLevelXP;
  const xpNeededForNext = nextLevelXP - currentLevelXP;
  
  const percentage = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100));

  return (
    <div className={clsx('bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border-2 border-primary/20">
            {progress.level.levelNumber}
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg">{progress.level.label}</h3>
            <p className="text-sm text-slate-500 font-number">{progress.xp.toLocaleString()} total XP</p>
          </div>
        </div>
        {progress.streak.currentStreak > 2 && (
          <div className="flex flex-col items-center">
            <span className="text-2xl" title={`${progress.streak.currentStreak} Day Streak!`}>🔥</span>
            <span className="text-xs font-bold text-orange-500">{progress.streak.currentStreak} Days</span>
          </div>
        )}
      </div>

      <div className="relative h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-2 text-xs font-medium text-slate-500">
        <span>{xpInCurrentLevel} XP</span>
        <span>{nextLevelXP - currentLevelXP} XP to Level {progress.nextLevel?.levelNumber || progress.level.levelNumber + 1}</span>
      </div>
    </div>
  );
}
