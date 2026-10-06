import { createAsyncThunk } from "@reduxjs/toolkit";
import { UserProfile } from "@/types";
import type { RootState } from "@/store/store";
const KEY = "pulse_demo_profile";
// Deliberate browser-only mock authentication. Never store passwords.
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    credentials: { email: string; password: string; name?: string },
    { rejectWithValue },
  ) => {
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email) ||
      credentials.password.length < 6
    )
      return rejectWithValue(
        "Enter a valid email and a password of at least 6 characters.",
      );
    const user: UserProfile = {
      id: "local-" + credentials.email.toLowerCase(),
      name: credentials.name?.trim() || credentials.email.split("@")[0],
      email: credentials.email,
      handle: "@" + credentials.email.split("@")[0],
      bio: "Curious about a little bit of everything.",
      avatar: "",
      joinedDate: "Joined " + new Date().getFullYear(),
      isAuthenticated: true,
    };
    localStorage.removeItem("pulse_signed_out");
    localStorage.setItem(KEY, JSON.stringify(user));
    return user;
  },
);
export const checkAuthSession = createAsyncThunk(
  "auth/checkAuthSession",
  async () => {
    const raw = localStorage.getItem(KEY);
    if (!raw) throw new Error("No demo session");
    return JSON.parse(raw) as UserProfile;
  },
);
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  localStorage.removeItem(KEY);
  localStorage.setItem("pulse_signed_out", "true");
  return true;
});
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (updates: Partial<UserProfile>, { getState, rejectWithValue }) => {
    if (updates.name !== undefined && !updates.name.trim())
      return rejectWithValue("Please enter your name.");
    const user = { ...(getState() as RootState).auth.user, ...updates };
    localStorage.setItem(KEY, JSON.stringify(user));
    return user;
  },
);
