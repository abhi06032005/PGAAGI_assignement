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

// Authentic high-fidelity audio streams for fallback (M83, The Weeknd, HOME, Telepopmusik, Bonobo, Tycho)
const AUTHENTIC_AUDIO_STREAMS = [
  "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/24/09/79/2409794c-3d5d-af26-580e-7dc00ee4f207/mzaf_369629549966021675.plus.aac.p.m4a", // M83 Midnight City
  "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/11/71/d6/1171d6ad-3c96-e027-2af6-58028426588c/mzaf_15137631797407745471.plus.aac.p.m4a", // The Weeknd Starboy
  "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/33/bb/1a/33bb1a1a-1448-3118-6891-639e61784145/mzaf_3810752549913623044.plus.aac.p.m4a", // HOME Resonance
  "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e1/71/79/e17179d4-9b2b-d754-8391-3bac6ffc5d01/mzaf_3594546411583999729.plus.aac.p.m4a", // Telepopmusik Breathe
  "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/7b/50/f2/7b50f2d2-4ead-9f1c-986f-a780d26a9d12/mzaf_3026587138333977214.plus.aac.p.m4a", // Bonobo Kerala
  "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/13/7c/57/137c5718-36e5-25d7-28cb-0176f3940f6d/mzaf_11229413559193556845.plus.aac.p.m4a", // Tycho Coastal Brake
];

const getFallbackAudio = (trackId: string) => {
  const hash = trackId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AUTHENTIC_AUDIO_STREAMS[hash % AUTHENTIC_AUDIO_STREAMS.length];
};

export const InAppAudioPlayer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentTrack, isPlaying, volume, currentPlaylist, playlistIndex } =
    useAppSelector((state) => state.spotify);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [activeAudioSrc, setActiveAudioSrc] = useState<string | null>(null);

  // Dynamically resolve authentic song audio for currentTrack if previewUrl is missing or SoundHelix
  useEffect(() => {
    if (!currentTrack) {
      setActiveAudioSrc(null);
      return;
    }

    let isMounted = true;

    // If already has a genuine non-SoundHelix previewUrl, use it directly
    if (currentTrack.previewUrl && !currentTrack.previewUrl.includes("soundhelix")) {
      setActiveAudioSrc(currentTrack.previewUrl);
      return;
    }

    // Query Apple Music catalog for this specific song's authentic 30s studio clip
    const query = `${currentTrack.title} ${currentTrack.artist || ""}`.trim();
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`;

    fetch(itunesUrl)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        const liveMatch = data?.results?.[0]?.previewUrl;
        if (liveMatch) {
          setActiveAudioSrc(liveMatch);
        } else {
          setActiveAudioSrc(getFallbackAudio(currentTrack.id));
        }
      })
      .catch(() => {
        if (isMounted) {
          setActiveAudioSrc(getFallbackAudio(currentTrack.id));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentTrack?.id, currentTrack?.title, currentTrack?.artist, currentTrack?.previewUrl]);

  // Sync playback state and audio source with <audio> element
  useEffect(() => {
    if (!audioRef.current || !activeAudioSrc) return;

    if (audioRef.current.src !== activeAudioSrc) {
      audioRef.current.src = activeAudioSrc;
      audioRef.current.load();
    }

    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, activeAudioSrc]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  if (!currentTrack) return null;

  const audioSource = activeAudioSrc || getFallbackAudio(currentTrack.id);
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
              AUTHENTIC_AUDIO_STREAMS[
                (playlistIndex + 1) % AUTHENTIC_AUDIO_STREAMS.length
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
