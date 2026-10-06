'use client';

import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'solid' | 'interactive' | 'pastel';
  pastelColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = 'default',
  pastelColor,
  style,
  ...props
}) => {
  return (
    <div
      style={pastelColor ? { backgroundColor: pastelColor, ...style } : style}
      className={twMerge(
        clsx(
          'rounded-3xl transition-all duration-200',
          // Light glass default
          variant === 'default' &&
            'bg-white/70 backdrop-blur-md border border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:bg-stone-900/75 dark:border-stone-800/80 dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]',
          // Solid fallback variant
          variant === 'solid' &&
            'bg-white border border-stone-200/80 shadow-sm dark:bg-stone-900 dark:border-stone-800',
          // Interactive hover variant
          variant === 'interactive' &&
            'bg-white/75 backdrop-blur-md border border-white/80 shadow-sm hover:shadow-md hover:bg-white/90 dark:bg-stone-900/80 dark:border-stone-800 hover:dark:bg-stone-900 cursor-pointer',
          // Pastel variant
          variant === 'pastel' &&
            'border border-white/60 shadow-sm backdrop-blur-sm dark:bg-stone-900 dark:border-stone-800',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
export default GlassCard;
