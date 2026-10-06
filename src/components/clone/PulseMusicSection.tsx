'use client';

import React, { useEffect } from 'react';
import { Music2, Radio, Disc3, CheckCircle2, Play, Sparkles } from 'lucide-react';
import { signIn, signOut } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchMusicForYou,
  fetchSpotifyStatus,
  playTrack,
  playPlaylist,
  connectSpotifyDemo,
  disconnectSpotify,
} from '@/features/spotify/spotifySlice';
import { SafeImage } from '@/components/ui/SafeImage';
import { MusicItem } from '@/types';

export const PulseMusicSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isConnected, musicForYou, nowPlaying, currentTrack, isPlaying } = useAppSelector((state) => state.spotify);

  useEffect(() => {
    dispatch(fetchSpotifyStatus());
    dispatch(fetchMusicForYou());
  }, [dispatch]);

  const handleConnect = () => {
    signIn('spotify', { callbackUrl: '/' });
  };

  const handleDemoConnect = () => {
    dispatch(connectSpotifyDemo());
  };

  const handleDisconnect = () => {
    dispatch(disconnectSpotify());
    signOut({ redirect: false }).catch(() => {});
  };

  const displayTracks: MusicItem[] =
    musicForYou.length > 0
      ? musicForYou.slice(0, 3)
      : [
          {
            id: 'm83-midnight',
            type: 'music',
            title: 'Midnight City',
            artist: 'M83',
            album: 'Hurry Up, We’re Dreaming',
            summary: 'Iconic synthpop anthem',
            category: 'entertainment',
            timestamp: 'Staff Pick',
            imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80',
          },
          {
            id: 'cg-redbone',
            type: 'music',
            title: 'Redbone',
            artist: 'Childish Gambino',
            album: 'Awaken, My Love!',
            summary: 'Grammy-winning psychedelic funk',
            category: 'entertainment',
            timestamp: 'Staff Pick',
            imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80',
          },
          {
            id: 'tycho-dive',
            type: 'music',
            title: 'Coastal Brake',
            artist: 'Tycho',
            album: 'Dive',
            summary: 'Ambient electronic focus beats',
            category: 'technology',
            timestamp: 'Staff Pick',
            imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
          },
        ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* 1. Connect Spotify Card (Lime Green) */}
      <div className="bg-[#d2f845] rounded-2xl p-4 flex flex-col justify-between shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center">
              {isConnected ? <CheckCircle2 className="w-3 h-3 text-[#d2f845]" /> : <Disc3 className="w-3 h-3" />}
            </div>
            <h3 className="text-xs font-bold text-black tracking-tight">
              {isConnected ? 'Spotify Connected' : 'Connect Spotify'}
            </h3>
          </div>
          <p className="text-[11px] text-slate-800 font-medium leading-relaxed pl-7">
            {isConnected
              ? nowPlaying
                ? `Playing: ${nowPlaying.title} · ${nowPlaying.artist}`
                : 'Listening profile and top artists synced'
              : 'Get music picks from your listening history'}
          </p>
        </div>

        <div className="pt-4 pl-7 flex items-center gap-2 flex-wrap">
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              className="bg-black hover:bg-slate-800 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm transition-colors cursor-pointer"
            >
              Disconnect
            </button>
          ) : (
            <>
              <button
                onClick={handleConnect}
                className="bg-black hover:bg-slate-800 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm transition-colors cursor-pointer"
              >
                Connect account
              </button>
              <button
                onClick={handleDemoConnect}
                className="bg-white/80 hover:bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                title="Instant preview connect"
              >
                <Sparkles className="w-3 h-3 text-black" />
                <span>Demo Connect</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Music for you Card */}
      <div className="bg-white/95 dark:bg-stone-900 rounded-2xl p-4 border border-black/5 dark:border-white/10 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold text-slate-900 dark:text-stone-100">
            Music for you
          </h3>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            In-App Player Active
          </span>
        </div>

        <div className="space-y-1.5">
          {displayTracks.map((track, idx) => {
            const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;
            return (
              <div
                key={track.id}
                onClick={() =>
                  dispatch(
                    playPlaylist({
                      playlist: displayTracks,
                      startIndex: idx,
                      title: 'Curated Picks',
                    })
                  )
                }
                className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                  isThisTrackPlaying
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'hover:bg-slate-100 dark:hover:bg-stone-800/60'
                }`}
                title="Play track in app"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {track.imageUrl ? (
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                      <SafeImage src={track.imageUrl} alt={track.title} fill className="object-cover" />
                      {isThisTrackPlaying && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Disc3 className="w-4 h-4 text-emerald-400 animate-spin" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        idx === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'
                      }`}
                    >
                      <Music2 className="w-4 h-4" />
                    </div>
                  )}
                  <div className="leading-tight min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-stone-100 truncate">
                      {track.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-stone-400 truncate block">
                      {track.artist}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <button
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isThisTrackPlaying
                        ? 'bg-[#1db954] text-black'
                        : 'bg-black/5 dark:bg-white/10 text-slate-700 dark:text-stone-300 hover:bg-[#1db954] hover:text-black'
                    }`}
                    aria-label={`Play ${track.title}`}
                  >
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PulseMusicSection;
