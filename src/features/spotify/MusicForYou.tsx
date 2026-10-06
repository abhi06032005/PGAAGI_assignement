'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMusicForYou } from './spotifySlice';
import { MusicCard } from '@/components/cards/MusicCard';
import { toggleFavorite } from '@/features/favorites/favoritesSlice';
import { setSelectedDetailItem } from '@/features/feed/feedSlice';
import { Music2, Sparkles } from 'lucide-react';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { MusicItem } from '@/types';

export const MusicForYou: React.FC<{ className?: string }> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const { musicForYou, status } = useAppSelector((state) => state.spotify);
  const favoriteIds = useAppSelector((state) => state.favorites.favoriteIds);

  useEffect(() => {
    dispatch(fetchMusicForYou());
  }, [dispatch]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Music2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <span>Music For You</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            </h3>
            <p className="text-[11px] text-stone-500">
              Curated from top artist catalog & search matching your listening vibe
            </p>
          </div>
        </div>
      </div>

      {status === 'loading' && musicForYou.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {musicForYou.slice(0, 4).map((track: MusicItem) => (
            <MusicCard
              key={track.id}
              item={track}
              isFavorite={favoriteIds.includes(track.id)}
              onToggleFavorite={() => dispatch(toggleFavorite(track))}
              onSelect={() => dispatch(setSelectedDetailItem(track))}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MusicForYou;
