'use client';

import React, { useEffect } from 'react';
import { Music2, Radio, Disc3, CheckCircle2 } from 'lucide-react';
import { signIn, signOut } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMusicForYou, fetchSpotifyStatus } from '@/features/spotify/spotifySlice';
import { SafeImage } from '@/components/ui/SafeImage';

export const PulseMusicSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isConnected, musicForYou, nowPlaying } = useAppSelector((state) => state.spotify);

  useEffect(() => {
    dispatch(fetchSpotifyStatus());
    dispatch(fetchMusicForYou());
  }, [dispatch]);

  const handleConnect = () => {
    signIn('spotify', { callbackUrl: '/' });
  };

  const handleDisconnect = () => {
    signOut({ callbackUrl: '/' });
  };

  const displayTracks =
    musicForYou.length > 0
      ? musicForYou.slice(0, 2)
      : [
          {
            id: 'm83-midnight',
            title: 'Midnight City',
            artist: 'M83',
            imageUrl: '',
          },
          {
            id: 'cg-redbone',
            title: 'Redbone',
            artist: 'Childish Gambino',
            imageUrl: '',
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

        <div className="pt-4 pl-7 flex items-center gap-2">
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              className="bg-black hover:bg-slate-800 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm transition-colors cursor-pointer"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="bg-black hover:bg-slate-800 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm transition-colors cursor-pointer"
            >
              Connect account
            </button>
          )}
        </div>
      </div>

      {/* 2. Music for you Card */}
      <div className="bg-white/95 rounded-2xl p-4 border border-black/5 shadow-sm flex flex-col justify-between">
        <h3 className="text-xs font-bold text-slate-900 mb-2.5">
          Music for you
        </h3>

        <div className="space-y-2">
          {displayTracks.map((track, idx) => (
            <div
              key={track.id}
              className="flex items-center justify-between p-1 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {track.imageUrl ? (
                  <div className="relative w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
                    <SafeImage src={track.imageUrl} alt={track.title} fill className="object-cover" />
                  </div>
                ) : (
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      idx === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'
                    }`}
                  >
                    <Music2 className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="leading-tight min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {track.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {track.artist}
                  </span>
                </div>
              </div>

              <Radio className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PulseMusicSection;
