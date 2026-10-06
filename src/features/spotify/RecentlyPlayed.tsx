'use client';

import React, { useEffect, useState } from 'react';
import { SpotifyTrack } from '@/types';
import { apiClient } from '@/lib/api/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { History, ExternalLink } from 'lucide-react';
import { SafeImage } from '@/components/ui/SafeImage';

export const RecentlyPlayed: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get<{ success: boolean; items: SpotifyTrack[] }>('/api/spotify/recently-played')
      .then((res) => {
        if (isMounted && res.items) {
          setTracks(res.items);
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

  if (loading && tracks.length === 0) {
    return (
      <GlassCard className={`p-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-1/3" />
          <div className="h-10 bg-stone-200 dark:bg-stone-800 rounded" />
          <div className="h-10 bg-stone-200 dark:bg-stone-800 rounded" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={`p-4 border border-white/60 dark:border-stone-800 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <History className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">Recently Played</h3>
      </div>

      <div className="space-y-2">
        {tracks.slice(0, 5).map((track) => (
          <a
            key={track.id}
            href={track.spotifyUrl || 'https://open.spotify.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100 dark:bg-stone-800">
                <SafeImage
                  src={track.albumArt}
                  alt={track.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate group-hover:underline">
                  {track.name}
                </p>
                <p className="text-[11px] text-stone-500 truncate">
                  {track.artists.join(', ')}
                </p>
              </div>
            </div>

            <ExternalLink className="w-3.5 h-3.5 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
          </a>
        ))}
      </div>
    </GlassCard>
  );
};

export default RecentlyPlayed;
