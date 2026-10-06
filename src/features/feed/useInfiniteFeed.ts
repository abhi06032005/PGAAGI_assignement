'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchFeed } from './feedThunks';
import { incrementPage } from './feedSlice';
import { selectFeedHasMore, selectFeedStatus } from './selectors';

export function useInfiniteFeed() {
  const dispatch = useAppDispatch();
  const hasMore = useAppSelector(selectFeedHasMore);
  const status = useAppSelector(selectFeedStatus);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(() => {
    if (status === 'succeeded' && hasMore) {
      dispatch(incrementPage());
      dispatch(fetchFeed({ resetPage: false }));
    }
  }, [dispatch, hasMore, status]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && status !== 'loading') {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    observer.observe(target);
    return () => {
      observer.unobserve(target);
      observer.disconnect();
    };
  }, [hasMore, status, loadMore]);

  return { sentinelRef, loadMore, isLoading: status === 'loading', hasMore };
}

export default useInfiniteFeed;
