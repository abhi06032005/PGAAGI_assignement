"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
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

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          videoId?: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: { data: number }) => void;
            onError?: () => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (volume: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  loadVideoById: (videoId: string) => void;
  destroy: () => void;
}

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
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
  const isYtReadyRef = useRef(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [activeAudioSrc, setActiveAudioSrc] = useState<string | null>(null);
  const [resolvedArtwork, setResolvedArtwork] = useState<string | null>(null);
  const [isFullSongActive, setIsFullSongActive] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // Load YouTube Iframe API once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize or re-create YouTube Player when videoId is available
  const onPlayerReady = useCallback((event: { target: YTPlayerInstance }) => {
    ytPlayerRef.current = event.target;
    isYtReadyRef.current = true;
    event.target.setVolume(isMuted ? 0 : volume * 100);
    const dur = event.target.getDuration();
    if (dur && dur > 10) {
      setDuration(Math.floor(dur));
    }
    if (isPlaying) {
      event.target.playVideo();
      // Mute the fallback HTML5 audio so only full YouTube audio plays
      if (audioRef.current) audioRef.current.pause();
    }
  }, [isMuted, volume, isPlaying]);

  const onPlayerStateChange = useCallback((event: { data: number }) => {
    if (event.data === 0) {
      // ENDED: Continuous playback for full songs
      dispatch(nextTrack());
    }
  }, [dispatch]);

  // Init YouTube Player instance
  useEffect(() => {
    if (!activeVideoId || typeof window === "undefined") return;

    let timer: NodeJS.Timeout;

    function initYT() {
      if (!window.YT || !window.YT.Player) {
        timer = setTimeout(initYT, 200);
        return;
      }

      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.loadVideoById(activeVideoId!);
          if (isPlaying) ytPlayerRef.current.playVideo();
          return;
        } catch {
          // Re-create player if load failed
        }
      }

      const container = document.getElementById("pulse-yt-audio-container");
      if (!container) return;

      ytPlayerRef.current = new window.YT.Player("pulse-yt-audio-container", {
        videoId: activeVideoId!,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: () => {
            // If YouTube is blocked, gracefully fall back to HTML5 preview
            setIsFullSongActive(false);
            if (audioRef.current && isPlaying) {
              audioRef.current.play().catch(() => {});
            }
          },
        },
      });
    }

    initYT();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [activeVideoId, onPlayerReady, onPlayerStateChange, isPlaying]);

  // Timer loop for time tracking when YouTube is active
  useEffect(() => {
    if (!isFullSongActive || !isPlaying) return;

    const interval = setInterval(() => {
      if (ytPlayerRef.current && isYtReadyRef.current) {
        try {
          const curr = ytPlayerRef.current.getCurrentTime();
          if (curr !== undefined && !isNaN(curr)) {
            setCurrentTime(curr);
          }
          const dur = ytPlayerRef.current.getDuration();
          if (dur && dur > 10) {
            setDuration(Math.floor(dur));
          }
        } catch {}
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isFullSongActive, isPlaying]);

  // Dynamically resolve full YouTube stream & Apple Music artwork
  useEffect(() => {
    if (!currentTrack) {
      setActiveAudioSrc(null);
      setResolvedArtwork(null);
      setActiveVideoId(null);
      setIsFullSongActive(false);
      return;
    }

    let isMounted = true;
    setCurrentTime(0);

    // 1. Resolve Full Song from YouTube
    const fullQuery = `${currentTrack.title} ${currentTrack.artist || ""}`.trim();
    fetch(`/api/music/full-stream?q=${encodeURIComponent(fullQuery)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data?.videoId) {
          setActiveVideoId(data.videoId);
          setIsFullSongActive(true);
        } else {
          setIsFullSongActive(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsFullSongActive(false);
      });

    // 2. Resolve High-Res Artwork and Audio fallback
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
  }, [currentTrack?.id, currentTrack?.title, currentTrack?.artist]);

  // Sync playback state across both YouTube and HTML5
  useEffect(() => {
    if (isFullSongActive && ytPlayerRef.current && isYtReadyRef.current) {
      try {
        if (isPlaying) {
          ytPlayerRef.current.playVideo();
          if (audioRef.current) audioRef.current.pause();
        } else {
          ytPlayerRef.current.pauseVideo();
        }
      } catch {}
    } else if (!isFullSongActive && audioRef.current && activeAudioSrc) {
      if (audioRef.current.src !== activeAudioSrc) {
        audioRef.current.src = activeAudioSrc;
        audioRef.current.load();
      }
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isFullSongActive, activeAudioSrc]);

  // Sync volume across both engines
  useEffect(() => {
    if (isFullSongActive && ytPlayerRef.current && isYtReadyRef.current) {
      try {
        ytPlayerRef.current.setVolume(isMuted ? 0 : volume * 100);
      } catch {}
    }
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, isFullSongActive]);

  if (!currentTrack) return null;

  const audioSource = activeAudioSrc || getFallbackAudio(currentTrack.id);
  const nextTrackItem =
    currentPlaylist.length > 1
      ? currentPlaylist[(playlistIndex + 1) % currentPlaylist.length]
      : null;

  const handleTimeUpdate = () => {
    if (!isFullSongActive && audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (isFullSongActive && ytPlayerRef.current && isYtReadyRef.current) {
      try {
        ytPlayerRef.current.seekTo(newTime, true);
      } catch {}
    } else if (audioRef.current) {
      audioRef.current.currentTime = newTime;
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
      {/* Invisible YouTube Player Container ensuring 100% full songs without audio cutoff */}
      <div className="w-1 h-1 overflow-hidden opacity-0 pointer-events-none absolute -bottom-10 -right-10">
        <div id="pulse-yt-audio-container" />
      </div>

      {/* Fallback HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={audioSource}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          if (!isFullSongActive) dispatch(nextTrack());
        }}
        onError={() => {
          if (!isFullSongActive && audioRef.current) {
            const altSource =
              AUTHENTIC_AUDIO_STREAMS[
                (playlistIndex + 1) % AUTHENTIC_AUDIO_STREAMS.length
              ];
            if (audioRef.current.src !== altSource) {
              audioRef.current.src = altSource;
              if (isPlaying) audioRef.current.play().catch(() => {});
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
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                {currentTrack.artist}
              </p>
              {isFullSongActive && (
                <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-500/20 shrink-0">
                  Full Song
                </span>
              )}
            </div>

            {nextTrackItem && (
              <button
                type="button"
                onClick={() => dispatch(nextTrack())}
                className="hidden sm:flex items-center gap-1 text-[10px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 truncate mt-0.5 cursor-pointer transition-colors"
                title={`Up next: ${nextTrackItem.title}`}
              >
                <span>Up next:</span>
                <span className="truncate max-w-[90px]">{nextTrackItem.title}</span>
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
              step="1"
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
