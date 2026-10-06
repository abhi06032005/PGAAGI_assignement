"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setAiDjModalOpen,
  playPlaylist,
  playTrack,
  saveAiPlaylist,
  deleteAiPlaylist,
  loadSavedPlaylists,
} from "@/features/spotify/spotifySlice";
import {
  Sparkles,
  Play,
  Pause,
  Disc3,
  Music2,
  X,
  Bookmark,
  Check,
  Trash2,
  Activity,
  ExternalLink,
  Flame,
  Coffee,
  CloudRain,
  Zap,
  Compass,
  Waves,
  Sliders,
  Radio,
  Volume2,
} from "lucide-react";
import { useDialog } from "@/components/modals/useDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { SafeImage } from "@/components/ui/SafeImage";
import { AiMoodPlaylist, MusicItem } from "@/types";

interface VibePreset {
  id: string;
  label: string;
  bpm: number;
  genre: string;
  prompt: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  accentColor: string;
}

const PRESET_VIBES: VibePreset[] = [
  {
    id: "terminal-flow",
    label: "Midnight Terminal",
    bpm: 110,
    genre: "Synthwave / Cyber",
    prompt: "Late-night deep algorithmic code flow under dim lights. Hypnotic electronic arpeggios, steady cadence, zero vocal clutter.",
    icon: Zap,
    accentColor: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10",
  },
  {
    id: "rainy-solitude",
    label: "Rain & Solitude",
    bpm: 68,
    genre: "Acoustic / Ambient",
    prompt: "Watching raindrops slide down a foggy window in quiet solitude. Soft fingerpicked acoustic chords and warm minor progressions.",
    icon: CloudRain,
    accentColor: "border-sky-500/40 text-sky-400 bg-sky-500/10",
  },
  {
    id: "peak-voltage",
    label: "Peak Adrenaline",
    bpm: 142,
    genre: "Phonk / Bass / EDM",
    prompt: "Maximum heart rate and relentless kinetic drive. Exploding sub-bass dynamics, fast drum patterns, and raw workout momentum.",
    icon: Flame,
    accentColor: "border-rose-500/40 text-rose-400 bg-rose-500/10",
  },
  {
    id: "sunday-drift",
    label: "Sunday Warmth",
    bpm: 82,
    genre: "Lo-Fi / Bossa",
    prompt: "A quiet morning with fresh coffee and streaming sunlight. Gentle Rhodes chords, vinyl crackle, and easygoing acoustic swing.",
    icon: Coffee,
    accentColor: "border-amber-500/40 text-amber-400 bg-amber-500/10",
  },
  {
    id: "golden-groove",
    label: "Golden Groove",
    bpm: 124,
    genre: "Nu-Disco / Funk",
    prompt: "Celebratory, sunny, and infectious. Upbeat slap basslines, bright brass stabs, and irresistible four-on-the-floor rhythm.",
    icon: Waves,
    accentColor: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
  },
  {
    id: "cosmic-void",
    label: "Cosmic Horizon",
    bpm: 74,
    genre: "Ambient / Space",
    prompt: "Contemplating the vast emptiness of outer space. Ethereal analog drone textures, sweeping tape delays, and peaceful stillness.",
    icon: Compass,
    accentColor: "border-violet-500/40 text-violet-400 bg-violet-500/10",
  },
];

const QUICK_TAGS = [
  "Late night drive",
  "High intensity gym",
  "Gentle morning lo-fi",
  "Heavy bass focus",
  "Melancholy indie",
  "Tokyo cyber synth",
];

export const AiMoodDjModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAiDjModalOpen, currentTrack, isPlaying, savedPlaylists } =
    useAppSelector((state) => state.spotify);

  const [activeTab, setActiveTab] = useState<"deck" | "saved">("deck");
  const [moodText, setMoodText] = useState("");
  const [selectedVibeId, setSelectedVibeId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlaylist, setGeneratedPlaylist] = useState<AiMoodPlaylist | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Equalizer visualizer bars state for active playback simulation
  const [equalizerBars, setEqualizerBars] = useState<number[]>([40, 65, 30, 85, 50, 70, 95, 45, 60, 80, 55, 90]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setEqualizerBars(
        Array.from({ length: 14 }, () => Math.floor(Math.random() * 75) + 25)
      );
    }, 180);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Load saved playlists on initial mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("pulse_ai_playlists");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            dispatch(loadSavedPlaylists(parsed));
          }
        }
      } catch {}
    }
  }, [dispatch]);

  const dialogRef = useDialog(isAiDjModalOpen, () =>
    dispatch(setAiDjModalOpen(false))
  );

  if (!isAiDjModalOpen) return null;

  const handleGenerate = async (presetPrompt?: string, presetId?: string) => {
    const textToSubmit = presetPrompt || moodText;
    if (!textToSubmit.trim()) return;

    if (presetId) {
      setSelectedVibeId(presetId);
    }

    setIsGenerating(true);
    setError(null);
    setIsSaved(false);

    try {
      const res = await fetch("/api/ai/mood-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moodText: textToSubmit,
          vibeChip: selectedVibeId,
        }),
      });

      const data = await res.json();
      if (data.success && data.playlist) {
        setGeneratedPlaylist(data.playlist);
      } else {
        throw new Error(data.error || "Failed to curate playlist");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to curate session. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayEntirePlaylist = () => {
    if (generatedPlaylist && generatedPlaylist.tracks.length > 0) {
      dispatch(
        playPlaylist({
          playlist: generatedPlaylist.tracks,
          startIndex: 0,
          title: generatedPlaylist.title,
        })
      );
    }
  };

  const handleSavePlaylist = () => {
    if (generatedPlaylist) {
      dispatch(saveAiPlaylist(generatedPlaylist));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  const handlePlaySavedPlaylist = (playlist: AiMoodPlaylist) => {
    dispatch(
      playPlaylist({
        playlist: playlist.tracks,
        startIndex: 0,
        title: playlist.title,
      })
    );
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="AI DJ Audio Studio"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      onKeyDown={(e) => {
        if (e.key === "Escape") dispatch(setAiDjModalOpen(false));
      }}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0d0e12] text-stone-100 rounded-3xl border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Console Hardware Bar */}
        <header className="px-6 py-4 border-b border-white/[0.07] bg-[#12141a]/80 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-900 border border-white/10 flex items-center justify-center text-emerald-400 shadow-inner">
              <Sliders size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                  <span>AI DJ Studio Console</span>
                  <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Groq LPU Engine
                  </span>
                </h2>
              </div>
              <p className="text-[11px] text-stone-400">
                Acoustic mood synthesis and intelligent live frequency curation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Studio Navigation Tabs */}
            <div className="flex items-center bg-stone-900/90 p-1 rounded-xl border border-white/[0.06] text-xs font-semibold">
              <button
                onClick={() => setActiveTab("deck")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "deck"
                    ? "bg-white/10 text-white shadow-xs border border-white/10"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <Radio size={13} />
                <span>Audio Deck</span>
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "saved"
                    ? "bg-white/10 text-white shadow-xs border border-white/10"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <Bookmark size={13} />
                <span>My Sets</span>
                {savedPlaylists.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono flex items-center justify-center">
                    {savedPlaylists.length}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={() => dispatch(setAiDjModalOpen(false))}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              aria-label="Close AI DJ Studio"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Console Workspace */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {activeTab === "deck" ? (
            <>
              {/* Preset Vibe Matrix */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-semibold">
                    Acoustic Profiles
                  </span>
                  <span className="text-[10px] font-mono text-stone-500">
                    Instant frequency matching
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_VIBES.map((vibe) => {
                    const Icon = vibe.icon;
                    const isSelected = selectedVibeId === vibe.id;
                    return (
                      <button
                        key={vibe.id}
                        disabled={isGenerating}
                        onClick={() => {
                          setSelectedVibeId(vibe.id);
                          setMoodText(vibe.prompt);
                          handleGenerate(vibe.prompt, vibe.id);
                        }}
                        className={`group relative p-3 rounded-2xl border text-left transition-all cursor-pointer overflow-hidden ${
                          isSelected
                            ? "bg-white/[0.07] border-white/20 shadow-md ring-1 ring-white/15"
                            : "bg-[#14161d]/60 border-white/[0.06] hover:border-white/15 hover:bg-[#181a24]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div
                            className={`p-2 rounded-xl border ${vibe.accentColor}`}
                          >
                            <Icon size={14} />
                          </div>
                          <span className="font-mono text-[10px] text-stone-400 px-1.5 py-0.5 rounded bg-black/40 border border-white/[0.04]">
                            {vibe.bpm} BPM
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-stone-100 group-hover:text-white transition-colors truncate">
                            {vibe.label}
                          </h4>
                          <p className="text-[10px] text-stone-400 font-mono mt-0.5 truncate">
                            {vibe.genre}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Natural Language Prompt Terminal */}
              <div className="bg-[#12141b]/90 border border-white/[0.07] rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="mood-input"
                    className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-semibold flex items-center gap-2"
                  >
                    <span>Custom Sonic Instruction</span>
                  </label>
                  {moodText && (
                    <button
                      onClick={() => setMoodText("")}
                      className="text-[11px] text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    id="mood-input"
                    rows={2}
                    value={moodText}
                    onChange={(e) => setMoodText(e.target.value)}
                    placeholder="Describe your current atmosphere, emotion, tempo, or genre (e.g. ambient late night coding, chill lo-fi beats, or workout energy)..."
                    className="w-full bg-[#0a0b0e] border border-white/[0.08] rounded-xl p-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500/50 resize-none transition-all leading-relaxed"
                  />
                </div>

                {/* Quick Inspiration Pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-mono text-stone-500 mr-1">
                    Quick tags:
                  </span>
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => {
                        setMoodText(tag);
                        handleGenerate(tag);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.05] text-[11px] text-stone-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2 text-[11px] text-stone-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>LPU Synthesizer Ready</span>
                  </div>

                  <button
                    onClick={() => handleGenerate()}
                    disabled={isGenerating || (!moodText.trim() && !selectedVibeId)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow-md transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Disc3 size={15} className="animate-spin" />
                        <span>Curating Soundscape...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>Curate Live Mix</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Generating Skeleton */}
              {isGenerating && (
                <div className="p-5 rounded-2xl bg-[#12141b] border border-white/[0.07] space-y-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-48 bg-white/10" />
                    <Skeleton className="h-5 w-24 bg-white/10" />
                  </div>
                  <Skeleton className="h-3 w-full bg-white/5" />
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {[1, 2, 3, 4].map((n) => (
                      <Skeleton key={n} className="h-14 rounded-xl bg-white/5" />
                    ))}
                  </div>
                </div>
              )}

              {/* Generated Master Set Deck */}
              {generatedPlaylist && !isGenerating && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  {/* Master Deck Banner with Dynamic Spectrum Visualizer */}
                  <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-[#161822] to-[#0f1017] border border-white/[0.09] shadow-xl overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                      {/* Left Track & Mood Info */}
                      <div className="min-w-0 max-w-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {generatedPlaylist.sentiment.moodTag}
                          </span>
                          <span className="font-mono text-[11px] text-stone-400">
                            {generatedPlaylist.tracks.length} Mastered Tracks
                          </span>
                        </div>

                        <h3 className="text-xl font-extrabold tracking-tight text-white">
                          {generatedPlaylist.title}
                        </h3>
                        <p className="text-xs text-stone-300/90 mt-1 leading-relaxed">
                          {generatedPlaylist.description}
                        </p>
                      </div>

                      {/* Right Turntable / Control Cluster */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <button
                          onClick={handlePlayEntirePlaylist}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold text-xs shadow-lg transition-transform hover:scale-105 cursor-pointer"
                        >
                          <Play size={14} className="fill-current" />
                          <span>Play Entire Set</span>
                        </button>

                        <button
                          onClick={handleSavePlaylist}
                          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-semibold text-stone-200 transition-colors cursor-pointer"
                        >
                          {isSaved ? (
                            <>
                              <Check size={14} className="text-emerald-400" />
                              <span className="text-emerald-400">Saved!</span>
                            </>
                          ) : (
                            <>
                              <Bookmark size={14} />
                              <span>Save to Crates</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Equalizer Frequency Display */}
                    <div className="mt-5 pt-4 border-t border-white/[0.07]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Volume2 size={13} className="text-stone-400" />
                          <span className="font-mono text-[10px] uppercase tracking-widest text-stone-400">
                            Oscilloscope & Telemetry
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-emerald-400">
                          {isPlaying ? "LIVE PLAYBACK ACTIVE" : "ARMED"}
                        </span>
                      </div>

                      <div className="h-8 flex items-end gap-1.5 bg-[#0a0b0e] p-2 rounded-xl border border-white/[0.05]">
                        {equalizerBars.map((height, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-emerald-500/60 to-emerald-400 rounded-sm transition-all duration-150"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Precision Acoustic Telemetry Bar */}
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="bg-[#0b0c10]/80 rounded-xl p-2.5 border border-white/[0.05]">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-stone-400 block mb-1">
                          Dynamic Energy
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full"
                              style={{ width: `${generatedPlaylist.sentiment.energy}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-amber-300">
                            {generatedPlaylist.sentiment.energy}%
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#0b0c10]/80 rounded-xl p-2.5 border border-white/[0.05]">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-stone-400 block mb-1">
                          Harmonic Valence
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-400 rounded-full"
                              style={{ width: `${generatedPlaylist.sentiment.valence}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-emerald-300">
                            {generatedPlaylist.sentiment.valence}%
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#0b0c10]/80 rounded-xl p-2.5 border border-white/[0.05]">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-stone-400 block mb-1">
                          Rhythmic Groove
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-violet-400 rounded-full"
                              style={{ width: `${generatedPlaylist.sentiment.danceability}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-violet-300">
                            {generatedPlaylist.sentiment.danceability}%
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#0b0c10]/80 rounded-xl p-2.5 border border-white/[0.05]">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-stone-400 block mb-1">
                          Cadence / Tempo
                        </span>
                        <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-300">
                          <Activity size={13} className="text-cyan-400 animate-pulse" />
                          <span>{generatedPlaylist.sentiment.tempoBpm} BPM</span>
                        </div>
                      </div>
                    </div>

                    {/* Acoustic Rationale */}
                    <div className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] text-stone-300 leading-relaxed font-mono">
                      <span className="text-emerald-400 font-bold mr-1.5">
                        [SYNTHESIS INSIGHT]
                      </span>
                      {generatedPlaylist.sentiment.rationale || generatedPlaylist.sentiment.vibeSummary}
                    </div>
                  </div>

                  {/* Curated Tracklist */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-stone-400 font-semibold">
                        Curated Tracklist ({generatedPlaylist.tracks.length})
                      </span>
                      <span className="font-mono text-[10px] text-stone-500">
                        In-App Playable
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {generatedPlaylist.tracks.map((track, idx) => {
                        const isThisPlaying =
                          currentTrack?.id === track.id && isPlaying;
                        return (
                          <div
                            key={track.id}
                            onClick={() => dispatch(playTrack(track))}
                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                              isThisPlaying
                                ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm"
                                : "bg-[#13151c]/80 border-white/[0.05] hover:bg-[#181b24] hover:border-white/10"
                            }`}
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <span className="w-5 text-center font-mono text-xs text-stone-500 flex-shrink-0">
                                {isThisPlaying ? (
                                  <Disc3 size={14} className="text-emerald-400 animate-spin mx-auto" />
                                ) : (
                                  idx + 1
                                )}
                              </span>

                              <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-stone-900 flex-shrink-0 border border-white/[0.08] shadow-sm">
                                {track.imageUrl ? (
                                  <SafeImage
                                    src={track.imageUrl}
                                    alt={track.title}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-emerald-400">
                                    <Music2 size={16} />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-white truncate flex items-center gap-2">
                                  <span>{track.title}</span>
                                  {isThisPlaying && (
                                    <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 font-semibold">
                                      Playing
                                    </span>
                                  )}
                                </h5>
                                <p className="text-[11px] text-stone-400 truncate mt-0.5">
                                  {track.artist} {track.album ? `• ${track.album}` : ""}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                              {track.externalUrl && (
                                <a
                                  href={track.externalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-2 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
                                  title="Open in Spotify"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}

                              <button
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                  isThisPlaying
                                    ? "bg-emerald-500 text-stone-950 shadow-md"
                                    : "bg-white/10 hover:bg-emerald-500 text-white hover:text-stone-950"
                                }`}
                                aria-label={`Play ${track.title}`}
                              >
                                {isThisPlaying ? (
                                  <Pause size={13} className="fill-current" />
                                ) : (
                                  <Play size={13} className="fill-current ml-0.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Saved Playlists Archive */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Mastered AI Crates
                  </h3>
                  <p className="text-xs text-stone-400">
                    Your saved acoustic sets and mood explorations
                  </p>
                </div>
                <span className="font-mono text-xs text-stone-400">
                  {savedPlaylists.length} {savedPlaylists.length === 1 ? "crate" : "crates"}
                </span>
              </div>

              {savedPlaylists.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-3xl bg-[#12141a]/50 border border-white/[0.06] space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] text-stone-400 flex items-center justify-center mx-auto border border-white/[0.06]">
                    <Bookmark size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    No Saved Crates Yet
                  </h4>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    Curate a set in the Audio Deck tab, listen to the preview, and tap Save to Crates.
                  </p>
                  <button
                    onClick={() => setActiveTab("deck")}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Open Audio Deck
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedPlaylists.map((pl) => (
                    <div
                      key={pl.id}
                      className="p-4 rounded-2xl bg-[#13151c]/80 border border-white/[0.06] hover:border-white/15 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {pl.sentiment.moodTag}
                          </span>
                          <span className="font-mono text-[10px] text-stone-500">
                            {new Date(pl.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white truncate">
                          {pl.title}
                        </h4>
                        <p className="text-xs text-stone-400 truncate mt-0.5">
                          &ldquo;{pl.prompt}&rdquo; • {pl.tracks.length} tracks
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handlePlaySavedPlaylist(pl)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow-xs transition-transform hover:scale-105 cursor-pointer"
                        >
                          <Play size={13} className="fill-current" />
                          <span>Play Set</span>
                        </button>

                        <button
                          onClick={() => dispatch(deleteAiPlaylist(pl.id))}
                          className="p-2 rounded-xl hover:bg-rose-500/10 text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
                          aria-label="Delete playlist"
                          title="Delete playlist"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiMoodDjModal;
