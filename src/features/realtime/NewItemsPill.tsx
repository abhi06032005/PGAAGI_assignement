'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { applyLiveQueueToFeed, prependLiveItemDirectly } from '@/features/feed/feedSlice';
import { ArrowUp, Sparkles, Radio, Zap } from 'lucide-react';
import { ContentItem } from '@/types';

const LIVE_STORY_TEMPLATES: ContentItem[] = [
  {
    id: 'live-tech-',
    type: 'news',
    title: 'Quantum Optical Co-Processors Achieve Real-Time LLM Acceleration',
    summary: 'Next-generation photonic interconnects demonstrated unprecedented bandwidth improvements with 90% power efficiency reduction.',
    category: 'technology',
    source: 'TechPulse Live',
    sourceName: 'TechPulse Live',
    timestamp: 'Just now',
    publishedAt: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    imageAlt: 'Quantum processor',
    url: 'https://example.com/quantum',
    isTrending: true,
    author: 'TechPulse Science Desk',
    readTimeMinutes: 4,
  },
  {
    id: 'live-space-',
    type: 'social',
    title: 'JWST Detects Crystalline Atmospheric Clouds on Habitable-Zone Exoplanet',
    summary: 'Spectroscopic observations confirm silicate cloud patterns and methane signatures on exoplanet K2-18b. #SpaceScience #JWST',
    category: 'science',
    source: '@nasa@astrodon.cloud',
    sourceName: 'NASA Mastodon',
    timestamp: 'Just now',
    publishedAt: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    imageAlt: 'Exoplanet atmosphere',
    url: 'https://mastodon.social/@nasa',
    isTrending: true,
    platform: 'mastodon',
    authorName: 'NASA',
    authorHandle: '@nasa@astrodon.cloud',
    authorAvatar: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100',
    verified: true,
    likesCount: 1420,
    repostsCount: 388,
    commentsCount: 92,
    hashtags: ['SpaceScience', 'JWST'],
  },
  {
    id: 'live-ent-',
    type: 'recommendation',
    title: 'Chronicles of Sol: The Martian Horizon',
    summary: 'An acclaimed gripping thriller following the first planetary expedition when communications blackout hits. Rating: 8.6/10.',
    category: 'entertainment',
    source: 'TMDB Radar',
    sourceName: 'TMDB Radar',
    timestamp: 'Just now',
    publishedAt: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
    imageAlt: 'Martian Horizon',
    url: 'https://themoviedb.org',
    rating: 8.6,
    creator: 'Solar Pictures',
    subType: 'movie',
    genre: ['Sci-Fi', 'Thriller'],
    releaseYear: 2026,
    isTrending: true,
  },
];

export const NewItemsPill: React.FC<{ className?: string }> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const liveQueue = useAppSelector((state) => state.feed.liveQueue);

  const handleClickQueue = () => {
    dispatch(applyLiveQueueToFeed());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFetchInstantLive = () => {
    const template = LIVE_STORY_TEMPLATES[Math.floor(Math.random() * LIVE_STORY_TEMPLATES.length)];
    const newItem: ContentItem = {
      ...template,
      id: `${template.id}${Date.now()}`,
      publishedAt: new Date().toISOString(),
    };
    dispatch(prependLiveItemDirectly(newItem));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (liveQueue.length > 0) {
    return (
      <div className={`flex justify-center my-3 animate-fade-in ${className}`}>
        <button
          onClick={handleClickQueue}
          type="button"
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-stone-900 hover:bg-black dark:bg-white dark:hover:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold shadow-lg shadow-black/15 transition-transform hover:-translate-y-0.5 cursor-pointer ring-2 ring-emerald-400"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <ArrowUp className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>
            {liveQueue.length} new {liveQueue.length === 1 ? 'story' : 'stories'} received via live stream • Click to show
          </span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between px-4 py-2 my-2 rounded-2xl bg-white/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 text-xs ${className}`}>
      <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="font-semibold text-stone-900 dark:text-stone-200 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-emerald-500" />
          Live SSE Stream Active
        </span>
        <span className="hidden sm:inline text-stone-400">• Periodic real-time content</span>
      </div>

      <button
        onClick={handleFetchInstantLive}
        type="button"
        title="Simulate immediate live real-time story fetch"
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-[11px] transition-colors cursor-pointer"
      >
        <Zap className="w-3 h-3 text-amber-500" />
        <span>Fetch Live Story</span>
      </button>
    </div>
  );
};

export default NewItemsPill;
