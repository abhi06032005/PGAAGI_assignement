import { combineReducers } from '@reduxjs/toolkit';
import preferencesReducer from '@/features/preferences/preferencesSlice';
import favoritesReducer from '@/features/favorites/favoritesSlice';
import searchReducer from '@/features/search/searchSlice';
import authReducer from '@/features/auth/authSlice';
import feedReducer from '@/features/feed/feedSlice';
import spotifyReducer from '@/features/spotify/spotifySlice';
import vibeReducer from '@/features/vibe/vibeSlice';

export const rootReducer = combineReducers({
  preferences: preferencesReducer,
  favorites: favoritesReducer,
  search: searchReducer,
  auth: authReducer,
  feed: feedReducer,
  spotify: spotifyReducer,
  vibe: vibeReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
