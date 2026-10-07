import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category, ContentType, NewsRegion } from '@/types';

export type SocialPlatformFilter = 'all' | 'reddit' | 'twitter' | 'mastodon' | 'bluesky';

export interface SearchState {
  query: string;
  debouncedQuery: string;
  selectedCategory: Category | 'all';
  selectedType: ContentType | 'all';
  selectedNewsRegion: NewsRegion;
  customNewsTopic: string;
  selectedSocialPlatform: SocialPlatformFilter;
}

const initialState: SearchState = {
  query: '',
  debouncedQuery: '',
  selectedCategory: 'all',
  selectedType: 'all',
  selectedNewsRegion: 'all',
  customNewsTopic: '',
  selectedSocialPlatform: 'all',
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setDebouncedQuery: (state, action: PayloadAction<string>) => {
      state.debouncedQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<Category | 'all'>) => {
      state.selectedCategory = action.payload;
    },
    setSelectedType: (state, action: PayloadAction<ContentType | 'all'>) => {
      state.selectedType = action.payload;
    },
    setSelectedNewsRegion: (state, action: PayloadAction<NewsRegion>) => {
      state.selectedNewsRegion = action.payload;
    },
    setCustomNewsTopic: (state, action: PayloadAction<string>) => {
      state.customNewsTopic = action.payload;
    },
    setSelectedSocialPlatform: (state, action: PayloadAction<SocialPlatformFilter>) => {
      state.selectedSocialPlatform = action.payload;
    },
    resetSearch: (state) => {
      state.query = '';
      state.debouncedQuery = '';
      state.selectedCategory = 'all';
      state.selectedType = 'all';
      state.selectedNewsRegion = 'all';
      state.customNewsTopic = '';
      state.selectedSocialPlatform = 'all';
    },
  },
});

export const {
  setQuery,
  setDebouncedQuery,
  setSelectedCategory,
  setSelectedType,
  setSelectedNewsRegion,
  setCustomNewsTopic,
  setSelectedSocialPlatform,
  resetSearch,
} = searchSlice.actions;

export default searchSlice.reducer;
