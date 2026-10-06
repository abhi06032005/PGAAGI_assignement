"use client";
import React, { useState, useEffect, useSyncExternalStore } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./store";
import { useAppSelector } from "./hooks";
import { SessionProvider } from "next-auth/react";
import i18n from "@/lib/i18n";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "./hooks";
import { setIsConnected } from "@/features/spotify/spotifySlice";

function PreferenceSync() {
  const { theme, language } = useAppSelector((s) => s.preferences);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () =>
      document.documentElement.classList.toggle(
        "dark",
        theme === "dark" || (theme === "system" && media.matches),
      );
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [theme]);
  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
  }, [language]);
  return null;
}

function SessionSync() {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (session?.user) {
      const userObj = session.user as Record<string, unknown>;
      if (userObj.isSpotifyConnected) {
        dispatch(setIsConnected(true));
      }
    }
  }, [session, dispatch]);

  return null;
}

const subscribe = () => () => {};
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => makeStore());
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return (
    <SessionProvider>
      <Provider store={store}>
        <PreferenceSync />
        <SessionSync />
        {ready ? (
          children
        ) : (
          <div className="min-h-screen grid place-items-center" role="status">
            Loading your space…
          </div>
        )}
      </Provider>
    </SessionProvider>
  );
}
export default StoreProvider;
