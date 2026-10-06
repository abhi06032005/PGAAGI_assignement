'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { pushLiveItem } from '@/features/feed/feedSlice';
import { ContentItem } from '@/types';

export function useEventSource() {
  const dispatch = useAppDispatch();
  const autoRefresh = useAppSelector((state) => state.preferences.autoRefreshRealtime);
  const categories = useAppSelector(s => s.preferences.favoriteCategories);
  const selectedType = useAppSelector(s => s.search.selectedType);
  const selectedCategory = useAppSelector(s => s.search.selectedCategory);
  const query = useAppSelector(s => s.search.debouncedQuery);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/stream');
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
      };

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const rawItem = (payload.type === 'ITEM' && payload.data ? payload.data : (payload.id && payload.title ? payload : null)) as ContentItem | null;
          if (rawItem) {
            const matchesType = selectedType === 'all' || rawItem.type === selectedType;
            const matchesCategory = selectedCategory === 'all' || rawItem.category === selectedCategory;
            const matchesQuery = !query || `${rawItem.title} ${rawItem.summary || ''}`.toLowerCase().includes(query.toLowerCase());
            if (matchesType && matchesCategory && matchesQuery) {
              dispatch(pushLiveItem(rawItem));
            }
          }
        } catch {
          // Ignore parse errors
        }
      };

      es.onerror = () => {
        setIsConnected(false);
      };
    } catch {
      // EventSource initialization failed, remains disconnected
    }

    return () => {
      if (es) {
        es.close();
      }
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [autoRefresh, dispatch, categories, selectedType, selectedCategory, query]);

  return { isConnected };
}

export default useEventSource;
