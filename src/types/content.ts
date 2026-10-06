export type ContentType = 'news' | 'recommendation' | 'social' | 'music' | 'apod';

export type Category = 
  | 'technology'
  | 'finance'
  | 'sports'
  | 'entertainment'
  | 'health'
  | 'science'
  | 'space'
  | 'all';

export type NewsRegion = 'all' | 'india' | 'international' | 'custom';

export type VibeLabel = 'Chill' | 'Energetic' | 'Focused' | 'Feel-good' | 'Hype';

export interface VibeData {
  primaryVibe: VibeLabel;
  secondaryVibe: VibeLabel;
  description: string;
  drivingArtists: string[];
  isManualOverride?: boolean;
}

/**
 * Normalized content item shape shared across all data sources
 * { id, type, title, description, imageUrl, imageAlt, source, url, publishedAt, tags }
 */
export interface NormalizedContentItem {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  summary: string; // backwards compatibility alias for description
  imageUrl?: string;
  imageAlt?: string;
  source?: string;
  sourceName?: string; // backwards compatibility alias
  url?: string;
  publishedAt?: string;
  timestamp: string; // backwards compatibility alias for publishedAt
  tags?: string[];
  category: Category;
  region?: 'india' | 'international';
  isTrending?: boolean;
  vibeScore?: number;
}

export interface NewsItem extends NormalizedContentItem {
  type: 'news';
  author?: string;
  readTimeMinutes?: number;
  region?: 'india' | 'international';
}

export interface RecommendationItem extends NormalizedContentItem {
  type: 'recommendation';
  subType: 'movie' | 'music' | 'podcast';
  rating: number; // e.g. 8.4 / 10 or 4.8 / 5
  genre: string[];
  releaseYear: number;
  creator: string; // director or artist
  backdropUrl?: string;
  durationOrEpisodes?: string;
}

export interface SocialItem extends NormalizedContentItem {
  type: 'social';
  platform: 'mastodon' | 'twitter' | 'threads' | 'bluesky' | 'instagram';
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  verified?: boolean;
  likesCount: number;
  repostsCount: number;
  commentsCount: number;
  hashtags: string[];
}

export interface MusicItem extends NormalizedContentItem {
  type: 'music';
  artist: string;
  album: string;
  durationMs?: number;
  progressMs?: number;
  previewUrl?: string | null;
  externalUrl?: string;
  isPlaying?: boolean;
}

export interface ApodItem extends NormalizedContentItem {
  type: 'apod';
  copyright?: string;
  date: string;
  mediaType: 'image' | 'video';
}

export type ContentItem = NewsItem | RecommendationItem | SocialItem | MusicItem | ApodItem;

export type DashboardTab = 'feed' | 'trending' | 'favorites' | 'discover' | 'live';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  album: string;
  albumArt: string;
  durationMs: number;
  progressMs?: number;
  isPlaying?: boolean;
  previewUrl?: string | null;
  spotifyUrl?: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  imageUrl?: string;
}

export interface MoodSentiment {
  moodTag: string;
  energy: number; // 0 - 100
  valence: number; // 0 - 100
  danceability: number; // 0 - 100
  tempoBpm: number;
  vibeSummary: string;
  recommendedGenres: string[];
  rationale?: string;
}

export interface AiMoodPlaylist {
  id: string;
  title: string;
  description: string;
  prompt: string;
  createdAt: string;
  sentiment: MoodSentiment;
  tracks: MusicItem[];
}
