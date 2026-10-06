import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ContentItem } from '@/types';

export interface FavoritesState {
  favoriteIds: string[];
  favoriteItems: ContentItem[];
}

const initialState: FavoritesState = {
  favoriteIds: [],
  favoriteItems: [],
};

export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<ContentItem>) => {
      const item = action.payload;
      const index = state.favoriteIds.indexOf(item.id);

      if (index >= 0) {
        state.favoriteIds.splice(index, 1);
        state.favoriteItems = state.favoriteItems.filter((fav) => fav.id !== item.id);
      } else {
        state.favoriteIds.push(item.id);
        state.favoriteItems.unshift(item);
      }
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.favoriteIds = state.favoriteIds.filter((favId) => favId !== id);
      state.favoriteItems = state.favoriteItems.filter((fav) => fav.id !== id);
    },
    clearFavorites: (state) => {
      state.favoriteIds = [];
      state.favoriteItems = [];
    },
    loadFavorites: (state, action: PayloadAction<ContentItem[]>) => {
      state.favoriteItems = action.payload;
      state.favoriteIds = action.payload.map((item) => item.id);
    },
  },
});

export const { toggleFavorite, removeFavorite, clearFavorites, loadFavorites } = favoritesSlice.actions;

export default favoritesSlice.reducer;
