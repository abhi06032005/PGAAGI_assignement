'use client';

import { useEventSource } from './useEventSource';

export function useRealtimeFeed() {
  const { isConnected } = useEventSource();
  return { isConnected, lastMessageTime: null };
}

export default useRealtimeFeed;
