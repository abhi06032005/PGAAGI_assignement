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
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/cb/7b/a9/cb7ba903-b5f1-cc21-90db-7a81b7aa0997/724596951057.jpg/600x600bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/24/09/79/2409794c-3d5d-af26-580e-7dc00ee4f207/mzaf_369629549966021675.plus.aac.p.m4a',
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
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/600x600bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/11/71/d6/1171d6ad-3c96-e027-2af6-58028426588c/mzaf_15137631797407745471.plus.aac.p.m4a',
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
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4f/13/65/4f1365b0-e97c-c469-c438-2f7d8f204355/872133025584_cover.jpg/600x600bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/33/bb/1a/33bb1a1a-1448-3118-6891-639e61784145/mzaf_3810752549913623044.plus.aac.p.m4a',
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
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/be/da/ec/bedaec4f-ed05-3fde-f131-e47fba90ca7e/00602567548744.rgb.jpg/600x600bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e1/71/79/e17179d4-9b2b-d754-8391-3bac6ffc5d01/mzaf_3594546411583999729.plus.aac.p.m4a',
    durationMs: 279000,
    tags: ['Downtempo', 'Chill', 'Dreamy'],
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
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/be/f1/d0/bef1d063-ed73-bd7d-3899-2217762cdcda/5054429005721.png/600x600bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/7b/50/f2/7b50f2d2-4ead-9f1c-986f-a780d26a9d12/mzaf_3026587138333977214.plus.aac.p.m4a',
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
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/46/be/ed/46beed8a-5d0f-1077-cbeb-aace15e69f44/cover.jpg/600x600bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/13/7c/57/137c5718-36e5-25d7-28cb-0176f3940f6d/mzaf_11229413559193556845.plus.aac.p.m4a',
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
