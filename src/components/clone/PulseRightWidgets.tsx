'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleCategory } from '@/features/preferences/preferencesSlice';
import { setSettingsModalOpen } from '@/features/auth/authSlice';

export const PulseRightWidgets: React.FC = () => {
  const dispatch = useAppDispatch();
  const favoriteCount = useAppSelector((state) => state.favorites.favoriteIds.length);

  return (
    <aside
      aria-label="Side widgets"
      className="w-full xl:w-64 flex-shrink-0 flex flex-col gap-3.5 select-none"
    >
      {/* 1. Your interests */}
      <section className="bg-white/95 dark:bg-stone-900/95 rounded-2xl p-4 border border-black/5 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-900 dark:text-stone-100">
            Your interests
          </h2>
          <button
            onClick={() => dispatch(setSettingsModalOpen(true))}
            className="text-[11px] font-medium text-slate-400 dark:text-stone-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            Edit
          </button>
        </div>

        <div className="space-y-2">
          {/* Row 1: Lime Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(toggleCategory('technology'))}
              className="bg-[#cbf63a] text-black text-xs font-bold px-3.5 py-1 rounded-full shadow-sm hover:scale-105 transition-transform cursor-pointer"
            >
              Tech
            </button>
            <button
              onClick={() => dispatch(toggleCategory('finance'))}
              className="bg-[#cbf63a] text-black text-xs font-bold px-3.5 py-1 rounded-full shadow-sm hover:scale-105 transition-transform cursor-pointer"
            >
              Finance
            </button>
          </div>

          {/* Row 2: Outline Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(toggleCategory('sports'))}
              className="bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 hover:border-black dark:hover:border-stone-500 text-slate-700 dark:text-stone-200 text-xs font-medium px-3.5 py-1 rounded-full shadow-sm transition-colors cursor-pointer"
            >
              Sports
            </button>
            <button
              onClick={() => dispatch(toggleCategory('entertainment'))}
              className="bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 hover:border-black dark:hover:border-stone-500 text-slate-700 dark:text-stone-200 text-xs font-medium px-3.5 py-1 rounded-full shadow-sm transition-colors cursor-pointer"
            >
              Movies
            </button>
            <button
              onClick={() => dispatch(setSettingsModalOpen(true))}
              className="bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 hover:border-black dark:hover:border-stone-500 text-slate-500 dark:text-stone-400 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm transition-colors cursor-pointer"
            >
              + Add
            </button>
          </div>
        </div>
      </section>

      {/* 2. Trending now */}
      <section className="bg-white/95 dark:bg-stone-900/95 rounded-2xl p-4 border border-black/5 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-900 dark:text-stone-100">
            Trending now
          </h2>
          <span className="bg-black dark:bg-stone-100 text-white dark:text-stone-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            News
          </span>
        </div>

        <div className="space-y-2.5 text-xs text-slate-800 dark:text-stone-200">
          <div className="flex items-center gap-2 cursor-pointer hover:text-black dark:hover:text-white">
            <span className="font-semibold text-slate-400 w-3">1</span>
            <span className="font-medium truncate">India GDP beats forecast</span>
          </div>

          <div className="flex items-center gap-2 cursor-pointer hover:text-black dark:hover:text-white">
            <span className="font-semibold text-slate-400 w-3">2</span>
            <span className="font-medium truncate">New iPhone leaks surface</span>
          </div>

          <div className="flex items-center gap-2 cursor-pointer hover:text-black dark:hover:text-white">
            <span className="font-semibold text-slate-400 w-3">3</span>
            <span className="font-medium truncate">Champions League recap</span>
          </div>
        </div>
      </section>

      {/* 3. Live updates */}
      <section className="bg-white/95 dark:bg-stone-900/95 rounded-2xl p-4 border border-black/5 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-slate-900 dark:text-stone-100">
            Live updates
          </h2>
          <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
            Live
          </span>
        </div>

        <div className="space-y-2 pt-1 text-xs">
          <div className="border-b border-slate-100 dark:border-stone-800 pb-2">
            <p className="font-semibold text-slate-900 dark:text-stone-100 leading-tight">
              Markets open higher
            </p>
            <span className="text-[10px] text-slate-400 dark:text-stone-500">just now</span>
          </div>

          <div>
            <p className="font-semibold text-slate-900 dark:text-stone-100 leading-tight">
              #NextJS trending
            </p>
            <span className="text-[10px] text-slate-400 dark:text-stone-500">1 min ago</span>
          </div>
        </div>
      </section>

      {/* 4. Quick Counts (12 Read / 7 Saved) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left: 12 Read */}
        <div className="bg-[#d2f845] rounded-2xl p-3.5 shadow-sm flex flex-col justify-between">
          <span className="text-2xl font-black text-black leading-none mb-1">
            12
          </span>
          <span className="text-xs font-bold text-slate-800">
            Read
          </span>
        </div>

        {/* Right: 7 Saved */}
        <div className="bg-white/95 dark:bg-stone-900/95 rounded-2xl p-3.5 border border-black/5 dark:border-white/10 shadow-sm flex flex-col justify-between">
          <span className="text-2xl font-black text-slate-900 dark:text-stone-100 leading-none mb-1">
            {Math.max(7, favoriteCount)}
          </span>
          <span className="text-xs font-bold text-slate-600 dark:text-stone-400">
            Saved
          </span>
        </div>
      </div>
    </aside>
  );
};
