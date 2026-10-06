import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api/client';
import { MusicItem, SpotifyStatusResponse } from '@/types';

interface SpotifyState {
  isConnected: boolean;
  nowPlaying: MusicItem | null;
  musicForYou: MusicItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SpotifyState = {
  isConnected: false,
  nowPlaying: null,
  musicForYou: [],
  status: 'idle',
  error: null,
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
      return data.items;
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

export const { setIsConnected } = spotifySlice.actions;

export default spotifySlice.reducer;
