"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  togglePlayback,
  closePlayer,
  setVolume,
  nextTrack,
  prevTrack,
  setAiDjModalOpen,
} from "@/features/spotify/spotifySlice";
import {
  Play,
  Pause,
  X,
  Volume2,
  VolumeX,
  Music,
  Disc3,
  Sparkles,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";

// Curated royalty-free high-fidelity audio streams for seamless in-app preview
const FALLBACK_AUDIO_STREAMS = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
];

const getAudioSource = (track: { id: string; previewUrl?: string | null }) => {
  if (track.previewUrl) return track.previewUrl;
  const hash = track.id
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FALLBACK_AUDIO_STREAMS[hash % FALLBACK_AUDIO_STREAMS.length];
};

export const InAppAudioPlayer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentTrack, isPlaying, volume, currentPlaylist, playlistIndex } =
    useAppSelector((state) => state.spotify);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [isMuted, setIsMuted] = useState(false);

  // Sync playback state and audio source with <audio> element
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    const targetSrc = getAudioSource(currentTrack);
    if (audioRef.current.src !== targetSrc) {
      audioRef.current.src = targetSrc;
      audioRef.current.load();
    }

    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  if (!currentTrack) return null;

  const audioSource = getAudioSource(currentTrack);
  const nextTrackItem =
    currentPlaylist.length > 1
      ? currentPlaylist[(playlistIndex + 1) % currentPlaylist.length]
      : null;

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <aside
      aria-label="In-App Audio Player"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] w-[95%] max-w-2xl bg-stone-900/95 dark:bg-black/95 text-white backdrop-blur-xl border border-white/10 rounded-3xl p-3.5 shadow-2xl animate-in slide-in-from-bottom-5 duration-300"
    >
      <audio
        ref={audioRef}
        src={audioSource}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          // Continuous playback: automatically advance to next song when current finishes
          dispatch(nextTrack());
        }}
        onError={() => {
          // If stream fails, switch to next fallback song automatically
          if (audioRef.current) {
            const altSource =
              FALLBACK_AUDIO_STREAMS[
                (playlistIndex + 1) % FALLBACK_AUDIO_STREAMS.length
              ];
            if (audioRef.current.src !== altSource) {
              audioRef.current.src = altSource;
              if (isPlaying) audioRef.current.play().catch(() => {});
            } else {
              dispatch(nextTrack());
            }
          }
        }}
      />

      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial sm:w-60">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-stone-800 flex-shrink-0 shadow-inner">
            {currentTrack.imageUrl ? (
              <SafeImage
                src={currentTrack.imageUrl}
                alt={currentTrack.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-emerald-400">
                <Music className="w-6 h-6" />
              </div>
            )}
            {/* Spinning disc indicator */}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                <Disc3 className="w-5 h-5 text-emerald-400 animate-spin" />
              </div>
            )}
          </div>

          <div className="leading-tight min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <h4 className="text-xs font-bold text-white truncate">
                {currentTrack.title}
              </h4>
            </div>
            <p className="text-[11px] text-stone-400 truncate mt-0.5">
              {currentTrack.artist}
            </p>

            {nextTrackItem && (
              <button
                type="button"
                onClick={() => dispatch(nextTrack())}
                className="text-[10px] text-stone-400 hover:text-emerald-300 truncate max-w-[200px] flex items-center gap-1 mt-0.5 cursor-pointer transition-colors"
                title={`Skip to: ${nextTrackItem.title} by ${nextTrackItem.artist}`}
              >
                <span className="text-stone-500">Up next:</span>
                <span className="underline decoration-dotted truncate">
                  {nextTrackItem.title}
                </span>
                <SkipForward className="w-2.5 h-2.5 text-emerald-400 inline ml-0.5 flex-shrink-0" />
              </button>
            )}
          </div>
        </div>

        {/* Player Controls & Scrubber */}
        <div className="flex-1 flex flex-col items-center max-w-xs mx-auto">
          <div className="flex items-center gap-2 mb-1">
            {/* Previous Track button (Always active) */}
            <button
              type="button"
              onClick={() => dispatch(prevTrack())}
              className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Previous track"
              title="Play previous song"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Play/Pause button */}
            <button
              type="button"
              onClick={() => dispatch(togglePlayback())}
              className="w-9 h-9 rounded-full bg-[#1db954] hover:bg-[#1aa34a] text-black font-bold flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Next Track button (Always active - skips current song) */}
            <button
              type="button"
              onClick={() => dispatch(nextTrack())}
              className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Next track"
              title="Play next song (Skip current track)"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            {/* Dedicated Next Song pill button */}
            <button
              type="button"
              onClick={() => dispatch(nextTrack())}
              className="hidden sm:inline-flex items-center gap-1 ml-1 px-2.5 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 transition-all cursor-pointer"
              aria-label="Skip to next song"
              title="Skip current song and play next"
            >
              <SkipForward className="w-3 h-3 text-emerald-400" />
              <span>Next Song</span>
            </button>
          </div>

          <div className="w-full flex items-center gap-2 text-[10px] text-stone-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              aria-label="Playback position"
              min="0"
              max={duration || 30}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-[#1db954]"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* AI DJ button, Volume & Close */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => dispatch(setAiDjModalOpen(true))}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 text-[11px] font-semibold border border-violet-500/30 transition-all cursor-pointer"
            title="Open AI Mood DJ"
          >
            <Sparkles className="w-3 h-3 text-violet-300" />
            <span>AI DJ</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setIsMuted(false);
              dispatch(setVolume(parseFloat(e.target.value)));
            }}
            className="hidden sm:block w-16 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-[#1db954]"
            aria-label="Volume"
          />

          <button
            type="button"
            onClick={() => dispatch(closePlayer())}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer ml-1"
            aria-label="Close player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default InAppAudioPlayer;
