'use client';

import React from 'react';
import { Square, Heart, Repeat, MessageSquare } from 'lucide-react';

export const PulseNasaSocial: React.FC = () => {
  return (
    <article
      aria-label="Social post from NASA"
      className="bg-white/95 dark:bg-stone-900/95 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Square className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-stone-100">NASA</span>
          <span className="text-xs text-slate-500 dark:text-stone-400 font-medium">@NASA · #space</span>
        </div>

        <span className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded">
          Post
        </span>
      </div>

      {/* Content */}
      <p className="text-xs text-slate-800 dark:text-stone-200 leading-relaxed pl-5 mb-3">
        The universe is not stranger than we imagine, it is stranger than we can imagine.
      </p>

      {/* Metrics */}
      <div className="flex items-center gap-4 pl-5 text-[11px] text-slate-500 dark:text-stone-400">
        <div className="flex items-center gap-1 hover:text-rose-500 cursor-pointer transition-colors">
          <Heart className="w-3.5 h-3.5" />
          <span>24.5K</span>
        </div>

        <div className="flex items-center gap-1 hover:text-emerald-500 cursor-pointer transition-colors">
          <Repeat className="w-3.5 h-3.5" />
          <span>3.2K</span>
        </div>

        <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer transition-colors">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>1.1K</span>
        </div>
      </div>
    </article>
  );
};
