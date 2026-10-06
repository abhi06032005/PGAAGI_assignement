import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category, ContentType } from '@/types';

export interface SearchState {
  query: string;
  debouncedQuery: string;
  selectedCategory: Category | 'all';
  selectedType: ContentType | 'all';
}

const initialState: SearchState = {
  query: '',
  debouncedQuery: '',
  selectedCategory: 'all',
  selectedType: 'all',
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
    resetSearch: (state) => {
      state.query = '';
      state.debouncedQuery = '';
      state.selectedCategory = 'all';
      state.selectedType = 'all';
    },
  },
});

export const {
  setQuery,
  setDebouncedQuery,
  setSelectedCategory,
  setSelectedType,
  resetSearch,
} = searchSlice.actions;

export default searchSlice.reducer;
