'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedDetailItem } from '@/features/feed/feedSlice';
import { toggleFavorite } from '@/features/favorites/favoritesSlice';
import { ContentItem } from '@/types';
import { Bookmark, Heart, Play, Square } from 'lucide-react';

export const PulseTopCards: React.FC = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.feed.items);
  const favoriteIds = useAppSelector((state) => state.favorites.favoriteIds);

  const liveNews = items.find((i: ContentItem) => i.type === 'news') || {
    id: 'clone-news-1',
    type: 'news' as const,
    title: 'OpenAI ships GPT-5 with major gains in reasoning',
    summary: 'The new model demonstrates significant reasoning, math, and code capabilities across standard evaluation suites.',
    category: 'technology' as const,
    timestamp: '2h ago',
    sourceName: 'TechCrunch',
    author: 'Reporter',
    readTimeMinutes: 3,
    imageUrl: '',
    url: 'https://techcrunch.com',
    isTrending: true,
  };

  const liveMovie = items.find((i: ContentItem) => i.type === 'recommendation') || {
    id: 'clone-movie-1',
    type: 'recommendation' as const,
    subType: 'movie' as const,
    title: 'Dune: Part Two streams on Netflix',
    summary: 'Because you like sci-fi · 8.6. Denis Villeneuve cinematic adaptation continues to receive critical acclaim.',
    category: 'entertainment' as const,
    timestamp: '4h ago',
    rating: 8.6,
    creator: 'Netflix',
    imageUrl: '',
    url: 'https://netflix.com',
    isTrending: true,
  };

  const isNewsFav = favoriteIds.includes(liveNews.id);
  const isMovieFav = favoriteIds.includes(liveMovie.id);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. OpenAI Technology Card */}
      <div className="bg-white/95 dark:bg-stone-900/95 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm overflow-hidden flex flex-col justify-between">
        {/* Soft pastel light-blue banner */}
        <div className="relative h-28 bg-[#bdd4f7] dark:bg-[#2b4c7e]/80">
          <span className="absolute top-3 left-3 bg-black dark:bg-stone-100 text-white dark:text-stone-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
            Technology
          </span>
        </div>

        {/* Card Content */}
        <div className="p-4 flex flex-col justify-between flex-1">
          <div>
            <div className="flex items-start gap-2">
              <Square className="w-3.5 h-3.5 text-slate-400 mt-1 flex-shrink-0" />
              <h2
                onClick={() => dispatch(setSelectedDetailItem(liveNews as ContentItem))}
                className="text-sm font-bold text-slate-900 dark:text-stone-100 leading-snug cursor-pointer hover:underline"
              >
                OpenAI ships GPT-5 with major gains in reasoning
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-stone-400 mt-1 pl-5">
              TechCrunch · 2h ago
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 pl-5 text-slate-400 dark:text-stone-400">
              <button
                onClick={() => dispatch(toggleFavorite(liveNews as ContentItem))}
                aria-label="Bookmark"
                className="hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isNewsFav ? 'fill-black dark:fill-white text-black dark:text-white' : ''}`} />
              </button>
              <button
                onClick={() => dispatch(toggleFavorite(liveNews as ContentItem))}
                aria-label="Like"
                className="hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => dispatch(setSelectedDetailItem(liveNews as ContentItem))}
              className="bg-black hover:bg-slate-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold px-4 py-1 rounded-full shadow-sm transition-colors cursor-pointer"
            >
              Read more
            </button>
          </div>
        </div>
      </div>

      {/* 2. Dune: Part Two Movie Card */}
      <div className="bg-white/95 dark:bg-stone-900/95 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm overflow-hidden flex flex-col justify-between">
        {/* Soft pastel peach banner */}
        <div className="relative h-28 bg-[#f9be9b] dark:bg-[#7a482d]/80">
          <span className="absolute top-3 left-3 bg-black dark:bg-stone-100 text-white dark:text-stone-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
            Movie
          </span>
        </div>

        {/* Card Content */}
        <div className="p-4 flex flex-col justify-between flex-1">
          <div>
            <div className="flex items-start gap-2">
              <Square className="w-3.5 h-3.5 text-slate-400 mt-1 flex-shrink-0" />
              <h2
                onClick={() => dispatch(setSelectedDetailItem(liveMovie as ContentItem))}
                className="text-sm font-bold text-slate-900 dark:text-stone-100 leading-snug cursor-pointer hover:underline"
              >
                Dune: Part Two streams on Netflix
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-stone-400 mt-1 pl-5">
              Because you like sci-fi · 8.6
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 pl-5 text-slate-400 dark:text-stone-400">
              <button
                onClick={() => dispatch(toggleFavorite(liveMovie as ContentItem))}
                aria-label="Bookmark"
                className="hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isMovieFav ? 'fill-black dark:fill-white text-black dark:text-white' : ''}`} />
              </button>
            </div>

            <button
              onClick={() => dispatch(setSelectedDetailItem(liveMovie as ContentItem))}
              className="bg-[#cbf63a] hover:bg-[#bce628] text-black text-xs font-bold px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Play now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
