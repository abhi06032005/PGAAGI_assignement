import { UserProfile } from './user';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextPage: number | null;
  total: number;
}

export interface FeedQueryParams {
  categories?: string;
  types?: string;
  search?: string;
  page?: number;
  limit?: number;
  trending?: boolean;
}

export interface AuthResponse {
  user: UserProfile;
  token?: string;
}

export interface SpotifyStatusResponse {
  isSpotifyConnected: boolean;
  userName?: string;
}
