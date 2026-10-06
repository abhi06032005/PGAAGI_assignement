'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserVibe, setVibeOverride } from './vibeSlice';
import { fetchFeed } from '@/features/feed/feedThunks';
import { GlassCard } from '@/components/ui/GlassCard';
import { VibeChip } from './VibeChip';
import { VibeLabel } from '@/types';
import { Radio, RefreshCw, Music2 } from 'lucide-react';

const ALL_VIBES: VibeLabel[] = ['Chill', 'Energetic', 'Focused', 'Feel-good', 'Hype'];

export const VibeCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const { data, activeOverride, status } = useAppSelector((state) => state.vibe);
  const currentVibe = activeOverride || data.primaryVibe;

  useEffect(() => {
    dispatch(fetchUserVibe());
  }, [dispatch]);

  const handleSelectVibe = (vibe: VibeLabel) => {
    const nextVibe = activeOverride === vibe ? null : vibe;
    dispatch(setVibeOverride(nextVibe));
    // Re-rank feed according to new vibe
    dispatch(fetchFeed({ resetPage: true }));
  };

  return (
    <GlassCard className={`p-5 relative overflow-hidden border border-white/60 dark:border-stone-800 shadow-sm ${className}`}>
      {/* Decorative ambient gradient backdrop */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-bl from-indigo-500/10 via-fuchsia-500/10 to-transparent rounded-full blur-2xl pointer-events-none -mr-16 -mt-8" />

      <div className="relative z-10 flex flex-col justify-between h-full gap-4">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-300 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>Your Vibe Right Now</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-stone-600 dark:text-stone-300">
                  {currentVibe}
                </span>
              </h3>
              <p className="text-[11px] text-stone-500">
                Derived from Spotify listening history & time of day
              </p>
            </div>
          </div>

          <button
            onClick={() => dispatch(fetchUserVibe())}
            title="Refresh listening vibe"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${status === 'loading' ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
          {data.description}
        </p>

        {/* Driving Artists */}
        {data.drivingArtists && data.drivingArtists.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 flex items-center gap-1">
              <Music2 className="w-3 h-3" />
              <span>Influenced by:</span>
            </span>
            {data.drivingArtists.map((artist) => (
              <span
                key={artist}
                className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium"
              >
                {artist}
              </span>
            ))}
          </div>
        )}

        {/* Vibe Selector Buttons */}
        <div className="pt-2 border-t border-stone-200/50 dark:border-stone-800 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mr-1">
            Tune Mood:
          </span>
          {ALL_VIBES.map((v) => (
            <VibeChip
              key={v}
              vibe={v}
              isActive={currentVibe === v}
              onClick={() => handleSelectVibe(v)}
            />
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export default VibeCard;
