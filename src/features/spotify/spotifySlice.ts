import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api/client';
import { MusicItem, SpotifyStatusResponse, AiMoodPlaylist } from '@/types';

interface SpotifyState {
  isConnected: boolean;
  nowPlaying: MusicItem | null;
  musicForYou: MusicItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  currentTrack: MusicItem | null;
  isPlaying: boolean;
  volume: number;
  currentPlaylist: MusicItem[];
  playlistIndex: number;
  playlistTitle?: string;
  savedPlaylists: AiMoodPlaylist[];
  isAiDjModalOpen: boolean;
}

export const DEFAULT_MUSIC_QUEUE: MusicItem[] = [
  {
    id: 'queue-m83',
    type: 'music',
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We’re Dreaming',
    summary: 'Iconic electro-pop anthem with shimmering synths and vibrant rhythm.',
    category: 'entertainment',
    timestamp: 'Pulse Heavy Rotation',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    durationMs: 243000,
    tags: ['Synthpop', 'Electronic', 'Featured'],
  },
  {
    id: 'queue-starboy',
    type: 'music',
    title: 'Starboy',
    artist: 'The Weeknd ft. Daft Punk',
    album: 'Starboy',
    summary: 'High-octane R&B and futuristic electro groove.',
    category: 'entertainment',
    timestamp: 'Top Streaming',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    durationMs: 230000,
    tags: ['Pop', 'R&B', 'Electro'],
  },
  {
    id: 'queue-resonance',
    type: 'music',
    title: 'Resonance',
    artist: 'HOME',
    album: 'Odyssey',
    summary: 'Nostalgic synthwave classic with warm analog frequencies.',
    category: 'technology',
    timestamp: 'Focus Flow',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    durationMs: 212000,
    tags: ['Chillwave', 'Synthwave', 'Ambient'],
  },
  {
    id: 'queue-breathe',
    type: 'music',
    title: 'Breathe',
    artist: 'Télépopmusik',
    album: 'Genetic World',
    summary: 'Deep organic electronic dreamscape with subtle acoustic pulse.',
    category: 'entertainment',
    timestamp: 'Lounge Drift',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    durationMs: 279000,
    tags: ['Downtempo', 'Chill', 'Dreamy'],
  },
  {
    id: 'queue-kiasmos',
    type: 'music',
    title: 'Looped Horizon',
    artist: 'Kiasmos',
    album: 'Blurred',
    summary: 'Pristine neo-classical piano interwoven with minimal electro-rhythm.',
    category: 'technology',
    timestamp: 'Deep Code Work',
    imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=80',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    durationMs: 260000,
    tags: ['Neo-Classical', 'Minimal', 'Coding'],
  },
  {
    id: 'queue-bonobo',
    type: 'music',
    title: 'Kerala',
    artist: 'Bonobo',
    album: 'Migration',
    summary: 'Hypnotic harp sample layers, crisp syncopated beats, and soaring strings.',
    category: 'entertainment',
    timestamp: 'Global Beats',
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    durationMs: 237000,
    tags: ['Electronic', 'World', 'Downtempo'],
  },
  {
    id: 'queue-tycho',
    type: 'music',
    title: 'Coastal Brake',
    artist: 'Tycho',
    album: 'Dive',
    summary: 'Warm sunsets, shimmering guitars, and golden analog synthesizers.',
    category: 'technology',
    timestamp: 'Ambient Radar',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    durationMs: 220000,
    tags: ['Ambient', 'Chillout', 'Instrumental'],
  },
];

const initialState: SpotifyState = {
  isConnected: false,
  nowPlaying: null,
  musicForYou: DEFAULT_MUSIC_QUEUE,
  status: 'idle',
  error: null,
  currentTrack: null,
  isPlaying: false,
  volume: 0.8,
  currentPlaylist: DEFAULT_MUSIC_QUEUE,
  playlistIndex: 0,
  playlistTitle: 'Pulse Flow Queue',
  savedPlaylists: [],
  isAiDjModalOpen: false,
};

export const fetchSpotifyStatus = createAsyncThunk(
  'spotify/fetchSpotifyStatus',
  async () => {
    try {
      const data = await apiClient.get<SpotifyStatusResponse>('/api/spotify/status');
      return data.isSpotifyConnected;
    } catch {
      return false;
    }
  }
);

export const fetchNowPlaying = createAsyncThunk(
  'spotify/fetchNowPlaying',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get<{ item: MusicItem | null }>('/api/spotify/now-playing');
      return data.item;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch now playing';
      return rejectWithValue(message);
    }
  }
);

export const fetchMusicForYou = createAsyncThunk(
  'spotify/fetchMusicForYou',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get<{ items: MusicItem[] }>('/api/music');
      return data.items && data.items.length > 0 ? data.items : DEFAULT_MUSIC_QUEUE;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch music recommendations';
      return rejectWithValue(message);
    }
  }
);

export const spotifySlice = createSlice({
  name: 'spotify',
  initialState,
  reducers: {
    setIsConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    connectSpotifyDemo: (state) => {
      state.isConnected = true;
    },
    disconnectSpotify: (state) => {
      state.isConnected = false;
      state.isPlaying = false;
    },
    setAiDjModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAiDjModalOpen = action.payload;
    },
    playTrack: (state, action: PayloadAction<MusicItem>) => {
      const incoming = action.payload;
      state.currentTrack = incoming;
      state.isPlaying = true;

      // Ensure the playlist has tracks so skipping to next song is always possible
      if (state.currentPlaylist.length > 1 && state.currentPlaylist.some((t) => t.id === incoming.id)) {
        state.playlistIndex = state.currentPlaylist.findIndex((t) => t.id === incoming.id);
      } else {
        const pool = state.musicForYou.length > 0 ? state.musicForYou : DEFAULT_MUSIC_QUEUE;
        const remaining = pool.filter((t) => t.id !== incoming.id);
        state.currentPlaylist = [incoming, ...remaining];
        state.playlistIndex = 0;
        state.playlistTitle = 'Pulse Flow Queue';
      }
    },
    playPlaylist: (
      state,
      action: PayloadAction<{ playlist: MusicItem[]; startIndex?: number; title?: string }>
    ) => {
      if (action.payload.playlist && action.payload.playlist.length > 0) {
        state.currentPlaylist = action.payload.playlist;
        const index = action.payload.startIndex ?? 0;
        state.playlistIndex = Math.max(0, Math.min(index, action.payload.playlist.length - 1));
        state.currentTrack = action.payload.playlist[state.playlistIndex];
        state.playlistTitle = action.payload.title;
        state.isPlaying = true;
      }
    },
    nextTrack: (state) => {
      // If queue is empty or has only 1 track, populate with diverse queue
      if (state.currentPlaylist.length <= 1) {
        const pool = state.musicForYou.length > 0 ? state.musicForYou : DEFAULT_MUSIC_QUEUE;
        const currentId = state.currentTrack?.id;
        const remaining = pool.filter((t) => t.id !== currentId);
        state.currentPlaylist = [state.currentTrack || pool[0], ...remaining];
        state.playlistIndex = 0;
      }

      if (state.currentPlaylist.length > 0) {
        const nextIdx = (state.playlistIndex + 1) % state.currentPlaylist.length;
        state.playlistIndex = nextIdx;
        state.currentTrack = state.currentPlaylist[nextIdx];
        state.isPlaying = true;
      }
    },
    prevTrack: (state) => {
      if (state.currentPlaylist.length <= 1) {
        const pool = state.musicForYou.length > 0 ? state.musicForYou : DEFAULT_MUSIC_QUEUE;
        const currentId = state.currentTrack?.id;
        const remaining = pool.filter((t) => t.id !== currentId);
        state.currentPlaylist = [state.currentTrack || pool[0], ...remaining];
        state.playlistIndex = 0;
      }

      if (state.currentPlaylist.length > 0) {
        const prevIdx = (state.playlistIndex - 1 + state.currentPlaylist.length) % state.currentPlaylist.length;
        state.playlistIndex = prevIdx;
        state.currentTrack = state.currentPlaylist[prevIdx];
        state.isPlaying = true;
      }
    },
    pauseTrack: (state) => {
      state.isPlaying = false;
    },
    resumeTrack: (state) => {
      if (state.currentTrack) {
        state.isPlaying = true;
      }
    },
    togglePlayback: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    closePlayer: (state) => {
      state.isPlaying = false;
      state.currentTrack = null;
      state.currentPlaylist = [];
      state.playlistIndex = 0;
    },
    saveAiPlaylist: (state, action: PayloadAction<AiMoodPlaylist>) => {
      state.savedPlaylists = [
        action.payload,
        ...state.savedPlaylists.filter((p) => p.id !== action.payload.id),
      ];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('pulse_ai_playlists', JSON.stringify(state.savedPlaylists));
        } catch {}
      }
    },
    deleteAiPlaylist: (state, action: PayloadAction<string>) => {
      state.savedPlaylists = state.savedPlaylists.filter((p) => p.id !== action.payload);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('pulse_ai_playlists', JSON.stringify(state.savedPlaylists));
        } catch {}
      }
    },
    loadSavedPlaylists: (state, action: PayloadAction<AiMoodPlaylist[]>) => {
      state.savedPlaylists = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpotifyStatus.fulfilled, (state, action) => {
        state.isConnected = action.payload;
      })
      .addCase(fetchNowPlaying.fulfilled, (state, action) => {
        state.nowPlaying = action.payload;
      })
      .addCase(fetchMusicForYou.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMusicForYou.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.musicForYou = action.payload;
      })
      .addCase(fetchMusicForYou.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const {
  setIsConnected,
  connectSpotifyDemo,
  disconnectSpotify,
  setAiDjModalOpen,
  playTrack,
  playPlaylist,
  nextTrack,
  prevTrack,
  pauseTrack,
  resumeTrack,
  togglePlayback,
  setVolume,
  closePlayer,
  saveAiPlaylist,
  deleteAiPlaylist,
  loadSavedPlaylists,
} = spotifySlice.actions;

export default spotifySlice.reducer;
