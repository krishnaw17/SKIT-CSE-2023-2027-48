import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { Sparkles, Trophy } from 'lucide-react';

interface RewardPopupProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'LEVEL_UP' | 'BADGE_EARNED' | 'XP_AWARDED';
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function RewardPopup({ isOpen, onClose, type, title, description, icon }: RewardPopupProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const iconWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Animation timeline
    const tl = gsap.timeline();

    // Reset properties in case of re-open
    gsap.set(modalRef.current, { scale: 0.8, opacity: 0, y: 50 });
    gsap.set(overlayRef.current, { opacity: 0 });
    gsap.set(iconWrapperRef.current, { scale: 0.5, rotation: -180 });

    tl.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      .to(modalRef.current, { 
        scale: 1, 
        opacity: 1, 
        y: 0, 
        duration: 0.5, 
        ease: 'back.out(1.5)' 
      }, '-=0.2')
      .to(iconWrapperRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)'
      }, '-=0.3');

    // Auto close after 4 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 4000);

    return () => {
      clearTimeout(timer);
      tl.kill();
    };
  }, [isOpen]);

  const handleClose = () => {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(modalRef.current, { scale: 0.9, opacity: 0, y: 20, duration: 0.2, ease: 'power2.in' })
      .to(overlayRef.current, { opacity: 0, duration: 0.2 }, '-=0.1');
  };

  if (!isOpen) return null;

  const defaultIcon = type === 'LEVEL_UP' ? <Trophy className="w-12 h-12 text-amber-500" /> : 
                      type === 'BADGE_EARNED' ? <Sparkles className="w-12 h-12 text-indigo-500" /> : 
                      <span className="text-4xl font-bold text-primary font-number">+XP</span>;

  const getColors = () => {
    switch (type) {
      case 'LEVEL_UP': return 'from-amber-400 to-orange-500 text-amber-900 border-amber-200';
      case 'BADGE_EARNED': return 'from-indigo-400 to-purple-500 text-indigo-900 border-indigo-200';
      default: return 'from-blue-400 to-cyan-500 text-blue-900 border-blue-200';
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4">
      {/* Overlay (optional, maybe we don't want a full overlay for just a popup) */}
      <div 
        ref={overlayRef} 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] pointer-events-auto"
        onClick={handleClose}
      />

      {/* Modal */}
      <div 
        ref={modalRef}
        className={clsx(
          "relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border pointer-events-auto max-w-sm w-full overflow-hidden text-center p-8",
          type === 'LEVEL_UP' ? 'border-amber-200 dark:border-amber-900/50' :
          type === 'BADGE_EARNED' ? 'border-indigo-200 dark:border-indigo-900/50' :
          'border-blue-200 dark:border-blue-900/50'
        )}
      >
        {/* Animated Background Gradient */}
        <div className={clsx(
          "absolute inset-0 opacity-10 bg-gradient-to-br",
          getColors()
        )} />

        <div className="relative z-10 flex flex-col items-center">
          <div ref={iconWrapperRef} className={clsx(
            "w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br shadow-lg",
            type === 'LEVEL_UP' ? 'from-amber-100 to-amber-50 dark:from-amber-900 dark:to-slate-900' :
            type === 'BADGE_EARNED' ? 'from-indigo-100 to-indigo-50 dark:from-indigo-900 dark:to-slate-900' :
            'from-blue-100 to-blue-50 dark:from-blue-900 dark:to-slate-900'
          )}>
            {icon || defaultIcon}
          </div>
          
          <span className="text-xs font-bold tracking-widest uppercase mb-2 text-slate-500 dark:text-slate-400">
            {type.replace('_', ' ')}
          </span>
          <h2 className="text-2xl font-heading font-bold mb-2">
            {title}
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
