'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleCategory } from '@/features/preferences/preferencesSlice';
import { setSettingsModalOpen } from '@/features/auth/authSlice';
import { Category, ContentItem } from '@/types';
import { PulseWeekChart } from '@/components/clone/PulseWeekChart';
import { GlassCard } from '@/components/ui/GlassCard';
import { NowPlaying } from '@/features/spotify/NowPlaying';
import { RecentlyPlayed } from '@/features/spotify/RecentlyPlayed';
import {
  Cpu,
  Film,
  TrendingUp,
  Trophy,
  Plus,
  BarChart3,
} from 'lucide-react';

export const RightSidebar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const selectedCategories = useAppSelector((state) => state.preferences.favoriteCategories);
  const favoriteCount = useAppSelector((state) => state.favorites.favoriteIds.length);
  const items = useAppSelector((state) => state.feed.items);

  const interestChips: { id: Category; label: string; icon: React.ElementType }[] = [
    { id: 'technology', label: 'Tech', icon: Cpu },
    { id: 'entertainment', label: 'Movies', icon: Film },
    { id: 'finance', label: 'Finance', icon: TrendingUp },
    { id: 'sports', label: 'Sports', icon: Trophy },
  ];

  return (
    <aside
      aria-label="Sidebar widgets"
      className={`w-full xl:w-72 flex-shrink-0 flex flex-col gap-4 ${className}`}
    >
      {/* 1. Your Week Bar Chart matching reference mockup */}
      <PulseWeekChart />

      {/* 2. Spotify Now Playing Widget */}
      <NowPlaying />

      {/* 3. Your Interests Quick Chips */}
      <GlassCard className="p-4 border border-white/80 dark:border-stone-800 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">Your Interests</h3>
          <button
            onClick={() => dispatch(setSettingsModalOpen(true))}
            className="text-[11px] font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
          >
            Edit
          </button>
        </div>
        <p className="text-[11px] text-stone-500 mb-3">Filter topics you care about</p>

        <div className="flex flex-wrap gap-1.5">
          {interestChips.map((chip) => {
            const Icon = chip.icon;
            const isSelected = selectedCategories.includes(chip.id);
            return (
              <button
                key={chip.id}
                onClick={() => dispatch(toggleCategory(chip.id))}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 border-stone-900 dark:border-white shadow-xs'
                    : 'bg-white/60 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{chip.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => dispatch(setSettingsModalOpen(true))}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-dashed border-stone-300 dark:border-stone-700 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        </div>
      </GlassCard>

      {/* 4. Quick Stats Tile */}
      <GlassCard className="p-4 border border-white/80 dark:border-stone-800 shadow-sm">
        <div className="flex items-center gap-1.5 mb-3">
          <BarChart3 className="w-3.5 h-3.5 text-stone-500" />
          <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">Dashboard Metrics</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-stone-800/70 border border-stone-100 dark:border-stone-800">
            <span className="text-base font-extrabold text-stone-900 dark:text-stone-100 block">
              {Math.max(12, items.filter((i: ContentItem) => i.type === 'news').length)}
            </span>
            <span className="text-[10px] text-stone-500">Articles In Feed</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-stone-800/70 border border-stone-100 dark:border-stone-800">
            <span className="text-base font-extrabold text-stone-900 dark:text-stone-100 block">
              {favoriteCount}
            </span>
            <span className="text-[10px] text-stone-500">Saved Favorites</span>
          </div>
        </div>
      </GlassCard>

      {/* 5. Recently Played Music */}
      <RecentlyPlayed />
    </aside>
  );
};

export default RightSidebar;
