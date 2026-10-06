"use client";

import React, { useState, useEffect } from "react";
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
  X,
  Bookmark,
  Check,
  Trash2,
  ExternalLink,
  Music,
} from "lucide-react";
import { useDialog } from "@/components/modals/useDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { SafeImage } from "@/components/ui/SafeImage";
import { AiMoodPlaylist, MusicItem } from "@/types";

export const AiMoodDjModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.spotify.isAiDjModalOpen);
  const currentTrack = useAppSelector((state) => state.spotify.currentTrack);
  const isPlaying = useAppSelector((state) => state.spotify.isPlaying);
  const savedPlaylists = useAppSelector((state) => state.spotify.savedPlaylists);

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<AiMoodPlaylist | null>(null);
  const [activeTab, setActiveTab] = useState<"create" | "saved">("create");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const dialogRef = useDialog(isOpen, () => dispatch(setAiDjModalOpen(false)));

  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("pulse_ai_playlists");
        if (stored) {
          dispatch(loadSavedPlaylists(JSON.parse(stored)));
        }
      } catch {}
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  const examplePrompt = "Late-night deep focus for coding with chill lo-fi beats";

  const handleGenerate = async (overridePrompt?: string) => {
    const textToSubmit = overridePrompt || prompt;
    if (!textToSubmit.trim()) return;

    setLoading(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/ai/mood-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToSubmit.trim() }),
      });

      if (!res.ok) {
        throw new Error("Unable to craft playlist. Please try again.");
      }

      const data = await res.json();
      if (data.playlist) {
        setPlaylist(data.playlist);
      } else {
        throw new Error("Invalid playlist response received.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate playlist");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (!playlist || !playlist.tracks || playlist.tracks.length === 0) return;
    dispatch(
      playPlaylist({
        playlist: playlist.tracks,
        startIndex: 0,
        title: playlist.title,
      })
    );
  };

  const handleTrackClick = (track: MusicItem, index: number) => {
    if (!playlist) return;
    if (currentTrack?.id === track.id && isPlaying) {
      dispatch(playTrack(track));
    } else {
      dispatch(
        playPlaylist({
          playlist: playlist.tracks,
          startIndex: index,
          title: playlist.title,
        })
      );
    }
  };

  const handleSave = () => {
    if (!playlist) return;
    dispatch(saveAiPlaylist(playlist));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const formatDuration = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-dj-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lime-400/20 text-lime-700 dark:text-lime-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="ai-dj-title"
                className="text-lg font-bold text-stone-900 dark:text-stone-100"
              >
                AI Mood DJ
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Generate a custom soundtrack tailored to your mood
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedPlaylists.length > 0 && (
              <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("create")}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeTab === "create"
                      ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs"
                      : "text-stone-500"
                  }`}
                >
                  Create
                </button>
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeTab === "saved"
                      ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs"
                      : "text-stone-500"
                  }`}
                >
                  Saved ({savedPlaylists.length})
                </button>
              </div>
            )}

            <button
              onClick={() => dispatch(setAiDjModalOpen(false))}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === "create" ? (
            <>
              {/* Simple Clean AI Query Bar */}
              <div className="space-y-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleGenerate();
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g. South Indian bhajans, Hindi romantic, late-night lo-fi..."
                      className="w-full px-4 py-3 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{loading ? "Generating..." : "Generate"}</span>
                  </button>
                </form>

                {/* Example Condition */}
                <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 pt-1">
                  <span className="font-medium text-stone-400 dark:text-stone-500">Example:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPrompt("South Indian devotional bhajans");
                      handleGenerate("South Indian devotional bhajans");
                    }}
                    className="text-stone-700 dark:text-stone-300 hover:underline hover:text-stone-900 dark:hover:text-white cursor-pointer transition-colors font-medium"
                  >
                    &ldquo;South Indian devotional bhajans&rdquo;
                  </button>
                  <span className="text-stone-300 dark:text-stone-700">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPrompt("Soulful Hindi acoustic love songs");
                      handleGenerate("Soulful Hindi acoustic love songs");
                    }}
                    className="text-stone-700 dark:text-stone-300 hover:underline hover:text-stone-900 dark:hover:text-white cursor-pointer transition-colors hidden sm:inline"
                  >
                    &ldquo;Soulful Hindi love songs&rdquo;
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Loading Skeletons */}
              {loading && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-48 rounded-lg" />
                    <Skeleton className="h-8 w-24 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/50 dark:border-stone-800/50"
                      >
                        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-4 w-36 rounded-md" />
                          <Skeleton className="h-3 w-24 rounded-md" />
                        </div>
                        <Skeleton className="h-4 w-12 rounded-md" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated Playlist View */}
              {playlist && !loading && (
                <div className="space-y-4 pt-1 animate-in fade-in duration-300">
                  {/* Playlist Header Card */}
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-800 dark:text-lime-300">
                          {playlist.sentiment?.moodTag || "Curated"}
                        </span>
                        <span className="text-xs text-stone-400">• {playlist.tracks.length} Tracks</span>
                      </div>
                      <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                        {playlist.title}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 max-w-md line-clamp-2">
                        {playlist.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handlePlayAll}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play All</span>
                      </button>

                      <button
                        onClick={handleSave}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {savedSuccess ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">Saved</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Tracks List */}
                  <div className="space-y-1.5">
                    {playlist.tracks.map((track, idx) => {
                      const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                      return (
                        <div
                          key={track.id || idx}
                          onClick={() => handleTrackClick(track, idx)}
                          className={`flex items-center gap-3 p-2.5 rounded-2xl transition-all cursor-pointer group ${
                            isThisPlaying
                              ? "bg-lime-400/10 dark:bg-lime-400/15 border border-lime-400/40"
                              : "hover:bg-stone-100 dark:hover:bg-stone-800/60 border border-transparent"
                          }`}
                        >
                          <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-stone-200 dark:bg-stone-800">
                            {track.imageUrl ? (
                              <SafeImage
                                src={track.imageUrl}
                                alt={track.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-400">
                                <Music className="w-5 h-5" />
                              </div>
                            )}

                            <div
                              className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                                isThisPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                              }`}
                            >
                              {isThisPlaying ? (
                                <Pause className="w-4 h-4 text-white fill-current" />
                              ) : (
                                <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                              )}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4
                              className={`text-sm font-semibold truncate ${
                                isThisPlaying
                                  ? "text-lime-700 dark:text-lime-300"
                                  : "text-stone-900 dark:text-stone-100"
                              }`}
                            >
                              {track.title}
                            </h4>
                            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                              {track.artist}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 text-xs text-stone-400">
                            <span>{track.durationMs ? formatDuration(track.durationMs) : "3:20"}</span>
                            {track.externalUrl && (
                              <a
                                href={track.externalUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                                title="Open on Spotify"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Saved Playlists Tab */
            <div className="space-y-3">
              {savedPlaylists.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-sm">
                  No saved playlists yet.
                </div>
              ) : (
                savedPlaylists.map((saved) => (
                  <div
                    key={saved.id}
                    className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {saved.title}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        {saved.tracks.length} Tracks • {saved.sentiment?.moodTag || "Saved"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setPlaylist(saved);
                          setActiveTab("create");
                          dispatch(
                            playPlaylist({
                              playlist: saved.tracks,
                              startIndex: 0,
                              title: saved.title,
                            })
                          );
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Play</span>
                      </button>

                      <button
                        onClick={() => dispatch(deleteAiPlaylist(saved.id))}
                        className="p-2 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                        title="Delete saved playlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiMoodDjModal;
