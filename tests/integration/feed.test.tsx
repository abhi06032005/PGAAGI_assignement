import { describe, it, expect } from 'vitest';
import { mockNewsArticles } from '@/server/mocks/news';
import { mockRecommendations } from '@/server/mocks/recommendations';
import { mockSocialPosts } from '@/server/mocks/social';
import feedReducer, {
  reorderFeedItems,
  resetFeedOrder,
  dismissLiveQueue,
} from '@/features/feed/feedSlice';

describe('Integration & Feed Logic', () => {
  it('combines multi-source items cleanly with distinct types', () => {
    const combined = [...mockNewsArticles, ...mockRecommendations, ...mockSocialPosts];
    const types = new Set(combined.map((item) => item.type));

    expect(types.has('news')).toBe(true);
    expect(types.has('recommendation')).toBe(true);
    expect(types.has('social')).toBe(true);
    expect(combined.length).toBeGreaterThanOrEqual(18);
  });

  it('handles reordering feed items and resetting to original state', () => {
    const initialItems = [...mockNewsArticles];
    const reversed = [...initialItems].reverse();

    const state1 = feedReducer(
      {
        items: initialItems,
        originalItems: initialItems,
        trendingAll: [],
        trendingForYou: [],
        liveQueue: [],
        customOrderIds: [],
        status: 'idle',
        trendingStatus: 'idle',
        error: null,
        page: 1,
        hasMore: true,
        isReordered: false,
        selectedDetailItem: null,
      },
      reorderFeedItems(reversed)
    );

    expect(state1.isReordered).toBe(true);
    expect(state1.items[0].id).toBe(reversed[0].id);

    // Reset order
    const state2 = feedReducer(state1, resetFeedOrder());
    expect(state2.isReordered).toBe(false);
    expect(state2.items[0].id).toBe(initialItems[0].id);
  });

  it('clears live queue on demand', () => {
    const state = feedReducer(
      {
        items: [],
        originalItems: [],
        trendingAll: [],
        trendingForYou: [],
        liveQueue: [mockNewsArticles[0]],
        customOrderIds: [],
        status: 'idle',
        trendingStatus: 'idle',
        error: null,
        page: 1,
        hasMore: true,
        isReordered: false,
        selectedDetailItem: null,
      },
      dismissLiveQueue()
    );
    expect(state.liveQueue.length).toBe(0);
  });
});
