import { Middleware } from "@reduxjs/toolkit";
import rootReducer, { RootState } from "./rootReducer";
import { ContentItem } from "@/types";
const KEYS = {
  preferences: "pulse_preferences_v2",
  favorites: "pulse_favorites_v2",
  order: "pulse_feed_order_v2",
  profile: "pulse_demo_profile",
};
export const persistMiddleware: Middleware<object, RootState> =
  (store) => (next) => (action) => {
    const result = next(action);
    if (typeof window === "undefined") return result;
    try {
      const state = store.getState();
      const type = (action as { type: string }).type;
      if (type.startsWith("preferences/"))
        localStorage.setItem(
          KEYS.preferences,
          JSON.stringify(state.preferences),
        );
      if (type.startsWith("favorites/"))
        localStorage.setItem(
          KEYS.favorites,
          JSON.stringify(state.favorites.favoriteItems),
        );
      if (
        [
          "feed/reorderFeedItems",
          "feed/moveItem",
          "feed/resetFeedOrder",
        ].includes(type)
      )
        localStorage.setItem(
          KEYS.order,
          JSON.stringify(state.feed.customOrderIds),
        );
    } catch {
      /* Storage may be disabled or full; the current session still works. */
    }
    return result;
  };
export function loadPersistedState(): Partial<RootState> {
  if (typeof window === "undefined") return {};
  const defaults = rootReducer(undefined, { type: "@@init" });
  const read = (key: string): unknown => {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  };
  const raw = read(KEYS.preferences);
  const pref =
    raw && typeof raw === "object"
      ? (raw as Partial<RootState["preferences"]>)
      : {};
  const validCategories = new Set([
    "technology",
    "finance",
    "sports",
    "entertainment",
    "health",
    "science",
    "space",
  ]);
  const validTypes = new Set([
    "news",
    "recommendation",
    "music",
    "social",
    "apod",
  ]);
  const preferences = { ...defaults.preferences, ...pref };
  preferences.favoriteCategories =
    Array.isArray(pref.favoriteCategories) && pref.favoriteCategories.length
      ? pref.favoriteCategories.filter((c) => validCategories.has(c))
      : defaults.preferences.favoriteCategories;
  preferences.favoriteTypes =
    Array.isArray(pref.favoriteTypes) && pref.favoriteTypes.length
      ? pref.favoriteTypes.filter((t) => validTypes.has(t))
      : defaults.preferences.favoriteTypes;
  preferences.theme = ["light", "dark", "system"].includes(pref.theme || "")
    ? pref.theme!
    : defaults.preferences.theme;
  preferences.language = pref.language === "hi" ? "hi" : "en";
  const favorites = read(KEYS.favorites);
  const favoriteItems: ContentItem[] = Array.isArray(favorites)
    ? favorites.filter(
        (i) =>
          i &&
          typeof i.id === "string" &&
          typeof i.title === "string" &&
          typeof i.summary === "string" &&
          validTypes.has(i.type),
      )
    : [];
  const order = read(KEYS.order);
  const customOrderIds: string[] = Array.isArray(order)
    ? order.filter((i) => typeof i === "string")
    : [];
  const profile = read(KEYS.profile);
  const user =
    profile &&
    typeof profile === "object" &&
    "name" in profile &&
    typeof profile.name === "string" &&
    "email" in profile &&
    typeof profile.email === "string"
      ? {
          ...defaults.auth.user,
          ...profile,
          name: profile.name as string,
          email: profile.email as string,
        }
      : defaults.auth.user;
  return {
    preferences,
    favorites: { favoriteItems, favoriteIds: favoriteItems.map((i) => i.id) },
    feed: { ...defaults.feed, customOrderIds },
    auth: {
      ...defaults.auth,
      user,
      isAuthenticated: localStorage.getItem("pulse_signed_out") !== "true",
    },
  };
}
