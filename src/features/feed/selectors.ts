import { RootState } from '@/store/store';
import { createSelector } from '@reduxjs/toolkit';
import { ContentItem } from '@/types';

export const selectFeedItems = (state: RootState) => state.feed.items;
export const selectFeedStatus = (state: RootState) => state.feed.status;
export const selectFeedError = (state: RootState) => state.feed.error;
export const selectFeedHasMore = (state: RootState) => state.feed.hasMore;
export const selectFeedIsReordered = (state: RootState) => state.feed.isReordered;
export const selectSelectedDetailItem = (state: RootState) => state.feed.selectedDetailItem;
export const selectLiveQueue = (state: RootState) => state.feed.liveQueue;
export const selectTrendingAll = (state: RootState) => state.feed.trendingAll;
export const selectTrendingForYou = (state: RootState) => state.feed.trendingForYou;
export const selectTrendingStatus = (state: RootState) => state.feed.trendingStatus;

export const selectFilteredFeedItems = createSelector(
  [
    selectFeedItems,
    (state: RootState) => state.search.debouncedQuery,
    (state: RootState) => state.search.selectedCategory,
    (state: RootState) => state.search.selectedType,
    (state: RootState) => state.search.selectedNewsRegion,
    (state: RootState) => state.search.customNewsTopic,
    (state: RootState) => state.search.selectedSocialPlatform,
  ],
  (items, query, category, type, newsRegion, customNewsTopic, socialPlatform) => {
    return items.filter((item: ContentItem) => {
      // Category filter
      if (category !== 'all' && item.category !== category) {
        return false;
      }
      // Type filter
      if (type !== 'all' && item.type !== type) {
        return false;
      }
      // Social Platform filter
      if (item.type === 'social' && socialPlatform && socialPlatform !== 'all') {
        const itemPlatform = (item as any).platform;
        if (itemPlatform !== socialPlatform) {
          return false;
        }
      }
      // News Region filter
      if (item.type === 'news' && newsRegion && newsRegion !== 'all') {
        const itemRegion = (item as any).region;
        const text = `${item.title} ${item.summary} ${(item.tags || []).join(' ')}`.toLowerCase();
        const isIndiaRelated = itemRegion === 'india' || /india|delhi|mumbai|bengaluru|isro|rbi|rupee|bharat|hindu|mint/i.test(text);

        if (newsRegion === 'india' && !isIndiaRelated) {
          return false;
        }
        if (newsRegion === 'international' && isIndiaRelated && itemRegion !== 'international') {
          return false;
        }
        if (newsRegion === 'custom' && customNewsTopic.trim()) {
          const topicMatch = text.includes(customNewsTopic.trim().toLowerCase());
          if (!topicMatch) return false;
        }
      }
      // Local search filtering
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSummary = item.summary.toLowerCase().includes(q);
        return matchesTitle || matchesSummary;
      }
      return true;
    });
  }
);
