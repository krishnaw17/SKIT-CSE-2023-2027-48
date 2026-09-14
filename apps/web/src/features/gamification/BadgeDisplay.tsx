import { useState } from 'react';
import { Badge } from './gamification.api';
import clsx from 'clsx';
import { format } from 'date-fns';
import { Hexagon, Lock, ChevronDown, ChevronUp, X, Sparkles } from 'lucide-react';

interface BadgeDisplayProps {
  badges: Badge[];
  className?: string;
}

export function BadgeDisplay({ badges, className }: BadgeDisplayProps) {
  const [showAll, setShowAll] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  if (!badges || badges.length === 0) {
    return (
      <div className={clsx('bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center', className)}>
        <Hexagon className="w-12 h-12 text-slate-300 mb-3" />
        <h3 className="font-heading font-semibold text-lg text-slate-600">No badges available</h3>
        <p className="text-sm text-slate-500 max-w-[200px] mt-1">Check back later for new badges to earn.</p>
      </div>
    );
  }

  const earnedBadges = badges.filter(b => b.isEarned);
  const unearnedBadges = badges.filter(b => !b.isEarned);
  
  // Show all earned, and EXACTLY ONE unearned (the next easiest one)
  const displayBadges = (showAll 
    ? badges 
    : [...earnedBadges, ...(unearnedBadges.length > 0 ? [unearnedBadges[0]] : [])]).filter(Boolean) as Badge[];

  return (
    <div className={clsx('bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-lg">Badges ({earnedBadges.length} / {badges.length})</h3>
        
        {badges.length > displayBadges.length || showAll ? (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-medium flex items-center gap-1 text-slate-500 hover:text-primary transition-colors"
          >
            {showAll ? 'Show Less' : 'View All'}
            {showAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayBadges.map((badge) => {
          const color = badge.isEarned ? (badge.color || '#FCD34D') : '#94A3B8';
          return (
            <div 
              key={badge.id} 
              onClick={() => setSelectedBadge(badge)}
              className={clsx(
                "flex flex-col items-center p-4 rounded-xl border transition-colors group relative cursor-pointer",
                badge.isEarned 
                  ? "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-primary/30" 
                  : "bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800 opacity-60 hover:opacity-100"
              )}
            >
              {!badge.isEarned && (
                <div className="absolute top-2 right-2 text-slate-400" title="Locked">
                  <Lock size={14} />
                </div>
              )}
              <div className="w-16 h-16 mb-3 relative flex items-center justify-center">
                <Hexagon 
                  className={clsx("w-full h-full absolute transition-transform duration-300", badge.isEarned && "group-hover:scale-110")}
                  style={{ color: color, fill: badge.isEarned ? `${color}33` : 'transparent' }} 
                />
                <span className={clsx("text-2xl z-10", !badge.isEarned && "grayscale opacity-50")}>{badge.iconUrl}</span>
              </div>
              <h4 className="font-semibold text-sm text-center mb-1 line-clamp-1">{badge.name}</h4>
              <p className="text-xs text-slate-500 text-center line-clamp-2 mb-2 h-8">{badge.description}</p>
              <p className="text-[10px] font-medium mt-auto" style={{ color: badge.isEarned ? color : '#94A3B8' }}>
                {badge.isEarned ? (badge.awardedAt ? format(new Date(badge.awardedAt), 'MMM d, yyyy') : 'Earned') : 'Next Badge'}
              </p>
            </div>
          );
        })}
      </div>

      {selectedBadge && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setSelectedBadge(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-sm w-full shadow-2xl relative border border-slate-200 dark:border-slate-800"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 mb-4 relative flex items-center justify-center">
                <Hexagon 
                  className="w-full h-full absolute"
                  style={{ 
                    color: selectedBadge.isEarned ? (selectedBadge.color || '#FCD34D') : '#94A3B8', 
                    fill: selectedBadge.isEarned ? `${selectedBadge.color || '#FCD34D'}33` : 'transparent' 
                  }} 
                />
                <span className={clsx("text-4xl z-10", !selectedBadge.isEarned && "grayscale opacity-50")}>
                  {selectedBadge.iconUrl}
                </span>
                {!selectedBadge.isEarned && (
                  <div className="absolute top-0 right-0 bg-slate-800 text-white p-1 rounded-full border-2 border-white dark:border-slate-900 shadow-sm z-20">
                    <Lock size={12} />
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-bold font-heading mb-2">{selectedBadge.name}</h3>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 mb-4">
                <Sparkles size={12} className="text-amber-500" />
                Category: <span className="capitalize">{selectedBadge.category}</span>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                {selectedBadge.description}
              </p>
              
              <div className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Status</p>
                  <p className="font-semibold text-sm" style={{ color: selectedBadge.isEarned ? (selectedBadge.color || '#FCD34D') : '#94A3B8' }}>
                    {selectedBadge.isEarned ? 'Earned' : 'Locked'}
                  </p>
                </div>
                {selectedBadge.isEarned && selectedBadge.awardedAt && (
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-0.5">Awarded On</p>
                    <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                      {format(new Date(selectedBadge.awardedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
