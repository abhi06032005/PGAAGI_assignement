'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { applyLiveQueueToFeed } from '@/features/feed/feedSlice';
import { ArrowUp, Sparkles } from 'lucide-react';

export const NewItemsPill: React.FC<{ className?: string }> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const liveQueue = useAppSelector((state) => state.feed.liveQueue);

  if (liveQueue.length === 0) {
    return null;
  }

  const handleClick = () => {
    dispatch(applyLiveQueueToFeed());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`flex justify-center my-3 animate-fade-in ${className}`}>
      <button
        onClick={handleClick}
        type="button"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900 hover:bg-black dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-bold shadow-lg shadow-black/15 transition-transform hover:-translate-y-0.5 cursor-pointer"
      >
        <ArrowUp className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
        <span>
          {liveQueue.length} new {liveQueue.length === 1 ? 'item' : 'items'} available
        </span>
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
      </button>
    </div>
  );
};

export default NewItemsPill;
