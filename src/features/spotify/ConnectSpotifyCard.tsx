'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { signIn, signOut } from 'next-auth/react';
import { Music, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

export const ConnectSpotifyCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  const isConnected = useAppSelector((state) => state.spotify.isConnected);
  const [loading, setLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setErrorNotice(null);
    try {
      await signIn('spotify', { callbackUrl: '/' });
    } catch {
      setErrorNotice("Spotify isn't available for this account yet. Using high-fidelity catalog fallback.");
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    await signOut({ callbackUrl: '/' });
    setLoading(false);
  };

  if (isConnected) {
    return (
      <GlassCard className={`p-4 border border-emerald-500/20 bg-emerald-500/5 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>Spotify Connected</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </p>
              <p className="text-[11px] text-stone-500">
                Streaming live listening profile & curated catalog
              </p>
            </div>
          </div>

          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Disconnect
          </button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={`p-4 border border-white/60 dark:border-stone-800 shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1DB954] text-white flex items-center justify-center shadow-md shadow-[#1DB954]/20 flex-shrink-0">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1">
              <span>Connect Spotify</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </p>
            <p className="text-[11px] text-stone-500">
              Sync your real-time Now Playing track, recently played tracks, and top artists
            </p>
          </div>
        </div>

        <button
          onClick={handleConnect}
          disabled={loading}
          type="button"
          className="bg-[#1DB954] hover:bg-[#1aa34a] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <span>{loading ? 'Connecting...' : 'Connect Account'}</span>
        </button>
      </div>

      {errorNotice && (
        <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}
    </GlassCard>
  );
};

export default ConnectSpotifyCard;
