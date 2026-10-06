import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api/client';
import { VibeData, VibeLabel } from '@/types';

interface VibeState {
  data: VibeData;
  activeOverride: VibeLabel | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialVibeData: VibeData = {
  primaryVibe: 'Chill',
  secondaryVibe: 'Feel-good',
  description: 'Smooth, relaxed rhythms and atmospheric sounds setting a peaceful cadence.',
  drivingArtists: ['Tycho', 'Bonobo', 'Daft Punk'],
};

const initialState: VibeState = {
  data: initialVibeData,
  activeOverride: null,
  status: 'idle',
  error: null,
};

export const fetchUserVibe = createAsyncThunk(
  'vibe/fetchUserVibe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get<{ success: boolean; vibe: VibeData }>('/api/vibe');
      return res.vibe;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch vibe';
      return rejectWithValue(msg);
    }
  }
);

export const vibeSlice = createSlice({
  name: 'vibe',
  initialState,
  reducers: {
    setVibeOverride: (state, action: PayloadAction<VibeLabel | null>) => {
      state.activeOverride = action.payload;
    },
    resetVibeOverride: (state) => {
      state.activeOverride = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserVibe.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserVibe.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchUserVibe.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { setVibeOverride, resetVibeOverride } = vibeSlice.actions;
export default vibeSlice.reducer;
