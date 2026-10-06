import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ContentItem } from '@/types';
import { fetchFeed, fetchTrending } from './feedThunks';

export interface FeedState {
  currentRequestId?: string;
  items: ContentItem[];
  originalItems: ContentItem[];
  trendingAll: ContentItem[];
  trendingForYou: ContentItem[];
  liveQueue: ContentItem[];
  customOrderIds: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  trendingStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  page: number;
  hasMore: boolean;
  isReordered: boolean;
  selectedDetailItem: ContentItem | null;
}

const initialState: FeedState = {
  items: [],
  originalItems: [],
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
};

export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    reorderFeedItems: (state, action: PayloadAction<ContentItem[]>) => {
      state.items = action.payload;
      state.customOrderIds = action.payload.map((i) => i.id);
      state.isReordered = true;
    },
    moveItem: (state, action: PayloadAction<{ index: number; direction: 'up' | 'down' }>) => {
      const { index, direction } = action.payload;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (index < 0 || index >= state.items.length) return;
      if (targetIndex < 0 || targetIndex >= state.items.length) return;

      const newItems = [...state.items];
      const temp = newItems[index];
      newItems[index] = newItems[targetIndex];
      newItems[targetIndex] = temp;

      state.items = newItems;
      state.customOrderIds = newItems.map((i) => i.id);
      state.isReordered = true;
    },
    resetFeedOrder: (state) => {
      state.items = [...state.originalItems];
      state.customOrderIds = [];
      state.isReordered = false;
    },
    setSelectedDetailItem: (state, action: PayloadAction<ContentItem | null>) => {
      state.selectedDetailItem = action.payload;
    },
    pushLiveItem: (state, action: PayloadAction<ContentItem>) => {
      const item = action.payload;
      if (
        !state.liveQueue.some((i) => i.id === item.id) &&
        !state.items.some((i) => i.id === item.id)
      ) {
        state.liveQueue.unshift(item);
        state.liveQueue = state.liveQueue.slice(0, 50);
      }
    },
    prependLiveItemDirectly: (state, action: PayloadAction<ContentItem>) => {
      const item = action.payload;
      if (!state.items.some((i) => i.id === item.id)) {
        state.items = [item, ...state.items];
        state.originalItems = [item, ...state.originalItems];
      }
    },
    applyLiveQueueToFeed: (state) => {
      if (state.liveQueue.length > 0) {
        state.items = [...state.liveQueue, ...state.items];
        state.originalItems = [...state.liveQueue, ...state.originalItems];
        state.liveQueue = [];
      }
    },
    dismissLiveQueue: (state) => {
      state.liveQueue = [];
    },
    clearFeedError: (state) => {
      state.error = null;
    },
    addCustomItem: (state, action: PayloadAction<ContentItem>) => {
      const item = action.payload;
      state.items = [item, ...state.items.filter((i) => i.id !== item.id)];
      state.originalItems = [item, ...state.originalItems.filter((i) => i.id !== item.id)];
      if (typeof window !== 'undefined') {
        try {
          const stored = JSON.parse(localStorage.getItem('pulse_custom_items') || '[]');
          localStorage.setItem('pulse_custom_items', JSON.stringify([item, ...stored.filter((i: ContentItem) => i.id !== item.id)]));
        } catch {}
      }
    },
    incrementPage: (state) => {
      state.page += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchFeed
      .addCase(fetchFeed.pending, (state, action) => {
        state.currentRequestId = action.meta.requestId;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.status = 'succeeded';
        if (action.payload.isReset) {
          state.items = action.payload.items;
          state.originalItems = action.payload.items;
          state.page = 1;
          if (state.customOrderIds.length) {
            const ranks = new Map(state.customOrderIds.map((id,index) => [id,index]));
            state.items = [...state.items].sort((a,b) => (ranks.get(a.id) ?? 9999) - (ranks.get(b.id) ?? 9999));
          }
          state.isReordered = state.customOrderIds.length > 0;
        } else {
          const newItems = action.payload.items.filter(
            (newItem) => !state.items.some((existing) => existing.id === newItem.id)
          );
          state.items = [...state.items, ...newItems];
          state.originalItems = [...state.originalItems, ...newItems];
        }
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId || action.meta.aborted) return;
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // fetchTrending
      .addCase(fetchTrending.pending, (state) => {
        state.trendingStatus = 'loading';
      })
      .addCase(fetchTrending.fulfilled, (state, action) => {
        state.trendingStatus = 'succeeded';
        if (action.payload.scope === 'forYou') {
          state.trendingForYou = action.payload.items;
        } else {
          state.trendingAll = action.payload.items;
        }
      })
      .addCase(fetchTrending.rejected, (state) => {
        state.trendingStatus = 'failed';
      });
  },
});

export const {
  reorderFeedItems,
  moveItem,
  resetFeedOrder,
  setSelectedDetailItem,
  pushLiveItem,
  prependLiveItemDirectly,
  applyLiveQueueToFeed,
  dismissLiveQueue,
  clearFeedError,
  addCustomItem,
  incrementPage,
} = feedSlice.actions;

export default feedSlice.reducer;
