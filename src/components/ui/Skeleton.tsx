import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`animate-pulse bg-stone-200/70 dark:bg-stone-800/80 rounded-lg ${className}`} />;
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-3xl p-5 border border-white/80 dark:border-stone-800/80 bg-white/70 dark:bg-stone-900/70 shadow-sm animate-pulse flex flex-col justify-between h-[380px]">
      <div>
        <div className="w-full h-44 bg-stone-200/80 dark:bg-stone-800 rounded-2xl mb-4" />
        <div className="flex gap-2 mb-3">
          <div className="w-16 h-5 bg-stone-200/80 dark:bg-stone-800 rounded-full" />
          <div className="w-20 h-5 bg-stone-200/80 dark:bg-stone-800 rounded-full" />
        </div>
        <div className="w-3/4 h-5 bg-stone-200/80 dark:bg-stone-800 rounded mb-2" />
        <div className="w-full h-4 bg-stone-200/80 dark:bg-stone-800 rounded mb-1" />
        <div className="w-2/3 h-4 bg-stone-200/80 dark:bg-stone-800 rounded" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800 mt-4">
        <div className="w-24 h-4 bg-stone-200/80 dark:bg-stone-800 rounded" />
        <div className="w-20 h-8 bg-stone-200/80 dark:bg-stone-800 rounded-xl" />
      </div>
    </div>
  );
};

export const FeedSkeletonList: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

export default Skeleton;
