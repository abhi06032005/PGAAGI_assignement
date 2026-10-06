import React from 'react';
import { Category, ContentType } from '@/types';

export const Badge: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'pill';
}> = ({ children, className = '', variant = 'default' }) => {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide';
  const variants = {
    default: 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900',
    outline: 'border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300',
    pill: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300',
  };
  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
};

export const CategoryBadge: React.FC<{ category: Category; className?: string }> = ({
  category,
  className = '',
}) => {
  const styles: Record<Category, string> = {
    technology: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    finance: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    sports: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    entertainment: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    health: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    science: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    space: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    all: 'bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-500/20',
  };

  const labels: Record<Category, string> = {
    technology: 'Technology',
    finance: 'Finance',
    sports: 'Sports',
    entertainment: 'Entertainment',
    health: 'Health',
    science: 'Science',
    space: 'Space',
    all: 'All',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border uppercase tracking-wider ${styles[category] || 'bg-stone-100 text-stone-700'} ${className}`}
    >
      {labels[category] || category}
    </span>
  );
};

export const TypeBadge: React.FC<{ type: ContentType; className?: string }> = ({
  type,
  className = '',
}) => {
  const styles: Record<ContentType, string> = {
    news: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
    recommendation: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300 border-fuchsia-500/30',
    social: 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30',
    music: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
    apod: 'bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/30',
  };

  const labels: Record<ContentType, string> = {
    news: 'News',
    recommendation: 'Movie',
    social: 'Social',
    music: 'Music',
    apod: 'NASA APOD',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles[type] || 'bg-stone-100 text-stone-700'} ${className}`}
    >
      {labels[type] || type}
    </span>
  );
};

export default Badge;
