import { useState } from 'react';
import { useLeaderboard } from '@/features/gamification/gamification.api';
import { PageLoader } from '@/components/common/PageLoader';
import { Trophy, Medal, Award } from 'lucide-react';
import clsx from 'clsx';
import { Avatar } from '@/components/common/Avatar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'ALL_TIME' | 'WEEKLY'>('ALL_TIME');
  const { data: leaderboard, isLoading } = useLeaderboard(period);

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardHeader />
      <div className="page-wrapper page-container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
          <h1 className="font-heading text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-slate-500">See how you rank among your peers.</p>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex gap-1">
          <button
            onClick={() => setPeriod('WEEKLY')}
            className={clsx(
              "px-4 py-2 rounded-md text-sm font-semibold transition-colors",
              period === 'WEEKLY' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            This Week
          </button>
          <button
            onClick={() => setPeriod('ALL_TIME')}
            className={clsx(
              "px-4 py-2 rounded-md text-sm font-semibold transition-colors",
              period === 'ALL_TIME' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            All Time
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Top 3 Podium (Optional extra feature, for now list) */}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="py-4 px-6 font-semibold text-slate-500 w-24 text-center">Rank</th>
                <th className="py-4 px-6 font-semibold text-slate-500">Student</th>
                <th className="py-4 px-6 font-semibold text-slate-500 text-right">Total XP</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard?.map((entry, index) => {
                const isTop3 = index < 3;
                return (
                  <tr
                    key={entry.id}
                    className={clsx(
                      "border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                      index === 0 && "bg-amber-50/50 dark:bg-amber-900/10",
                      index === 1 && "bg-slate-50/80 dark:bg-slate-800/20",
                      index === 2 && "bg-orange-50/30 dark:bg-orange-900/10",
                    )}
                  >
                    <td className="py-4 px-6 text-center font-bold text-lg font-number">
                      {index === 0 ? <Trophy className="w-6 h-6 text-amber-500 mx-auto" /> :
                        index === 1 ? <Medal className="w-6 h-6 text-slate-400 mx-auto" /> :
                          index === 2 ? <Award className="w-6 h-6 text-orange-400 mx-auto" /> :
                            <span className="text-slate-400">{entry.rank}</span>}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={entry.student.avatarUrl || undefined}
                          alt={`${entry.student.firstName} ${entry.student.lastName}`}
                          size="md"
                          fallback={`${entry.student.firstName[0]}${entry.student.lastName[0]}`}
                        />
                        <span className={clsx(
                          "font-semibold",
                          isTop3 ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                        )}>
                          {entry.student.firstName} {entry.student.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-primary font-number text-lg">
                      {entry.totalXP.toLocaleString()} XP
                    </td>
                  </tr>
                );
              })}
              {(!leaderboard || leaderboard.length === 0) && (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-500">
                    No leaderboard data available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
}
