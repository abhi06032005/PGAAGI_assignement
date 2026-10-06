"use client";

import React, { useState } from "react";
import { useDialog } from "@/components/modals/useDialog";
import { useAppDispatch } from "@/store/hooks";
import { addCustomItem } from "../feedSlice";
import { apiClient } from "@/lib/api/client";
import {
  Category,
  ContentItem,
  ContentType,
  NewsItem,
  RecommendationItem,
  SocialItem,
  MusicItem,
} from "@/types";
import { X, PlusCircle, Sparkles } from "lucide-react";

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_DEFAULT_IMAGES: Partial<Record<Category, string>> = {
  technology:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  finance:
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
  sports:
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
  entertainment:
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
  health:
    "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
  science:
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  space:
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
};

export const CreateItemModal: React.FC<CreateItemModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState<Category>("science");
  const [type, setType] = useState<ContentType>("news");
  const [source, setSource] = useState("My Dispatch");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dialogRef = useDialog(isOpen, onClose);
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;

    setIsSubmitting(true);
    const chosenImage =
      imageUrl.trim() ||
      CATEGORY_DEFAULT_IMAGES[category] ||
      CATEGORY_DEFAULT_IMAGES.technology ||
      "";
    const now = new Date().toISOString();
    const id = `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    let newItem: ContentItem;

    if (type === "recommendation") {
      const rec: RecommendationItem = {
        id,
        type: "recommendation",
        subType: "movie",
        rating: 8.8,
        genre: [category],
        releaseYear: 2026,
        creator: "You",
        title: title.trim(),
        summary: summary.trim(),
        category,
        timestamp: "Custom Pick",
        publishedAt: now,
        source: source.trim() || "Custom Recommendation",
        sourceName: source.trim() || "Custom Recommendation",
        url: url.trim() || "#",
        imageUrl: chosenImage,
        imageAlt: title.trim(),
        isTrending: true,
      };
      newItem = rec;
    } else if (type === "social") {
      const soc: SocialItem = {
        id,
        type: "social",
        platform: "mastodon",
        authorName: "You",
        authorHandle: "@you",
        authorAvatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        verified: true,
        likesCount: 1,
        repostsCount: 0,
        commentsCount: 0,
        hashtags: [`#${category}`],
        title: title.trim(),
        summary: summary.trim(),
        category,
        timestamp: "Custom Post",
        publishedAt: now,
        source: source.trim() || "Custom Feed",
        sourceName: source.trim() || "Custom Feed",
        url: url.trim() || "#",
        imageUrl: chosenImage,
        imageAlt: title.trim(),
        isTrending: true,
      };
      newItem = soc;
    } else if (type === "music") {
      const mus: MusicItem = {
        id,
        type: "music",
        artist: "You",
        album: title.trim(),
        title: title.trim(),
        summary: summary.trim(),
        category,
        timestamp: "Custom Track",
        publishedAt: now,
        source: source.trim() || "Custom Music",
        sourceName: source.trim() || "Custom Music",
        url: url.trim() || "#",
        imageUrl: chosenImage,
        imageAlt: title.trim(),
        isTrending: true,
      };
      newItem = mus;
    } else {
      const news: NewsItem = {
        id,
        type: "news",
        title: title.trim(),
        summary: summary.trim(),
        category,
        timestamp: "Custom Post",
        publishedAt: now,
        source: source.trim() || "Custom Story",
        sourceName: source.trim() || "Custom Story",
        author: "You",
        url: url.trim() || "#",
        imageUrl: chosenImage,
        imageAlt: title.trim(),
        isTrending: true,
        readTimeMinutes: Math.max(2, Math.floor(summary.length / 150)),
      };
      newItem = news;
    }

    // 1. Dispatch directly to Redux & localStorage
    dispatch(addCustomItem(newItem));

    // 2. Also save to Express backend if reachable
    try {
      await apiClient.post("/api/custom-items", {
        title: newItem.title,
        summary: newItem.summary,
        category: newItem.category,
        type: newItem.type,
        source: newItem.source,
        url: newItem.url,
        imageUrl: newItem.imageUrl,
      });
    } catch {}

    setIsSubmitting(false);
    onClose();
    setTitle("");
    setSummary("");
    setUrl("");
    setImageUrl("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={dialogRef}
        className="w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-6 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-item-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="create-item-title"
                className="text-lg font-bold text-stone-900 dark:text-stone-100"
              >
                Add Custom Feed Item
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Publish a custom story or post directly to your personalized
                feed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Title */}
          <div>
            <label
              htmlFor="post-title"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1"
            >
              Title *
            </label>
            <input
              required
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Breakthroughs in Quantum Gravitation & Fusion"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 dark:text-stone-100"
            />
          </div>

          {/* Summary */}
          <div>
            <label
              htmlFor="post-summary"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1"
            >
              Summary / Content *
            </label>
            <textarea
              required
              rows={3}
              id="post-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Write a brief overview or insights for this card..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 dark:text-stone-100 resize-none"
            />
          </div>

          {/* Category & Type Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="post-category"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1"
              >
                Category
              </label>
              <select
                id="post-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-stone-400 dark:text-stone-100 capitalize"
              >
                <option value="science">Science</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="sports">Sports</option>
                <option value="entertainment">Entertainment</option>
                <option value="health">Health</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="post-type"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1"
              >
                Feed Type
              </label>
              <select
                id="post-type"
                value={type}
                onChange={(e) => setType(e.target.value as ContentType)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-stone-400 dark:text-stone-100 capitalize"
              >
                <option value="news">News</option>
                <option value="recommendation">Movies & Shows</option>
                <option value="social">Social</option>
                <option value="music">Music</option>
              </select>
            </div>
          </div>

          {/* Source & URL */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="post-source"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1"
              >
                Source Name
              </label>
              <input
                id="post-source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Research Journal"
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs focus:outline-none focus:ring-2 focus:ring-stone-400 dark:text-stone-100"
              />
            </div>

            <div>
              <label
                htmlFor="post-url"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1"
              >
                External URL
              </label>
              <input
                type="url"
                id="post-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs focus:outline-none focus:ring-2 focus:ring-stone-400 dark:text-stone-100"
              />
            </div>
          </div>

          {/* Custom Image URL */}
          <div>
            <label
              htmlFor="post-imageUrl"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1"
            >
              Image URL (Optional)
            </label>
            <input
              type="url"
              id="post-imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Leave empty for category cover image"
              className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs focus:outline-none focus:ring-2 focus:ring-stone-400 dark:text-stone-100"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-bold shadow-md hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Publishing..." : "Add to Feed"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
