'use client';

import React, { useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Music, Play, Volume2, ExternalLink } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNowPlaying } from './spotifySlice';
import { SafeImage } from '@/components/ui/SafeImage';

export const NowPlaying: React.FC<{ className?: string }> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const nowPlaying = useAppSelector((state) => state.spotify.nowPlaying);

  useEffect(() => {
    dispatch(fetchNowPlaying());
    const interval = setInterval(() => {
      dispatch(fetchNowPlaying());
    }, 15000);
    return () => clearInterval(interval);
  }, [dispatch]);

  if (!nowPlaying) {
    return (
      <GlassCard className={`p-4 flex items-center gap-3 text-stone-500 text-xs ${className}`}>
        <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
          <Music className="w-4 h-4 text-stone-400" />
        </div>
        <span>No Spotify track currently playing</span>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={`p-4 flex items-center justify-between border-emerald-500/20 ${className}`}>
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-emerald-500/10 flex-shrink-0">
          {nowPlaying.imageUrl ? (
            <SafeImage src={nowPlaying.imageUrl} alt={nowPlaying.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-5 h-5 text-emerald-500" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Play className="w-4 h-4 text-white fill-current" />
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
            <Volume2 className="w-3 h-3 animate-pulse" />
            <span>Now Playing</span>
          </div>
          <h5 className="font-semibold text-xs text-stone-900 dark:text-stone-100 truncate">
            {nowPlaying.title}
          </h5>
          <p className="text-[11px] text-stone-500 truncate">
            {nowPlaying.artist}
          </p>
        </div>
      </div>

      {nowPlaying.url && (
        <a
          href={nowPlaying.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl text-stone-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors flex-shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </GlassCard>
  );
};

export default NowPlaying;
