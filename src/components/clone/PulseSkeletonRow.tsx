'use client';

import React from 'react';

export const PulseSkeletonRow: React.FC = () => {
  return (
    <section aria-label="Loading more items" className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
          More for you
        </h2>
        <span className="text-xs font-medium text-slate-400">
          Loading as you scroll
        </span>
      </div>

      {/* 3 Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="bg-white/95 rounded-2xl p-4 border border-black/5 shadow-sm space-y-3 animate-pulse"
          >
            <div className="h-14 bg-slate-200/70 rounded-xl w-full" />
            <div className="h-3 bg-slate-200/70 rounded-full w-4/5" />
            <div className="h-2.5 bg-slate-200/70 rounded-full w-3/5" />
          </div>
        ))}
      </div>
    </section>
  );
};
