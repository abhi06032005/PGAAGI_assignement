import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category, ContentType, Language, ThemeMode, UserPreferences } from '@/types';

const defaultPreferences: UserPreferences = {
  favoriteCategories: ['technology', 'finance', 'entertainment', 'science', 'sports'],
  favoriteTypes: ['news', 'recommendation', 'social', 'music'],
  theme: 'light',
  language: 'en',
  autoRefreshRealtime: true,
  refreshIntervalSeconds: 30,
  compactMode: false,
};

const initialState: UserPreferences = defaultPreferences;

export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    toggleCategory: (state, action: PayloadAction<Category>) => {
      const category = action.payload;
      if (state.favoriteCategories.includes(category)) {
        if (state.favoriteCategories.length > 1) {
          state.favoriteCategories = state.favoriteCategories.filter((c) => c !== category);
        }
      } else {
        state.favoriteCategories.push(category);
      }
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      if (action.payload.length > 0) {
        state.favoriteCategories = action.payload;
      }
    },
    toggleContentType: (state, action: PayloadAction<ContentType>) => {
      const type = action.payload;
      if (state.favoriteTypes.includes(type)) {
        if (state.favoriteTypes.length > 1) {
          state.favoriteTypes = state.favoriteTypes.filter((t) => t !== type);
        }
      } else {
        state.favoriteTypes.push(type);
      }
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
    toggleAutoRefresh: (state) => {
      state.autoRefreshRealtime = !state.autoRefreshRealtime;
    },
    toggleCompactMode: (state) => {
      state.compactMode = !state.compactMode;
    },
    loadPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      return { ...state, ...action.payload };
    },
    resetPreferences: () => {
      return defaultPreferences;
    },
  },
});

export const {
  toggleCategory,
  setCategories,
  toggleContentType,
  setTheme,
  setLanguage,
  toggleAutoRefresh,
  toggleCompactMode,
  loadPreferences,
  resetPreferences,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
