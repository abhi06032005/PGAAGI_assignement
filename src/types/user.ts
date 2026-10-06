import { Category, ContentType } from './content';

export type ThemeMode = 'dark' | 'light' | 'system';

export type Language = 'en' | 'es' | 'fr' | 'hi';

export interface UserPreferences {
  favoriteCategories: Category[];
  favoriteTypes: ContentType[];
  theme: ThemeMode;
  language: Language;
  autoRefreshRealtime: boolean;
  refreshIntervalSeconds: number;
  compactMode: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  handle: string;
  bio: string;
  avatar: string;
  joinedDate: string;
  isAuthenticated: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
