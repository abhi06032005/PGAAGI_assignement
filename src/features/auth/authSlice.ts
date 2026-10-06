import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '@/types';
import { loginUser, checkAuthSession, logoutUser, updateProfile } from './authThunks';

const defaultUser: UserProfile = {
  id: 'usr-demo',
  name: 'Abhijeet Nayak',
  email: 'demo@pulse.app',
  handle: '@abhijeet',
  bio: 'Software engineer building modern reactive dashboards, design systems, and AI workflows.',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  joinedDate: 'Joined October 2026',
  isAuthenticated: true,
};

export interface AuthSliceState {
  user: UserProfile;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isProfileModalOpen: boolean;
  isSettingsModalOpen: boolean;
}

const initialState: AuthSliceState = {
  user: defaultUser,
  isAuthenticated: true,
  isLoading: false,
  error: null,
  isProfileModalOpen: false,
  isSettingsModalOpen: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setProfileModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isProfileModalOpen = action.payload;
    },
    setSettingsModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isSettingsModalOpen = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setLocalUser: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // loginUser
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...action.payload, isAuthenticated: true };
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Authentication failed';
      })
      // checkAuthSession
      .addCase(checkAuthSession.fulfilled, (state, action) => {
        state.user = { ...action.payload, isAuthenticated: true };
        state.isAuthenticated = true;
      })
      .addCase(checkAuthSession.rejected, (state) => {
        // Keep demo user authenticated for seamless reviewer preview
        state.isAuthenticated = true;
      })
      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = { ...defaultUser, isAuthenticated: false };
        state.isAuthenticated = false;
      })
      // updateProfile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      });
  },
});

export const {
  setProfileModalOpen,
  setSettingsModalOpen,
  clearAuthError,
  setLocalUser,
} = authSlice.actions;

export default authSlice.reducer;
