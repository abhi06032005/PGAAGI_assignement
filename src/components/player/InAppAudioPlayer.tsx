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

// Authentic high-fidelity audio streams for fallback
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
  const [resolvedArtwork, setResolvedArtwork] = useState<string | null>(null);

  // Dynamically resolve authentic song audio for currentTrack if previewUrl is missing or SoundHelix
  useEffect(() => {
    if (!currentTrack) {
      setActiveAudioSrc(null);
      setResolvedArtwork(null);
      return;
    }

    let isMounted = true;

    // If already has a genuine non-SoundHelix previewUrl, use it directly
    if (currentTrack.previewUrl && !currentTrack.previewUrl.includes("soundhelix")) {
      setActiveAudioSrc(currentTrack.previewUrl);
      setResolvedArtwork(currentTrack.imageUrl || null);
      return;
    }

    // Query Apple Music catalog for this specific song's authentic 30s studio clip
    const isIndian = /hindi|bollywood|desi|punjabi|india|arijit/i.test(
      `${currentTrack.title} ${currentTrack.artist || ""}`
    );
    const cleanArtist = (currentTrack.artist || "").split(/[,&/]|ft\.|feat\./i)[0].trim();
    const cleanTitle = currentTrack.title.replace(/\([^)]*\)|\[[^\]]*\]/g, "").trim();

    const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
      `${cleanTitle} ${cleanArtist}`
    )}&entity=song&limit=1${isIndian ? "&country=IN" : ""}`;

    fetch(searchUrl)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        const match = data?.results?.[0];
        if (match?.previewUrl) {
          setActiveAudioSrc(match.previewUrl);
          if (match.artworkUrl100) {
            setResolvedArtwork(match.artworkUrl100.replace("100x100bb", "600x600bb"));
          }
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

  const displayArtwork = resolvedArtwork || currentTrack.imageUrl;

  return (
    <aside
      aria-label="In-App Audio Player"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] w-[95%] max-w-2xl bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-stone-100 backdrop-blur-2xl border border-stone-200/80 dark:border-stone-800/80 rounded-3xl p-3 sm:px-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-300"
    >
      <audio
        ref={audioRef}
        src={audioSource}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          dispatch(nextTrack());
        }}
        onError={() => {
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
        {/* Track Info (Left) */}
        <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial sm:w-56">
          <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60 shrink-0">
            {displayArtwork ? (
              <SafeImage
                src={displayArtwork}
                alt={currentTrack.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400">
                <Music className="w-5 h-5" />
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                <Disc3 className="w-4 h-4 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="leading-tight min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse shrink-0" />
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                {currentTrack.title}
              </h4>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
              {currentTrack.artist}
            </p>
            {nextTrackItem && (
              <button
                type="button"
                onClick={() => dispatch(nextTrack())}
                className="hidden sm:flex items-center gap-1 text-[10px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 truncate mt-0.5 cursor-pointer transition-colors"
                title={`Up next: ${nextTrackItem.title}`}
              >
                <span>Up next:</span>
                <span className="truncate max-w-[100px]">{nextTrackItem.title}</span>
              </button>
            )}
          </div>
        </div>

        {/* Center Controls & Progress Bar */}
        <div className="flex-1 flex flex-col items-center max-w-xs mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={() => dispatch(prevTrack())}
              className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Previous track"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              type="button"
              onClick={() => dispatch(togglePlayback())}
              className="w-9 h-9 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 flex items-center justify-center hover:scale-105 transition-transform shadow-xs cursor-pointer"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => dispatch(nextTrack())}
              className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Next track"
            >
              <SkipForward className="w-4 h-4 fill-current" />
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
              className="w-full h-1 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-stone-900 dark:accent-white"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Section (AI DJ, Volume, Close) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => dispatch(setAiDjModalOpen(true))}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lime-400/20 text-lime-800 dark:text-lime-300 hover:bg-lime-400/30 text-xs font-semibold transition-colors border border-lime-400/30 cursor-pointer"
            title="Open AI Mood DJ"
          >
            <Sparkles className="w-3.5 h-3.5 text-lime-600 dark:text-lime-400" />
            <span>AI DJ</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
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
            className="hidden md:block w-14 h-1 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-stone-900 dark:accent-white"
            aria-label="Volume"
          />

          <button
            type="button"
            onClick={() => dispatch(closePlayer())}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer ml-0.5"
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
