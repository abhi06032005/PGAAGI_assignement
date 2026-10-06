'use client';

import React from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchFeed } from '@/features/feed/feedThunks';
import { Bookmark, AlertCircle } from 'lucide-react';

export const PulseStatesRow: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <section aria-labelledby="settings-states-heading" className="space-y-3">
      {/* Header */}
      <h2 id="settings-states-heading" className="text-sm font-bold text-slate-900 tracking-tight">
        Settings and states
      </h2>

      {/* 3 State Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* 1. Preferences Card */}
        <div className="bg-white/95 rounded-2xl p-4 border border-black/5 shadow-sm space-y-2.5">
          <h3 className="text-xs font-bold text-slate-900 mb-2">
            Preferences
          </h3>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Technology</span>
            <span className="bg-[#cbf63a] text-black font-bold text-[11px] px-2.5 py-0.5 rounded-full">
              On
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Sports</span>
            <span className="bg-slate-100 text-slate-600 font-semibold text-[11px] px-2.5 py-0.5 rounded-full">
              Off
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-600 font-medium">Language</span>
            <span className="text-slate-500 font-medium text-[11px]">English</span>
          </div>
        </div>

        {/* 2. Empty State Card */}
        <div className="bg-white/95 rounded-2xl p-4 border border-black/5 shadow-sm flex flex-col items-center justify-center text-center py-6">
          <Bookmark className="w-5 h-5 text-slate-400 mb-2" />
          <h3 className="text-xs font-bold text-slate-900">
            No favorites yet
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 max-w-[12rem]">
            Tap the heart on any card to save it here
          </p>
        </div>

        {/* 3. Error State Card */}
        <div className="bg-white/95 rounded-2xl p-4 border border-black/5 shadow-sm flex flex-col items-center justify-center text-center py-6">
          <AlertCircle className="w-5 h-5 text-rose-500 mb-2" />
          <h3 className="text-xs font-bold text-slate-900">
            Couldn&apos;t load news
          </h3>
          <button
            onClick={() => dispatch(fetchFeed({ resetPage: true }))}
            className="mt-2.5 bg-black hover:bg-slate-800 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </section>
  );
};
