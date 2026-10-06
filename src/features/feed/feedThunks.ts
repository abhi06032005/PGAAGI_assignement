import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api/client';
import { ContentItem, PaginatedResponse } from '@/types';
import { RootState } from '@/store/store';

export const fetchFeed = createAsyncThunk(
  'feed/fetchFeed',
  async (
    params: { resetPage?: boolean } = {},
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const { favoriteCategories, favoriteTypes } = state.preferences;
      const { debouncedQuery, selectedCategory, selectedType } = state.search;
      const page = params.resetPage ? 1 : state.feed.page;

      const queryParams: Record<string, string | number> = {
        page,
        limit: 12,
      };

      if (selectedCategory !== 'all') {
        queryParams.category = selectedCategory;
      } else if (favoriteCategories.length > 0) {
        queryParams.category = favoriteCategories.join(',');
      }

      if (selectedType !== 'all') {
        queryParams.types = selectedType;
      } else if (favoriteTypes.length > 0) {
        queryParams.types = favoriteTypes.join(',');
      }

      if (debouncedQuery && debouncedQuery.trim()) {
        queryParams.search = debouncedQuery.trim();
      }

      // Calls /api/feed which Next.js rewrites to Express backend
      const response = await apiClient.get<PaginatedResponse<ContentItem> | { data: ContentItem[]; hasMore: boolean; nextPage?: number }>(
        '/api/feed',
        queryParams
      );

      // Support both { items, nextPage, total } and legacy { data, hasMore }
      let items: ContentItem[] = [];
      let hasMore = false;
      let nextPage = null;

      if ('items' in response) {
        items = response.items;
        nextPage = response.nextPage;
        hasMore = Boolean(response.nextPage);
      } else if ('data' in response) {
        items = response.data;
        hasMore = Boolean(response.hasMore);
        nextPage = hasMore ? page + 1 : null;
      }

      return {
        items,
        page,
        hasMore,
        nextPage,
        isReset: Boolean(params.resetPage),
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch feed items';
      return rejectWithValue(message);
    }
  }
);

export const fetchTrending = createAsyncThunk(
  'feed/fetchTrending',
  async (scope: 'all' | 'forYou' = 'all', { getState, rejectWithValue }) => {
    try {
      const queryParams: Record<string, string | number | boolean> = {
        trending: true,
        limit: 15,
      };

      if (scope === 'forYou') {
        const state = getState() as RootState;
        const categories = state.preferences.favoriteCategories;
        if (categories.length > 0) {
          queryParams.category = categories.join(',');
        }
      }

      const response = await apiClient.get<PaginatedResponse<ContentItem> | { data: ContentItem[] }>(
        '/api/feed',
        queryParams
      );

      const items = 'items' in response ? response.items : (response as { data: ContentItem[] }).data || [];
      return { items, scope };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch trending items';
      return rejectWithValue(message);
    }
  }
);
