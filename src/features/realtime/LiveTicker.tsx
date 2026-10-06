'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { applyLiveQueueToFeed, dismissLiveQueue } from '@/features/feed/feedSlice';
import { selectLiveQueue } from '@/features/feed/selectors';
import { useRealtimeFeed } from './useRealtimeFeed';
import { Radio, ArrowDown, X, Sparkles } from 'lucide-react';

export const LiveTicker: React.FC<{ className?: string }> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const queue = useAppSelector(selectLiveQueue);
  const { isConnected } = useRealtimeFeed();

  if (queue.length === 0) {
    return (
      <div className={`flex items-center gap-2 text-xs text-stone-500 py-1 ${className}`}>
        <span className="relative flex h-2 w-2">
          {isConnected && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isConnected ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-600'
            }`}
          />
        </span>
        <span className="font-medium">
          {isConnected ? 'Real-Time Stream Active' : 'Connecting to Stream...'}
        </span>
      </div>
    );
  }

  const latest = queue[0];

  return (
    <div
      className={`flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/80 dark:bg-stone-900/90 backdrop-blur-md border border-lime-400/50 shadow-md animate-fade-in ${className}`}
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        <div className="w-8 h-8 rounded-xl bg-lime-400/20 text-lime-700 dark:text-lime-300 flex items-center justify-center flex-shrink-0">
          <Radio className="w-4 h-4 animate-pulse" />
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-lime-700 dark:text-lime-400">
            <Sparkles className="w-3 h-3" />
            <span>{queue.length} New Live {queue.length === 1 ? 'Update' : 'Updates'}</span>
          </div>
          <p className="text-xs text-stone-900 dark:text-stone-100 font-medium truncate max-w-sm sm:max-w-md">
            {latest.title}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => dispatch(applyLiveQueueToFeed())}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          <span>View</span>
          <ArrowDown className="w-3 h-3" />
        </button>
        <button
          onClick={() => dispatch(dismissLiveQueue())}
          aria-label="Dismiss updates"
          className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default LiveTicker;
