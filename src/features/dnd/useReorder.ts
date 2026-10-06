'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { reorderFeedItems, moveItem, resetFeedOrder } from '@/features/feed/feedSlice';
import { ContentItem } from '@/types';

export function useReorder() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.feed.items);
  const isReordered = useAppSelector((state) => state.feed.isReordered);

  const handleReorder = useCallback(
    (newOrder: ContentItem[]) => {
      dispatch(reorderFeedItems(newOrder));
    },
    [dispatch]
  );

  const moveUp = useCallback(
    (index: number) => {
      if (index > 0) {
        dispatch(moveItem({ index, direction: 'up' }));
      }
    },
    [dispatch]
  );

  const moveDown = useCallback(
    (index: number) => {
      if (index < items.length - 1) {
        dispatch(moveItem({ index, direction: 'down' }));
      }
    },
    [dispatch, items.length]
  );

  const reset = useCallback(() => {
    dispatch(resetFeedOrder());
  }, [dispatch]);

  return {
    items,
    isReordered,
    handleReorder,
    moveUp,
    moveDown,
    reset,
  };
}

export default useReorder;
