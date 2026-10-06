'use client';

import React, { useEffect, useState } from 'react';
import { SpotifyArtist } from '@/types';
import { apiClient } from '@/lib/api/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Users, Sparkles } from 'lucide-react';
import { SafeImage } from '@/components/ui/SafeImage';

export const TopArtists: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [artists, setArtists] = useState<SpotifyArtist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get<{ success: boolean; items: SpotifyArtist[] }>('/api/spotify/top-artists')
      .then((res) => {
        if (isMounted && res.items) {
          setArtists(res.items);
        }
      })
      .catch(() => {
        // Fallback
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading && artists.length === 0) {
    return (
      <GlassCard className={`p-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-1/3" />
          <div className="flex gap-2">
            <div className="w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-800" />
            <div className="w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-800" />
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={`p-4 border border-white/60 dark:border-stone-800 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">Top Artists</h3>
        </div>
        <span className="text-[10px] text-stone-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Heavy Rotation</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {artists.slice(0, 6).map((artist) => (
          <div
            key={artist.id}
            className="flex flex-col items-center text-center p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-sm mb-2 border border-white/80 dark:border-stone-700">
              <SafeImage
                src={artist.imageUrl}
                alt={artist.name}
                fill
                className="object-cover"
              />
            </div>
            <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate w-full">
              {artist.name}
            </p>
            <p className="text-[10px] text-stone-500 truncate w-full capitalize">
              {artist.genres[0] || 'Artist'}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default TopArtists;
