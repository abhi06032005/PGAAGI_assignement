'use client';

import React from 'react';
import { MusicItem } from '@/types';
import { Music, Heart, Play } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SafeImage } from '@/components/ui/SafeImage';
import { useAppDispatch } from '@/store/hooks';
import { playTrack } from '@/features/spotify/spotifySlice';

interface MusicCardProps {
  item: MusicItem;
  isFavorite?: boolean;
  onToggleFavorite?: (item: MusicItem) => void;
  onSelect?: (item: MusicItem) => void;
}

export const MusicCard: React.FC<MusicCardProps> = ({
  item,
  isFavorite = false,
  onToggleFavorite,
  onSelect,
}) => {
  const dispatch = useAppDispatch();
  return (
    <GlassCard
      variant="interactive"
      onClick={() => onSelect?.(item)}
      className="p-5 flex flex-col justify-between group overflow-hidden"
    >
      <div>
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-4 bg-emerald-500/10">
          {item.imageUrl ? (
            <SafeImage
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-emerald-500">
              <Music className="w-12 h-12" />
            </div>
          )}

          {/* Favorite button */}
          <button
            type="button"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(item);
            }}
            className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all ${
              isFavorite
                ? 'bg-rose-500 text-white'
                : 'bg-black/30 text-white hover:bg-black/50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
          <Music className="w-3.5 h-3.5" />
          <span>Spotify Track</span>
        </div>

        <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-base line-clamp-1 group-hover:text-emerald-600 transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
          {item.artist} {item.album ? `• ${item.album}` : ''}
        </p>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500">
        <span className="truncate max-w-[140px]">{item.summary}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            dispatch(playTrack(item));
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1db954] hover:bg-[#1aa34a] text-black font-bold text-xs shadow-xs transition-transform hover:scale-105 cursor-pointer"
        >
          <Play className="w-3 h-3 fill-current ml-0.5" />
          <span>Play in App</span>
        </button>
      </div>
    </GlassCard>
  );
};

export default MusicCard;
