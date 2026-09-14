import * as React from 'react';
import clsx from 'clsx';

interface AvatarProps {
  src?: string | undefined;
  alt?: string | undefined;
  fallback?: string | undefined;
  size?: 'sm' | 'md' | 'lg' | 'xl' | undefined;
  className?: string | undefined;
}

export function Avatar({ src, alt = 'Avatar', fallback, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl'
  };

  return (
    <div className={clsx("relative inline-flex items-center justify-center overflow-hidden bg-slate-200 dark:bg-slate-700 rounded-full", sizeClasses[size], className)}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className="font-medium text-slate-500 dark:text-slate-300">
          {fallback || alt.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
