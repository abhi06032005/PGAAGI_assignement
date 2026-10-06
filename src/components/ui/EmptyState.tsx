'use client';

import React from 'react';
import { GlassCard } from './GlassCard';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <GlassCard className={`p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto ${className}`}>
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400 mb-4 shadow-inner">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">{title}</h3>
      <p className="text-sm text-stone-500 dark:text-stone-400 mb-6 max-w-xs">{description}</p>
      {action && <div>{action}</div>}
    </GlassCard>
  );
};

export default EmptyState;
