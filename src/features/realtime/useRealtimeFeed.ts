'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { pushLiveItem } from '@/features/feed/feedSlice';
import { ContentItem } from '@/types';

export function useRealtimeFeed() {
  const dispatch = useAppDispatch();
  const autoRefresh = useAppSelector((state) => state.preferences.autoRefreshRealtime);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleIncomingItem = useCallback((item: ContentItem) => {
    dispatch(pushLiveItem(item));
    setLastMessageTime(new Date());
  }, [dispatch]);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    // Try WebSocket connection first
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Backend port is typically 5000 in dev
    const wsUrl = `${protocol}//${window.location.hostname}:5000/ws`;

    let isWsOpen = false;
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        isWsOpen = true;
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'ITEM' && payload.data) {
            handleIncomingItem(payload.data);
          } else if (payload.id && payload.title) {
            handleIncomingItem(payload);
          }
        } catch {
          // Ignore parse errors
        }
      };

      ws.onerror = () => {
        // Fall back to SSE if WS fails
        if (!isWsOpen) {
          startSseFallback();
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
      };
    } catch {
      startSseFallback();
    }

    function startSseFallback() {
      if (eventSourceRef.current) return;
      try {
        const es = new EventSource('/api/stream');
        eventSourceRef.current = es;

        es.onopen = () => {
          setIsConnected(true);
        };

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.data) {
              handleIncomingItem(data.data);
            } else if (data.id) {
              handleIncomingItem(data);
            }
          } catch {
            // Ignore
          }
        };

        es.onerror = () => {
          setIsConnected(false);
        };
      } catch {
        // SSE unsupported
      }
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    };
  }, [autoRefresh, handleIncomingItem]);

  return { isConnected, lastMessageTime };
}

export default useRealtimeFeed;
