import { describe, it, expect } from 'vitest';
import preferencesReducer, {
  toggleCategory,
  setTheme,
  resetPreferences,
} from '@/features/preferences/preferencesSlice';
import favoritesReducer, {
  toggleFavorite,
  clearFavorites,
} from '@/features/favorites/favoritesSlice';
import searchReducer, {
  setQuery,
  setDebouncedQuery,
  setSelectedCategory,
  setSelectedNewsRegion,
  setCustomNewsTopic,
  resetSearch,
} from '@/features/search/searchSlice';
import spotifyReducer, {
  playTrack,
  playPlaylist,
  nextTrack,
  prevTrack,
  DEFAULT_MUSIC_QUEUE,
} from '@/features/spotify/spotifySlice';
import { NewsItem, UserPreferences, Category, ContentType, MusicItem } from '@/types';

const sampleItem: NewsItem = {
  id: 'news-test-1',
  type: 'news',
  title: 'Quantum Computing Breakthrough',
  description: 'Researchers discover room-temperature quantum states.',
  summary: 'Researchers discover room-temperature quantum states.',
  category: 'technology',
  timestamp: 'Just now',
  publishedAt: new Date().toISOString(),
  source: 'TechDaily',
  sourceName: 'TechDaily',
  imageAlt: 'Quantum computing lab',
  tags: ['quantum', 'physics'],
  readTimeMinutes: 3,
};

describe('preferencesSlice', () => {
  it('should toggle a category correctly', () => {
    const initialState: UserPreferences = {
      favoriteCategories: ['technology', 'finance'] as Category[],
      favoriteTypes: ['news'] as ContentType[],
      theme: 'dark',
      language: 'en',
      autoRefreshRealtime: true,
      refreshIntervalSeconds: 30,
      compactMode: false,
    };

    // Toggle off finance
    const state1 = preferencesReducer(initialState, toggleCategory('finance'));
    expect(state1.favoriteCategories).toEqual(['technology']);

    // Toggle on sports
    const state2 = preferencesReducer(state1, toggleCategory('sports'));
    expect(state2.favoriteCategories).toContain('sports');
  });

  it('should update theme to light or dark', () => {
    const state = preferencesReducer(undefined, setTheme('light'));
    expect(state.theme).toBe('light');
  });

  it('should reset preferences to default values', () => {
    const customState: UserPreferences = {
      favoriteCategories: ['sports'] as Category[],
      favoriteTypes: ['social'] as ContentType[],
      theme: 'light',
      language: 'en',
      autoRefreshRealtime: false,
      refreshIntervalSeconds: 60,
      compactMode: true,
    };
    const resetState = preferencesReducer(customState, resetPreferences());
    expect(resetState.favoriteCategories).toContain('technology');
    expect(resetState.theme).toBe('light');
  });
});

describe('favoritesSlice', () => {
  it('should add item to favorites and toggle off when clicked again', () => {
    let state = favoritesReducer(undefined, toggleFavorite(sampleItem));
    expect(state.favoriteIds).toContain('news-test-1');
    expect(state.favoriteItems.length).toBe(1);

    // Toggle off
    state = favoritesReducer(state, toggleFavorite(sampleItem));
    expect(state.favoriteIds).not.toContain('news-test-1');
    expect(state.favoriteItems.length).toBe(0);
  });

  it('should clear all favorites', () => {
    let state = favoritesReducer(undefined, toggleFavorite(sampleItem));
    expect(state.favoriteItems.length).toBe(1);

    state = favoritesReducer(state, clearFavorites());
    expect(state.favoriteItems.length).toBe(0);
    expect(state.favoriteIds.length).toBe(0);
  });
});

describe('searchSlice', () => {
  it('should handle search query and debounce update', () => {
    let state = searchReducer(undefined, setQuery('crypto'));
    expect(state.query).toBe('crypto');

    state = searchReducer(state, setDebouncedQuery('crypto'));
    expect(state.debouncedQuery).toBe('crypto');
  });

  it('should reset search filters to initial state', () => {
    let state = searchReducer(undefined, setQuery('ai'));
    state = searchReducer(state, setSelectedCategory('technology'));
    expect(state.query).toBe('ai');
    expect(state.selectedCategory).toBe('technology');

    state = searchReducer(state, resetSearch());
    expect(state.query).toBe('');
    expect(state.selectedCategory).toBe('all');
    expect(state.selectedNewsRegion).toBe('all');
    expect(state.customNewsTopic).toBe('');
  });

  it('should handle news region and custom topic filtering', () => {
    let state = searchReducer(undefined, setSelectedNewsRegion('india'));
    expect(state.selectedNewsRegion).toBe('india');

    state = searchReducer(state, setSelectedNewsRegion('international'));
    expect(state.selectedNewsRegion).toBe('international');

    state = searchReducer(state, setSelectedNewsRegion('custom'));
    state = searchReducer(state, setCustomNewsTopic('AI & Space'));
    expect(state.selectedNewsRegion).toBe('custom');
    expect(state.customNewsTopic).toBe('AI & Space');
  });
});

describe('spotifySlice - next track and queue skipping', () => {
  const sampleTrackA: MusicItem = {
    id: 'track-alpha',
    type: 'music',
    title: 'Alpha Waves',
    artist: 'Mind Drift',
    album: 'Frequencies',
    summary: 'Calm ambient focus sound',
    category: 'technology',
    timestamp: 'Just now',
  };

  const sampleTrackB: MusicItem = {
    id: 'track-beta',
    type: 'music',
    title: 'Beta Groove',
    artist: 'Rhythm Lab',
    album: 'Motion',
    summary: 'Dynamic electronic tempo',
    category: 'entertainment',
    timestamp: 'Just now',
  };

  it('should auto-populate a queue when playing a track and enable playing next song', () => {
    let state = spotifyReducer(undefined, playTrack(sampleTrackA));
    expect(state.currentTrack?.id).toBe('track-alpha');
    expect(state.isPlaying).toBe(true);
    // Queue should have more than 1 track so skipping is immediately possible
    expect(state.currentPlaylist.length).toBeGreaterThan(1);
    expect(state.playlistIndex).toBe(0);

    // User does not want to play the current song -> clicks next song
    state = spotifyReducer(state, nextTrack());
    expect(state.playlistIndex).toBe(1);
    expect(state.currentTrack?.id).not.toBe('track-alpha');
    expect(state.isPlaying).toBe(true);
  });

  it('should cycle through tracks using nextTrack and prevTrack', () => {
    let state = spotifyReducer(
      undefined,
      playPlaylist({
        playlist: [sampleTrackA, sampleTrackB],
        startIndex: 0,
        title: 'Test Playlist',
      })
    );
    expect(state.currentTrack?.title).toBe('Alpha Waves');
    expect(state.playlistIndex).toBe(0);

    // Skip to next song
    state = spotifyReducer(state, nextTrack());
    expect(state.currentTrack?.title).toBe('Beta Groove');
    expect(state.playlistIndex).toBe(1);

    // Skip to next song (wraps to start)
    state = spotifyReducer(state, nextTrack());
    expect(state.currentTrack?.title).toBe('Alpha Waves');
    expect(state.playlistIndex).toBe(0);

    // Previous song
    state = spotifyReducer(state, prevTrack());
    expect(state.currentTrack?.title).toBe('Beta Groove');
    expect(state.playlistIndex).toBe(1);
  });
});
