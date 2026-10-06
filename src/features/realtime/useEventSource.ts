'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { pushLiveItem } from '@/features/feed/feedSlice';
import { ContentItem } from '@/types';

export function useEventSource() {
  const dispatch = useAppDispatch();
  const autoRefresh = useAppSelector((state) => state.preferences.autoRefreshRealtime);
  const selectedType = useAppSelector((s) => s.search.selectedType);
  const selectedCategory = useAppSelector((s) => s.search.selectedCategory);
  const query = useAppSelector((s) => s.search.debouncedQuery);

  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const failureCountRef = useRef(0);

  // Store latest filter values in refs so the active SSE connection is NOT rebuilt on every keystroke/filter change
  const filterRef = useRef({ selectedType, selectedCategory, query });
  useEffect(() => {
    filterRef.current = { selectedType, selectedCategory, query };
  }, [selectedType, selectedCategory, query]);

  useEffect(() => {
    if (!autoRefresh) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      setIsConnected(false);
      return;
    }

    let isSubscribed = true;

    function connect() {
      if (!isSubscribed) return;

      // Stop reconnect storm if server is unresponsive (max 3 retries, exponential backoff)
      if (failureCountRef.current >= 4) {
        console.warn('[Stream] Server-Sent Events stream paused after repeated failures.');
        setIsConnected(false);
        return;
      }

      // Cleanup any existing instance
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      try {
        const es = new EventSource('/api/stream');
        eventSourceRef.current = es;

        es.onopen = () => {
          if (!isSubscribed) return;
          setIsConnected(true);
          failureCountRef.current = 0; // Reset failures on successful connect
        };

        es.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const payload = JSON.parse(event.data);
            const rawItem = (
              payload.type === 'ITEM' && payload.data
                ? payload.data
                : (payload.id && payload.title ? payload : null)
            ) as ContentItem | null;

            if (rawItem) {
              const { selectedType: t, selectedCategory: c, query: q } = filterRef.current;
              const matchesType = t === 'all' || rawItem.type === t;
              const matchesCategory = c === 'all' || rawItem.category === c;
              const matchesQuery = !q || `${rawItem.title} ${rawItem.summary || ''}`.toLowerCase().includes(q.toLowerCase());

              if (matchesType && matchesCategory && matchesQuery) {
                dispatch(pushLiveItem(rawItem));
              }
            }
          } catch {
            // Ignore parse errors
          }
        };

        es.onerror = () => {
          if (!isSubscribed) return;
          setIsConnected(false);
          // Explicitly close so the browser doesn't spam immediate reconnect loops!
          es.close();
          eventSourceRef.current = null;

          failureCountRef.current += 1;
          // Exponential backoff: 10s, 20s, 30s
          const delay = Math.min(30000, failureCountRef.current * 10000);
          console.log(`[Stream] Disconnected. Backing off for ${delay / 1000}s before retry...`);

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isSubscribed) {
              connect();
            }
          }, delay);
        };
      } catch {
        setIsConnected(false);
      }
    }

    connect();

    return () => {
      isSubscribed = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    };
  }, [autoRefresh, dispatch]); // Notice: NO query/category re-triggering here!

  return { isConnected };
}

export default useEventSource;
