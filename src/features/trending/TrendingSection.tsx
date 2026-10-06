'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTrending } from '@/features/feed/feedThunks';
import { selectTrendingAll, selectTrendingForYou, selectTrendingStatus } from './selectors';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { ContentCard } from '@/components/cards/ContentCard';
import { TrendingUp, Flame } from 'lucide-react';
import { ContentItem } from '@/types';

interface TrendingSectionProps {
  scope?: 'all' | 'forYou';
  className?: string;
  limit?: number;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  scope = 'all',
  className = '',
  limit = 6,
}) => {
  const dispatch = useAppDispatch();
  const trendingItems = useAppSelector(
    scope === 'forYou' ? selectTrendingForYou : selectTrendingAll
  );
  const query = useAppSelector(s=>s.search.debouncedQuery);
  const categories = useAppSelector(s=>s.preferences.favoriteCategories);
  const status = useAppSelector(selectTrendingStatus);

  useEffect(() => {
    dispatch(fetchTrending(scope));
  }, [dispatch, scope, categories]);

  if (status === 'loading' && trendingItems.length === 0) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const filtered = trendingItems.filter(i=>[i.title,i.summary].join(' ').toLowerCase().includes(query.toLowerCase()));
  const itemsToDisplay = limit ? filtered.slice(0, limit) : filtered;

  if(status === 'failed') return <div role="alert">Could not load trends. <button onClick={()=>dispatch(fetchTrending(scope))}>Try again</button></div>;
  if(!itemsToDisplay.length && status === 'succeeded') return <p>No matching trends. Try another search.</p>;
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        {scope === 'forYou' ? (
          <Flame className="w-5 h-5 text-amber-500" />
        ) : (
          <TrendingUp className="w-5 h-5 text-indigo-500" />
        )}
        <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          {scope === 'forYou' ? 'Trending For You' : 'Trending Highlights'}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itemsToDisplay.map((item: ContentItem) => (
          <ContentCard key={item.id} item={item} isDraggable={false} />
        ))}
      </div>
    </div>
  );
};

export default TrendingSection;
